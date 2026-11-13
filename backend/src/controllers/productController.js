import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  validateAndSanitizeQuery,
  filterProducts,
  sortProducts
} from '../utils/filterSort.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load inventory from JSON
const productsFilePath = path.join(__dirname, '../data/products.json');
const rawData = fs.readFileSync(productsFilePath, 'utf-8');
const allProducts = JSON.parse(rawData);

// Compute inventory bounds once
const prices = allProducts.map(p => p.price);
const minPriceBound = Math.floor(Math.min(...prices));
const maxPriceBound = Math.ceil(Math.max(...prices));

// Calculate category counts
const categoryMap = allProducts.reduce((acc, p) => {
  acc[p.category] = (acc[p.category] || 0) + 1;
  return acc;
}, {});

const availableCategories = Object.keys(categoryMap).map(category => ({
  name: category,
  count: categoryMap[category]
}));

/**
 * Controller: GET /api/products
 * Query Params supported:
 * - categories: comma-separated string or array
 * - minPrice: number
 * - maxPrice: number
 * - minRating: number (1-5)
 * - sortBy: 'default' | 'price_asc' | 'price_desc' | 'rating_desc' | 'rating_asc'
 * - search: string
 */
export function getProducts(req, res) {
  try {
    const bounds = { minPriceBound, maxPriceBound };

    // 1. Backend validation & sanitization
    const { sanitized, errors } = validateAndSanitizeQuery(req.query, bounds);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filter or sort parameters provided.',
        errors
      });
    }

    // 2. Filter first (OR logic for categories, AND logic across filters)
    const filtered = filterProducts(allProducts, sanitized);

    // 3. Sort second
    const sorted = sortProducts(filtered, sanitized.sortBy);

    // 4. Return results with full metadata for client UI
    return res.status(200).json({
      success: true,
      count: sorted.length,
      totalInventoryCount: allProducts.length,
      bounds: {
        minPrice: minPriceBound,
        maxPrice: maxPriceBound
      },
      availableCategories,
      appliedFilters: sanitized,
      products: sorted
    });
  } catch (error) {
    console.error('Error in getProducts controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while processing products query.'
    });
  }
}

/**
 * Controller: GET /api/products/meta
 * Returns inventory metadata (bounds, categories, total items)
 */
export function getProductsMeta(req, res) {
  return res.status(200).json({
    success: true,
    totalCount: allProducts.length,
    bounds: {
      minPrice: minPriceBound,
      maxPrice: maxPriceBound
    },
    categories: availableCategories
  });
}
