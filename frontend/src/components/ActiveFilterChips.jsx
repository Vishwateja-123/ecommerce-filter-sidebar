import React from 'react';
import { X, RotateCcw } from 'lucide-react';

export default function ActiveFilterChips({
  selectedCategories = [],
  onRemoveCategory,
  currentPriceRange,
  priceBounds,
  onResetPrice,
  selectedRating,
  onResetRating,
  searchQuery,
  onClearSearch,
  onResetAll
}) {
  const isPriceFiltered =
    currentPriceRange.minVal !== priceBounds.min ||
    currentPriceRange.maxVal !== priceBounds.max;

  const hasAny =
    selectedCategories.length > 0 ||
    isPriceFiltered ||
    selectedRating > 0 ||
    Boolean(searchQuery);

  if (!hasAny) return null;

  return (
    <div className="active-filters-bar">
      <span className="active-filters-label">Active:</span>

      <div className="chips-container">
        {/* Search query chip */}
        {searchQuery && (
          <span className="filter-chip">
            <span>Search: "{searchQuery}"</span>
            <button
              type="button"
              onClick={onClearSearch}
              className="chip-remove-btn"
              aria-label="Remove search filter"
            >
              <X size={13} />
            </button>
          </span>
        )}

        {/* Categories chips */}
        {selectedCategories.map((cat) => (
          <span key={cat} className="filter-chip">
            <span>Category: {cat}</span>
            <button
              type="button"
              onClick={() => onRemoveCategory(cat)}
              className="chip-remove-btn"
              aria-label={`Remove category filter for ${cat}`}
            >
              <X size={13} />
            </button>
          </span>
        ))}

        {/* Price range chip */}
        {isPriceFiltered && (
          <span className="filter-chip">
            <span>
              Price: ${currentPriceRange.minVal} - ${currentPriceRange.maxVal}
            </span>
            <button
              type="button"
              onClick={onResetPrice}
              className="chip-remove-btn"
              aria-label="Reset price filter"
            >
              <X size={13} />
            </button>
          </span>
        )}

        {/* Rating chip */}
        {selectedRating > 0 && (
          <span className="filter-chip">
            <span>Rating: {selectedRating}★ & up</span>
            <button
              type="button"
              onClick={onResetRating}
              className="chip-remove-btn"
              aria-label="Remove rating filter"
            >
              <X size={13} />
            </button>
          </span>
        )}

        {/* Clear all link */}
        <button
          type="button"
          className="btn-clear-all-chips"
          onClick={onResetAll}
        >
          <RotateCcw size={12} />
          <span>Clear all</span>
        </button>
      </div>
    </div>
  );
}
