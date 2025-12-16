import React from 'react';
import { useWishlist } from '../contexts/WishlistContext';
import { useStore } from '../contexts/StoreContext';
import { useNavigate } from 'react-router-dom';

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { storeSlug, currentStore } = useStore();
  const navigate = useNavigate();

  // Filter wishlist by current store's sellerId
  // Products are linked to sellers, and stores are linked to sellers, so we filter by sellerId
  const currentSellerId = currentStore?.sellerId;
  const filteredWishlist = currentSellerId
    ? wishlist.filter(item => {
        const itemSellerId = item.sellerId;
        if (!itemSellerId) {
          // If item doesn't have sellerId, include it (backward compatibility)
          console.warn('⚠️ [Wishlist] Item missing sellerId:', item.name, '- including in filtered list');
          return true;
        }
        const matches = String(itemSellerId) === String(currentSellerId);
        if (!matches) {
          console.log(`🔍 [Wishlist] Filtering out item "${item.name}" - sellerId: ${itemSellerId} !== currentStore sellerId: ${currentSellerId}`);
        }
        return matches;
      })
    : wishlist; // If no store context, show all (fallback)

  // Redirect if no store context but wishlist has items (similar to cart)
  React.useEffect(() => {
    if (!currentStore && wishlist.length > 0) {
      // If wishlist has items but we're not on a store page, redirect to home
      console.warn('⚠️ [Wishlist] Wishlist has items but no store context. Redirecting...');
      navigate('/');
    }
  }, [currentStore, wishlist, navigate]);

  return (
    <div className="container" style={{padding: '2rem 0'}}>
      <h1 style={{ marginBottom: '2rem', fontSize: '1.8rem', fontWeight: '700' }}>
        {currentStore?.name ? `${currentStore.name} - Wishlist` : 'My Wishlist'}
      </h1>
      {filteredWishlist.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: '1.2rem', color: '#666' }}>
            {currentStore?.name 
              ? `Your wishlist is empty for ${currentStore.name}. Add items to your wishlist.`
              : 'Your wishlist is empty'}
          </p>
          {currentStore && (
            <button
              onClick={() => navigate(`/store/${storeSlug}/products`)}
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                background: '#f97316',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              Browse Products
            </button>
          )}
        </div>
      ) : (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem'}}>
          {filteredWishlist.map((item) => (
            <div key={item.id} style={{border: '1px solid #ddd', padding: '1rem', borderRadius: '8px'}}>
              <img src={item.image} alt={item.name} style={{width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px'}} />
              <h3 style={{marginTop: '0.5rem', fontSize: '1.1rem'}}>{item.name}</h3>
              <p style={{fontSize: '1.2rem', fontWeight: '600', color: '#f97316', margin: '0.5rem 0'}}>₹{item.price}</p>
              <button 
                onClick={() => removeFromWishlist(item.id)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  background: '#fee2e2',
                  color: '#dc2626',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;

