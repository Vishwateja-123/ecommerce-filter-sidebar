import React from 'react';
import ProductCard from './ProductCard';
import EmptyState from './EmptyState';

export default function ProductGrid({
  products = [],
  loading = false,
  error = null,
  onResetFilters
}) {
  if (error) {
    return (
      <div className="error-banner">
        <p className="error-text">Failed to load products: {error}</p>
        <button
          type="button"
          className="btn-retry"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading && products.length === 0) {
    return (
      <div className="product-grid">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="product-card skeleton-card">
            <div className="skeleton-image" />
            <div className="skeleton-content">
              <div className="skeleton-line short" />
              <div className="skeleton-line title" />
              <div className="skeleton-line medium" />
              <div className="skeleton-line footer" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!loading && products.length === 0) {
    return <EmptyState onReset={onResetFilters} />;
  }

  return (
    <div className={`product-grid-wrapper ${loading ? 'grid-refreshing' : ''}`}>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
