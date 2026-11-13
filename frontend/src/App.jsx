import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ShoppingBag,
  SlidersHorizontal,
  Search,
  RotateCcw,
  Sparkles,
  Server,
  Layers
} from 'lucide-react';
import { fetchProducts, fetchMeta } from './services/api';
import FilterSidebar from './components/FilterSidebar';
import ProductGrid from './components/ProductGrid';
import SortDropdown from './components/SortDropdown';
import ActiveFilterChips from './components/ActiveFilterChips';
import './App.css';

export default function App() {
  // Global metadata loaded from backend
  const [categories, setCategories] = useState([]);
  const [priceBounds, setPriceBounds] = useState({ min: 0, max: 1000 });
  const [isMetaLoaded, setIsMetaLoaded] = useState(false);

  // Active filter states
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [currentPriceRange, setCurrentPriceRange] = useState({ minVal: 0, maxVal: 1000 });
  const [selectedRating, setSelectedRating] = useState(0);
  const [sortBy, setSortBy] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');

  // Results & UI states
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Debounce timer ref for slider interactions
  const debounceTimerRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Initial metadata fetch
  useEffect(() => {
    let isMounted = true;

    async function loadInitialMetadata() {
      try {
        const meta = await fetchMeta();
        if (isMounted && meta.success) {
          const bounds = {
            min: meta.bounds.minPrice,
            max: meta.bounds.maxPrice
          };
          setCategories(meta.categories);
          setPriceBounds(bounds);
          setCurrentPriceRange({ minVal: bounds.min, maxVal: bounds.max });
          setIsMetaLoaded(true);
        }
      } catch (err) {
        console.warn('Metadata endpoint failed, fallback will load via products query:', err);
        setIsMetaLoaded(true); // Allow products fetch to populate
      }
    }

    loadInitialMetadata();
    return () => {
      isMounted = false;
    };
  }, []);

  // Main fetch function: delegates ALL filtering and sorting to backend
  const executeQuery = useCallback(async (filtersToApply) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const data = await fetchProducts(filtersToApply, abortControllerRef.current.signal);

      if (data.success) {
        setProducts(data.products);
        setTotalCount(data.count);

        // Keep category counts updated from backend
        if (data.availableCategories && data.availableCategories.length > 0) {
          setCategories(data.availableCategories);
        }
        if (data.bounds && !isMetaLoaded) {
          setPriceBounds({ min: data.bounds.minPrice, max: data.bounds.maxPrice });
        }
      } else {
        throw new Error(data.message || 'Failed to retrieve products');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Fetch products error:', err);
        setError(err.message || 'An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, [isMetaLoaded]);

  // Synchronize state changes with backend query execution
  useEffect(() => {
    if (!isMetaLoaded) return;

    // Clear previous pending debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const payload = {
      categories: selectedCategories,
      minPrice: currentPriceRange.minVal,
      maxPrice: currentPriceRange.maxVal,
      minRating: selectedRating,
      sortBy,
      search: searchQuery
    };

    // Fast-path: 200ms debounce for smooth dragging, instant for clicks
    debounceTimerRef.current = setTimeout(() => {
      executeQuery(payload);
    }, 180);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [
    isMetaLoaded,
    selectedCategories,
    currentPriceRange.minVal,
    currentPriceRange.maxVal,
    selectedRating,
    sortBy,
    searchQuery,
    executeQuery
  ]);

  // Handler: Category Toggle (OR logic inside category selection)
  const handleCategoryToggle = (catName) => {
    setSelectedCategories((prev) =>
      prev.includes(catName)
        ? prev.filter((item) => item !== catName)
        : [...prev, catName]
    );
  };

  const handleClearCategories = () => {
    setSelectedCategories([]);
  };

  // Handler: Price Change
  const handlePriceChange = ({ minVal, maxVal }) => {
    setCurrentPriceRange({ minVal, maxVal });
  };

  const handleResetPrice = () => {
    setCurrentPriceRange({ minVal: priceBounds.min, maxVal: priceBounds.max });
  };

  // Handler: Rating Change
  const handleRatingChange = (rating) => {
    setSelectedRating(rating);
  };

  const handleResetRating = () => {
    setSelectedRating(0);
  };

  // Handler: Sort Change
  const handleSortChange = (newSort) => {
    setSortBy(newSort);
  };

  // Handler: Search Query Change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Handler: Reset All Filters to Defaults (shows all products)
  const handleResetAll = () => {
    setSelectedCategories([]);
    setCurrentPriceRange({ minVal: priceBounds.min, maxVal: priceBounds.max });
    setSelectedRating(0);
    setSearchQuery('');
    setSortBy('default');
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    currentPriceRange.minVal !== priceBounds.min ||
    currentPriceRange.maxVal !== priceBounds.max ||
    selectedRating > 0 ||
    Boolean(searchQuery) ||
    sortBy !== 'default';

  return (
    <div className="app-container">
      {/* Top Application Header */}
      <header className="navbar">
        <div className="navbar-content">
          <div className="navbar-brand">
            <div className="brand-logo-badge">
              <ShoppingBag size={22} className="brand-icon" />
            </div>
            <div className="brand-titles">
              <h1 className="brand-name">ShopFilter</h1>
              <span className="brand-tagline">Multi-Filter E-Commerce</span>
            </div>
          </div>

          {/* Search bar */}
          <div className="search-bar-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search products, brands, descriptions..."
              value={searchQuery}
              onChange={handleSearchChange}
              aria-label="Search products"
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={handleClearSearch}
                aria-label="Clear search text"
              >
                ✕
              </button>
            )}
          </div>

          <div className="navbar-badge-info">
            <span className="backend-badge">
              <Server size={14} />
              <span>Backend Filtered</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Page Layout */}
      <main className="main-layout">
        {/* Sticky Filter Sidebar */}
        <FilterSidebar
          categories={categories}
          selectedCategories={selectedCategories}
          onCategoryToggle={handleCategoryToggle}
          onClearCategories={handleClearCategories}
          priceBounds={priceBounds}
          currentPriceRange={currentPriceRange}
          onPriceChange={handlePriceChange}
          selectedRating={selectedRating}
          onRatingChange={handleRatingChange}
          onResetAll={handleResetAll}
          hasActiveFilters={hasActiveFilters}
          isOpenOnMobile={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Products Content Section */}
        <section className="products-content-area">
          {/* Subheader: Mobile Filter Trigger, Results Count, and Sort Dropdown */}
          <div className="controls-bar">
            <div className="controls-left">
              <button
                type="button"
                className="btn-mobile-filter-trigger"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <SlidersHorizontal size={16} />
                <span>Filters {selectedCategories.length > 0 ? `(${selectedCategories.length})` : ''}</span>
              </button>

              <div className="results-counter">
                {loading ? (
                  <span className="counter-text loading-pulse">Updating products...</span>
                ) : (
                  <span className="counter-text">
                    Showing <strong>{products.length}</strong> {products.length === 1 ? 'product' : 'products'}
                  </span>
                )}
              </div>
            </div>

            <div className="controls-right">
              <SortDropdown value={sortBy} onChange={handleSortChange} />
            </div>
          </div>

          {/* Active Filter Chips */}
          <ActiveFilterChips
            selectedCategories={selectedCategories}
            onRemoveCategory={handleCategoryToggle}
            currentPriceRange={currentPriceRange}
            priceBounds={priceBounds}
            onResetPrice={handleResetPrice}
            selectedRating={selectedRating}
            onResetRating={handleResetRating}
            searchQuery={searchQuery}
            onClearSearch={handleClearSearch}
            onResetAll={handleResetAll}
          />

          {/* Product Grid / Cards / Empty State */}
          <ProductGrid
            products={products}
            loading={loading}
            error={error}
            onResetFilters={handleResetAll}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>
          ShopFilter E-Commerce Engine • Built with React 19, Vite, Express, and Node.js
        </p>
      </footer>
    </div>
  );
}
