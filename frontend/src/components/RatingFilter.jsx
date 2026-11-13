import React from 'react';
import { Star } from 'lucide-react';

export default function RatingFilter({ selectedRating, onChange }) {
  const ratingTiers = [
    { value: 4, label: '4 Stars & up' },
    { value: 3, label: '3 Stars & up' },
    { value: 2, label: '2 Stars & up' },
    { value: 1, label: '1 Star & up' },
    { value: 0, label: 'All Ratings' }
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => {
      const isFilled = index < rating;
      return (
        <Star
          key={index}
          size={16}
          className={`star-icon ${isFilled ? 'star-filled' : 'star-empty'}`}
        />
      );
    });
  };

  return (
    <div className="rating-filter-group" role="radiogroup" aria-label="Customer Rating">
      {ratingTiers.map(tier => {
        const isChecked = selectedRating === tier.value;
        return (
          <label
            key={tier.value}
            className={`rating-radio-option ${isChecked ? 'active' : ''}`}
          >
            <input
              type="radio"
              name="rating-filter"
              value={tier.value}
              checked={isChecked}
              onChange={() => onChange(tier.value)}
              className="rating-radio-input"
            />
            <div className="rating-radio-content">
              {tier.value > 0 ? (
                <>
                  <div className="rating-stars-row">
                    {renderStars(tier.value)}
                  </div>
                  <span className="rating-tier-label">{tier.label}</span>
                </>
              ) : (
                <span className="rating-tier-label all-ratings-label">{tier.label}</span>
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
}
