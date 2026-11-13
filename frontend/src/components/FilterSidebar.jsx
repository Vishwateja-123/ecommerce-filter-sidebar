import React from 'react';
import { Filter, RotateCcw, X, SlidersHorizontal, Check } from 'lucide-react';
import DualRangeSlider from './DualRangeSlider';
import RatingFilter from './RatingFilter';

export default function FilterSidebar({
  categories = [],
  selectedCategories = [],
  onCategoryToggle,
  onClearCategories,
  priceBounds = { min: 0, max: 1000 },
  currentPriceRange = { minVal: 0, maxVal: 1000 },
  onPriceChange,
  selectedRating = 0,
  onRatingChange,
  onResetAll,
  hasActiveFilters = false,
  isOpenOnMobile = false,
  onCloseMobile
}) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenOnMobile && (
        <div
          className="sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside className={`filter-sidebar ${isOpenOnMobile ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-title-row">
            <SlidersHorizontal size={20} className="title-icon" />
            <h2 className="sidebar-heading">Filters</h2>
          </div>

          <div className="sidebar-header-actions">
            {hasActiveFilters && (
              <button
                type="button"
                className="btn-reset-link"
                onClick={onResetAll}
                title="Reset all filters to default"
              >
                <RotateCcw size={14} />
                <span>Reset All</span>
              </button>
            )}

            {/* Mobile Close Button */}
            <button
              type="button"
              className="btn-mobile-close"
              onClick={onCloseMobile}
              aria-label="Close filters"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="sidebar-scrollable-content">
          {/* 1. Category Section */}
          <section className="filter-section">
            <div className="section-header">
              <h3 className="section-title">Categories</h3>
              {selectedCategories.length > 0 && (
                <button
                  type="button"
                  className="section-clear-btn"
                  onClick={onClearCategories}
                >
                  Clear ({selectedCategories.length})
                </button>
              )}
            </div>

            <div className="category-list">
              {categories.map(cat => {
                const isChecked = selectedCategories.includes(cat.name);
                return (
                  <label key={cat.name} className="category-checkbox-label">
                    <input
                      type="checkbox"
                      className="category-checkbox"
                      checked={isChecked}
                      onChange={() => onCategoryToggle(cat.name)}
                    />
                    <span className="custom-checkbox">
                      {isChecked && <Check size={14} strokeWidth={3} />}
                    </span>
                    <span className="category-name">{cat.name}</span>
                    <span className="category-count">{cat.count}</span>
                  </label>
                );
              })}
            </div>
          </section>

          <hr className="sidebar-divider" />

          {/* 2. Price Range Section */}
          <section className="filter-section">
            <div className="section-header">
              <h3 className="section-title">Price Range</h3>
              {(currentPriceRange.minVal !== priceBounds.min ||
                currentPriceRange.maxVal !== priceBounds.max) && (
                <button
                  type="button"
                  className="section-clear-btn"
                  onClick={() =>
                    onPriceChange({ minVal: priceBounds.min, maxVal: priceBounds.max })
                  }
                >
                  Reset
                </button>
              )}
            </div>

            <DualRangeSlider
              min={priceBounds.min}
              max={priceBounds.max}
              minVal={currentPriceRange.minVal}
              maxVal={currentPriceRange.maxVal}
              onChange={onPriceChange}
            />
          </section>

          <hr className="sidebar-divider" />

          {/* 3. Rating Section */}
          <section className="filter-section">
            <div className="section-header">
              <h3 className="section-title">Customer Rating</h3>
              {selectedRating > 0 && (
                <button
                  type="button"
                  className="section-clear-btn"
                  onClick={() => onRatingChange(0)}
                >
                  Clear
                </button>
              )}
            </div>

            <RatingFilter
              selectedRating={selectedRating}
              onChange={onRatingChange}
            />
          </section>
        </div>

        {/* Bottom Reset Action for convenience */}
        {hasActiveFilters && (
          <div className="sidebar-footer">
            <button
              type="button"
              className="btn-reset-full"
              onClick={onResetAll}
            >
              <RotateCcw size={16} />
              <span>Clear All Active Filters</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
