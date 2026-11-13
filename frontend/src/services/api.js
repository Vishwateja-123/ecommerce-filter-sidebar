const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

/**
 * Fetch filtered & sorted products from backend Express API.
 * All filtering and sorting is handled exclusively by the backend.
 * 
 * @param {Object} params
 * @param {string[]} [params.categories]
 * @param {number} [params.minPrice]
 * @param {number} [params.maxPrice]
 * @param {number} [params.minRating]
 * @param {string} [params.sortBy]
 * @param {string} [params.search]
 * @param {AbortSignal} [signal]
 */
export async function fetchProducts(params = {}, signal) {
  const query = new URLSearchParams();

  if (params.categories && params.categories.length > 0) {
    query.set('categories', params.categories.join(','));
  }

  if (params.minPrice !== undefined && params.minPrice !== null) {
    query.set('minPrice', String(params.minPrice));
  }

  if (params.maxPrice !== undefined && params.maxPrice !== null) {
    query.set('maxPrice', String(params.maxPrice));
  }

  if (params.minRating !== undefined && params.minRating !== null && params.minRating > 0) {
    query.set('minRating', String(params.minRating));
  }

  if (params.sortBy && params.sortBy !== 'default') {
    query.set('sortBy', params.sortBy);
  }

  if (params.search && params.search.trim() !== '') {
    query.set('search', params.search.trim());
  }

  const queryString = query.toString();
  const url = `${BASE_URL}/products${queryString ? `?${queryString}` : ''}`;

  const res = await fetch(url, { signal });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch products: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Fetch product metadata (global bounds, all categories)
 */
export async function fetchMeta() {
  const res = await fetch(`${BASE_URL}/products/meta`);
  if (!res.ok) {
    throw new Error(`Failed to fetch metadata: ${res.statusText}`);
  }
  return res.json();
}
