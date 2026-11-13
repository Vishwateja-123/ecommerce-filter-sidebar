import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/server.js';

let server;
let baseUrl;

test.before(() => {
  return new Promise((resolve) => {
    // Listen on dynamic ephemeral port
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

test.after(() => {
  return new Promise((resolve) => {
    server.close(resolve);
  });
});

test('HTTP GET /health returns 200 OK', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'ok');
});

test('HTTP GET /api/products returns all 28 products by default', async () => {
  const res = await fetch(`${baseUrl}/api/products`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.count, 28);
  assert.equal(data.products.length, 28);
  assert.ok(data.bounds.minPrice <= data.bounds.maxPrice);
  assert.ok(data.availableCategories.length > 0);
});

test('HTTP GET /api/products?categories=Footwear,Clothing returns only matching items', async () => {
  const res = await fetch(`${baseUrl}/api/products?categories=Footwear,Clothing`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.count > 0);
  for (const p of data.products) {
    assert.ok(['Footwear', 'Clothing'].includes(p.category));
  }
});

test('HTTP GET /api/products with price & rating filters & sorting', async () => {
  const res = await fetch(`${baseUrl}/api/products?minPrice=50&maxPrice=300&minRating=4.5&sortBy=price_asc`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);

  for (let i = 0; i < data.products.length; i++) {
    const p = data.products[i];
    assert.ok(p.price >= 50 && p.price <= 300);
    assert.ok(p.rating >= 4.5);
    if (i > 0) {
      assert.ok(p.price >= data.products[i - 1].price);
    }
  }
});

test('HTTP GET /api/products returns 400 Bad Request on invalid minPrice > maxPrice', async () => {
  const res = await fetch(`${baseUrl}/api/products?minPrice=500&maxPrice=100`);
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.ok(data.errors.length > 0);
});

test('HTTP GET /api/products/meta returns metadata', async () => {
  const res = await fetch(`${baseUrl}/api/products/meta`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.totalCount, 28);
  assert.ok(data.categories.length >= 5);
});
