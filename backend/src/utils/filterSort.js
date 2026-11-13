/**
 * filterSort.js
 * 
 * Core filtering, sorting, and validation logic.
 * Enforces:
 * - OR logic across multiple selected categories.
 * - AND logic across different filter types (Category AND Price AND Rating).
 * - "Filter first, then sort" sequence.
 * - Robust input validation and sanitization.
 */

/**
 * Validates and sanitizes raw query parameters.
 * @param {Object} query - Express req.query
 * @param {Object} bounds - { minPriceBound, maxPriceBound }
 * @returns {{ sanitized: Object, errors: string[] }}
 */
export function validateAndSanitizeQuery(query, bounds) {
  const errors = [];
  const sanitized = {
    categories: [],
    minPrice: bounds.minPriceBound,
    maxPrice: bounds.maxPriceBound,
    minRating: 0,
    sortBy: 'default',
    search: ''
  };

  // 1. Categories parsing (can be comma-separated string or array)
  if (query.categories !== undefined && query.categories !== null) {
    let rawCategories = [];
    if (Array.isArray(query.categories)) {
      rawCategories = query.categories;
    } else if (typeof query.categories === 'string') {
      rawCategories = query.categories
        .split(',')
        .map(c => c.trim())
        .filter(Boolean);
    }

    sanitized.categories = rawCategories.map(c => String(c).trim()).filter(Boolean);
  }

  // 2. Price validation & sanitization
  if (query.minPrice !== undefined && query.minPrice !== '') {
    const minP = Number(query.minPrice);
    if (Number.isNaN(minP) || minP < 0) {
      errors.push('minPrice must be a non-negative number.');
    } else {
      sanitized.minPrice = minP;
    }
  }

  if (query.maxPrice !== undefined && query.maxPrice !== '') {
    const maxP = Number(query.maxPrice);
    if (Number.isNaN(maxP) || maxP < 0) {
      errors.push('maxPrice must be a non-negative number.');
    } else {
      sanitized.maxPrice = maxP;
    }
  }

  if (sanitized.minPrice > sanitized.maxPrice) {
    errors.push('minPrice cannot be greater than maxPrice.');
  }

  // 3. Rating validation & sanitization
  if (query.minRating !== undefined && query.minRating !== '') {
    const rating = Number(query.minRating);
    if (Number.isNaN(rating) || rating < 0 || rating > 5) {
      errors.push('minRating must be a number between 0 and 5.');
    } else {
      sanitized.minRating = rating;
    }
  }

  // 4. SortBy validation
  const validSortOptions = ['default', 'price_asc', 'price_desc', 'rating_desc', 'rating_asc'];
  if (query.sortBy) {
    const sortVal = String(query.sortBy).toLowerCase();
    if (validSortOptions.includes(sortVal)) {
      sanitized.sortBy = sortVal;
    } else {
      errors.push(`sortBy must be one of: ${validSortOptions.join(', ')}.`);
    }
  }

  // 5. Search query (optional text filter)
  if (query.search && typeof query.search === 'string') {
    sanitized.search = query.search.trim().toLowerCase();
  }

  return { sanitized, errors };
}

/**
 * Filter products using:
 * - OR logic across selected categories.
 * - AND logic across category, price, and rating.
 * 
 * @param {Array} products 
 * @param {Object} filters 
 * @returns {Array} Filtered products
 */
export function filterProducts(products, filters) {
  const { categories, minPrice, maxPrice, minRating, search } = filters;

  return products.filter(product => {
    // Category filter: OR logic across selected categories
    // If no category is selected, allow all products.
    const matchesCategory =
      categories.length === 0 ||
      categories.some(cat => cat.toLowerCase() === product.category.toLowerCase());

    if (!matchesCategory) return false;

    // Price filter: AND condition (minPrice <= price <= maxPrice)
    const matchesPrice =
      product.price >= minPrice && product.price <= maxPrice;

    if (!matchesPrice) return false;

    // Rating filter: AND condition (product.rating >= minRating)
    const matchesRating = product.rating >= minRating;

    if (!matchesRating) return false;

    // Optional Search filter: AND condition
    if (search) {
      const nameMatch = product.name.toLowerCase().includes(search);
      const descMatch = product.description.toLowerCase().includes(search);
      const brandMatch = product.brand?.toLowerCase().includes(search);
      if (!nameMatch && !descMatch && !brandMatch) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sort products according to the requested sort option.
 * Note: Executed AFTER filtering ("filter first, then sort").
 * 
 * @param {Array} products 
 * @param {string} sortBy 
 * @returns {Array} A newly sorted array
 */
export function sortProducts(products, sortBy) {
  // Create shallow copy to prevent in-place mutation of dataset
  const sorted = [...products];

  switch (sortBy) {
    case 'price_asc':
      return sorted.sort((a, b) => a.price - b.price);

    case 'price_desc':
      return sorted.sort((a, b) => b.price - a.price);

    case 'rating_desc':
      // Primary: Rating descending, Secondary: Review count descending
      return sorted.sort((a, b) => {
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }
        return (b.ratingCount || 0) - (a.ratingCount || 0);
      });

    case 'rating_asc':
      return sorted.sort((a, b) => a.rating - b.rating);

    case 'default':
    default:
      // Return natural order or ID ascending
      return sorted.sort((a, b) => a.id - b.id);
  }
}
