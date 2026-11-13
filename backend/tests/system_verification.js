import assert from 'node:assert/strict';

const BASE_URL = 'http://localhost:5001/api/products';

async function runTests() {
  console.log('🧪 Starting End-to-End System Verification Tests...\n');

  // Test 1: Full inventory without filters
  {
    console.log('Test 1: Default endpoint returns complete 28-item inventory');
    const res = await fetch(BASE_URL);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.count, 28);
    assert.equal(data.products.length, 28);
    console.log('  ✅ Passed: 28 items returned with valid bounds.\n');
  }

  // Test 2: Category OR logic
  {
    console.log('Test 2: Category OR logic across multiple selected categories (Footwear + Clothing)');
    const res = await fetch(`${BASE_URL}?categories=Footwear,Clothing`);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.count, 10); // 5 footwear + 5 clothing
    for (const item of data.products) {
      assert.ok(
        ['Footwear', 'Clothing'].includes(item.category),
        `Unexpected category: ${item.category}`
      );
    }
    console.log('  ✅ Passed: OR logic validated. Exactly 10 items in Footwear OR Clothing.\n');
  }

  // Test 3: Price range filtering (min & max bounds)
  {
    console.log('Test 3: Dual-handle price range ($50 to $200)');
    const res = await fetch(`${BASE_URL}?minPrice=50&maxPrice=200`);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.count > 0);
    for (const item of data.products) {
      assert.ok(
        item.price >= 50 && item.price <= 200,
        `Price out of bounds: $${item.price}`
      );
    }
    console.log(`  ✅ Passed: Dual price filter validated on ${data.count} items.\n`);
  }

  // Test 4: Rating radio filter (minRating = 4.5)
  {
    console.log('Test 4: Customer rating filter (>= 4.5 Stars)');
    const res = await fetch(`${BASE_URL}?minRating=4.5`);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.count > 0);
    for (const item of data.products) {
      assert.ok(
        item.rating >= 4.5,
        `Rating below threshold: ${item.rating}`
      );
    }
    console.log(`  ✅ Passed: Rating threshold validated on ${data.count} items.\n`);
  }

  // Test 5: AND logic across different filters
  {
    console.log('Test 5: Combined AND logic across Category + Price + Rating');
    // Electronics AND $300-$500 AND >= 4.5
    const res = await fetch(
      `${BASE_URL}?categories=Electronics&minPrice=300&maxPrice=500&minRating=4.5`
    );
    const data = await res.json();
    assert.equal(data.success, true);
    for (const item of data.products) {
      assert.equal(item.category, 'Electronics');
      assert.ok(item.price >= 300 && item.price <= 500);
      assert.ok(item.rating >= 4.5);
    }
    console.log(`  ✅ Passed: Multi-filter AND logic verified (${data.count} matches).\n`);
  }

  // Test 6: Sort By Price: Low to High
  {
    console.log('Test 6: Sort By Price Low to High (price_asc)');
    const res = await fetch(`${BASE_URL}?sortBy=price_asc`);
    const data = await res.json();
    assert.equal(data.success, true);
    for (let i = 1; i < data.products.length; i++) {
      assert.ok(
        data.products[i].price >= data.products[i - 1].price,
        `Sorting order violated at index ${i}: $${data.products[i].price} < $${data.products[i - 1].price}`
      );
    }
    console.log(`  ✅ Passed: Ascending price order verified from $${data.products[0].price} to $${data.products[data.products.length - 1].price}.\n`);
  }

  // Test 7: Sort By Top Rated First
  {
    console.log('Test 7: Sort By Top Rated First (rating_desc)');
    const res = await fetch(`${BASE_URL}?sortBy=rating_desc`);
    const data = await res.json();
    assert.equal(data.success, true);
    for (let i = 1; i < data.products.length; i++) {
      assert.ok(
        data.products[i].rating <= data.products[i - 1].rating,
        `Sorting order violated at index ${i}`
      );
    }
    console.log(`  ✅ Passed: Top rated first order verified (top rating: ${data.products[0].rating}).\n`);
  }

  // Test 8: Filter first, then sort
  {
    console.log('Test 8: Filter first, then sort sequence');
    const categoryParam = encodeURIComponent('Home & Kitchen');
    const res = await fetch(`${BASE_URL}?categories=${categoryParam}&sortBy=price_asc`);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.count, 5);
    for (let i = 1; i < data.products.length; i++) {
      assert.equal(data.products[i].category, 'Home & Kitchen');
      assert.ok(data.products[i].price >= data.products[i - 1].price);
    }
    console.log('  ✅ Passed: Correctly filtered to category first, then sorted by price.\n');
  }

  // Test 9: No results scenario
  {
    console.log('Test 9: No-results scenario with impossible filter combo');
    const res = await fetch(`${BASE_URL}?categories=Footwear&minPrice=900&maxPrice=1000`);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.count, 0);
    assert.equal(data.products.length, 0);
    console.log('  ✅ Passed: Returns empty products array with count 0.\n');
  }

  // Test 10: Input validation errors (400 Bad Request)
  {
    console.log('Test 10: Backend input validation prevents illegal queries');
    const res = await fetch(`${BASE_URL}?minPrice=999&maxPrice=50`);
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.ok(data.errors.length > 0);
    console.log('  ✅ Passed: Express backend rejected minPrice > maxPrice with 400.\n');
  }

  console.log('🎉 ALL 10 SYSTEM VERIFICATION TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
