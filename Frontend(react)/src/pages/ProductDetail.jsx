import React from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useStore } from '../contexts/StoreContext';

const ProductDetail = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { storeSlug, currentStore } = useStore();
  
  const actualSlug = slug || storeSlug;
  
  const name = searchParams.get('name');
  const price = searchParams.get('price');
  const originalPrice = searchParams.get('originalPrice');
  const image = searchParams.get('image');
  const brand = searchParams.get('brand') || currentStore?.name || 'Store';

  const handleAddToCart = () => {
    addToCart({
      name,
      price: parseFloat(price),
      image,
      brand,
      quantity: 1
    });
    alert('Added to cart!');
  };

  return (
    <div className="container" style={{padding: '2rem 0'}}>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
        <div>
          <img src={image || '/assets/products/p1.jpg'} alt={name} style={{width: '100%'}} />
        </div>
        <div>
          <h1>{name}</h1>
          <p>Brand: {brand}</p>
          <p style={{fontSize: '1.5rem', fontWeight: 'bold'}}>₹{price}</p>
          {originalPrice && parseFloat(originalPrice) > parseFloat(price) && (
            <p style={{textDecoration: 'line-through', color: '#999'}}>₹{originalPrice}</p>
          )}
          <button onClick={handleAddToCart} style={{padding: '1rem 2rem', fontSize: '1.2rem', marginTop: '1rem'}}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

