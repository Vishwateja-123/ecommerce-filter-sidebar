import React, { useState } from 'react';
import { Star, ShoppingBag, Check } from 'lucide-react';

export default function ProductCard({ product }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [added, setAdded] = useState(false);

  const fallbackImage = `https://placehold.co/600x400/e2e8f0/475569?text=${encodeURIComponent(product.name)}`;

  const handleAddToCart = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <article className="product-card" data-product-id={product.id}>
      <div className="product-image-wrapper">
        {!imageLoaded && !imageError && (
          <div className="image-skeleton-loader" />
        )}
        <img
          src={imageError ? fallbackImage : product.image}
          alt={product.name}
          className={`product-image ${imageLoaded ? 'loaded' : ''}`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
        />
        <span className="product-category-badge">{product.category}</span>
      </div>

      <div className="product-info">
        {product.brand && (
          <span className="product-brand">{product.brand}</span>
        )}

        <h3 className="product-name" title={product.name}>
          {product.name}
        </h3>

        <div className="product-rating-row">
          <div className="stars-compact">
            <Star size={14} className="star-icon star-filled" />
            <span className="rating-value">{product.rating.toFixed(1)}</span>
          </div>
          <span className="rating-count">
            ({product.ratingCount?.toLocaleString() || 0} reviews)
          </span>
        </div>

        <div className="product-card-footer">
          <div className="product-price-box">
            <span className="price-currency">$</span>
            <span className="price-amount">{product.price.toFixed(2)}</span>
          </div>

          <button
            type="button"
            className={`btn-add-cart ${added ? 'added' : ''}`}
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
          >
            {added ? (
              <>
                <Check size={16} />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag size={16} />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
