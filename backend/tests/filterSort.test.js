import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateAndSanitizeQuery,
  filterProducts,
  sortProducts
} from '../src/utils/filterSort.js';

const mockProducts = [
  { id: 1, name: 'Prod A', category: 'Electronics', price: 100, rating: 4.5, ratingCount: 10 },
  { id: 2, name: 'Prod B', category: 'Clothing', price: 50, rating: 3.5, ratingCount: 20 },
  { id: 3, name: 'Prod C', category: 'Electronics', price: 200, rating: 4.8, ratingCount: 50 },
  { id: 4, name: 'Prod D', category: 'Footwear', price: 80, rating: 2.0, ratingCount: 5 },
  { id: 5, name: 'Prod E', category: 'Footwear', price: 150, rating: 4.2, ratingCount: 30 }
];

const mockBounds = { minPriceBound: 0, maxPriceBound: 500 };

test('validateAndSanitizeQuery: defaults when no params provided', () => {
  const { sanitized, errors } = validateAndSanitizeQuery({}, mockBounds);
  assert.equal(errors.length, 0);
  assert.deepEqual(sanitized.categories, []);
  assert.equal(sanitized.minPrice, 0);
  assert.equal(sanitized.maxPrice, 500);
  assert.equal(sanitized.minRating, 0);
  assert.equal(sanitized.sortBy, 'default');
});

test('validateAndSanitizeQuery: catches invalid inputs', () => {
  const res1 = validateAndSanitizeQuery({ minPrice: 'abc' }, mockBounds);
  assert.ok(res1.errors.some(e => e.includes('minPrice')));

  const res2 = validateAndSanitizeQuery({ minPrice: 300, maxPrice: 100 }, mockBounds);
  assert.ok(res2.errors.some(e => e.includes('minPrice cannot be greater than maxPrice')));

  const res3 = validateAndSanitizeQuery({ minRating: 6 }, mockBounds);
  assert.ok(res3.errors.some(e => e.includes('minRating')));

  const res4 = validateAndSanitizeQuery({ sortBy: 'unknown_sort' }, mockBounds);
  assert.ok(res4.errors.some(e => e.includes('sortBy')));
});

test('filterProducts: category OR logic', () => {
  // Electronics OR Footwear
  const result = filterProducts(mockProducts, {
    categories: ['Electronics', 'Footwear'],
    minPrice: 0,
    maxPrice: 1000,
    minRating: 0
  });

  assert.equal(result.length, 4);
  assert.ok(result.every(p => p.category === 'Electronics' || p.category === 'Footwear'));
});

test('filterProducts: price range filtering', () => {
  const result = filterProducts(mockProducts, {
    categories: [],
    minPrice: 60,
    maxPrice: 160,
    minRating: 0
  });

  // Expected: Prod A (100), Prod D (80), Prod E (150)
  assert.equal(result.length, 3);
  assert.ok(result.every(p => p.price >= 60 && p.price <= 160));
});

test('filterProducts: minimum rating filtering', () => {
  const result = filterProducts(mockProducts, {
    categories: [],
    minPrice: 0,
    maxPrice: 1000,
    minRating: 4.0
  });

  // Expected: Prod A (4.5), Prod C (4.8), Prod E (4.2)
  assert.equal(result.length, 3);
  assert.ok(result.every(p => p.rating >= 4.0));
});

test('filterProducts: combined AND logic across category, price, and rating', () => {
  // Category = Electronics AND Price <= 150 AND Rating >= 4.0
  const result = filterProducts(mockProducts, {
    categories: ['Electronics'],
    minPrice: 0,
    maxPrice: 150,
    minRating: 4.0
  });

  // Only Prod A matches (100, 4.5). Prod C has price 200 so it should be excluded.
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 1);
});

test('sortProducts: price_asc and rating_desc', () => {
  const byPriceAsc = sortProducts(mockProducts, 'price_asc');
  assert.deepEqual(byPriceAsc.map(p => p.price), [50, 80, 100, 150, 200]);

  const byRatingDesc = sortProducts(mockProducts, 'rating_desc');
  assert.deepEqual(byRatingDesc.map(p => p.id), [3, 1, 5, 2, 4]); // 4.8, 4.5, 4.2, 3.5, 2.0
});
