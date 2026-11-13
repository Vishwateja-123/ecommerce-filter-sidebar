import React from 'react';
import { PackageSearch, RotateCcw } from 'lucide-react';

export default function EmptyState({ onReset }) {
  return (
    <div className="empty-state-card">
      <div className="empty-icon-circle">
        <PackageSearch size={44} className="empty-icon" />
      </div>
      <h3 className="empty-state-title">No products match your filters</h3>
      <p className="empty-state-description">
        We couldn't find any products matching your current combination of categories,
        price range, or rating. Try adjusting or clearing your filters to see more results.
      </p>
      <button
        type="button"
        className="btn-empty-reset"
        onClick={onReset}
      >
        <RotateCcw size={16} />
        <span>Reset All Filters</span>
      </button>
    </div>
  );
}
