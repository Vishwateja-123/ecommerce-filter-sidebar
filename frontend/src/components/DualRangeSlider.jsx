import React, { useCallback } from 'react';

export default function DualRangeSlider({
  min,
  max,
  step = 10,
  minVal,
  maxVal,
  onChange
}) {
  // Calculate percentage for active slider bar fill
  const minPercent = Math.min(
    100,
    Math.max(0, Math.round(((minVal - min) / (max - min || 1)) * 100))
  );
  const maxPercent = Math.min(
    100,
    Math.max(0, Math.round(((maxVal - min) / (max - min || 1)) * 100))
  );

  const handleMinChange = (e) => {
    const value = Math.min(Number(e.target.value), maxVal - step);
    onChange({ minVal: value, maxVal });
  };

  const handleMaxChange = (e) => {
    const value = Math.max(Number(e.target.value), minVal + step);
    onChange({ minVal, maxVal: value });
  };

  const handleDirectMinInput = (e) => {
    const raw = Number(e.target.value);
    if (!isNaN(raw)) {
      const clamped = Math.max(min, Math.min(raw, maxVal - step));
      onChange({ minVal: clamped, maxVal });
    }
  };

  const handleDirectMaxInput = (e) => {
    const raw = Number(e.target.value);
    if (!isNaN(raw)) {
      const clamped = Math.min(max, Math.max(raw, minVal + step));
      onChange({ minVal, maxVal: clamped });
    }
  };

  return (
    <div className="dual-slider-container">
      {/* Price display badge / inputs */}
      <div className="slider-values-row">
        <div className="price-input-box">
          <span className="currency-symbol">$</span>
          <input
            type="number"
            min={min}
            max={maxVal - step}
            value={minVal}
            onChange={handleDirectMinInput}
            aria-label="Minimum price input"
          />
        </div>
        <span className="price-divider">to</span>
        <div className="price-input-box">
          <span className="currency-symbol">$</span>
          <input
            type="number"
            min={minVal + step}
            max={max}
            value={maxVal}
            onChange={handleDirectMaxInput}
            aria-label="Maximum price input"
          />
        </div>
      </div>

      {/* Dual thumb track */}
      <div className="dual-slider-track-wrap">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minVal}
          onChange={handleMinChange}
          className="thumb thumb-left"
          style={{ zIndex: minVal > max - 100 ? 5 : 3 }}
          aria-label="Minimum price slider"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxVal}
          onChange={handleMaxChange}
          className="thumb thumb-right"
          style={{ zIndex: 4 }}
          aria-label="Maximum price slider"
        />

        <div className="slider-track-rail" />
        <div
          className="slider-track-highlight"
          style={{
            left: `${minPercent}%`,
            width: `${Math.max(0, maxPercent - minPercent)}%`
          }}
        />
      </div>

      {/* Quick preset price buttons */}
      <div className="slider-presets">
        <button
          type="button"
          className="preset-chip"
          onClick={() => onChange({ minVal: min, maxVal: 100 })}
        >
          Under $100
        </button>
        <button
          type="button"
          className="preset-chip"
          onClick={() => onChange({ minVal: 100, maxVal: 300 })}
        >
          $100 - $300
        </button>
        <button
          type="button"
          className="preset-chip"
          onClick={() => onChange({ minVal: 300, maxVal: max })}
        >
          $300+
        </button>
      </div>
    </div>
  );
}
