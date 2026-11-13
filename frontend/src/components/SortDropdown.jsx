import React from 'react';
import { ArrowUpDown } from 'lucide-react';

export default function SortDropdown({ value, onChange }) {
  const options = [
    { value: 'default', label: 'Featured (Default)' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating_desc', label: 'Top Rated First' },
    { value: 'rating_asc', label: 'Rating: Low to High' }
  ];

  return (
    <div className="sort-dropdown-wrapper">
      <label htmlFor="sort-select" className="sort-label">
        <ArrowUpDown size={14} />
        <span>Sort By:</span>
      </label>
      <select
        id="sort-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="sort-select"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
