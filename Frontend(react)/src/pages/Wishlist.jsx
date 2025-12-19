import React from 'react';
import { useWishlist } from '../contexts/WishlistContext';
import { useStore } from '../contexts/StoreContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES, getRoute } from '../constants/routes';
import ProductCard from '../components/ProductCard';

const Wishlist = () => {
  const { wishlist } = useWishlist();
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
      navigate(getRoute(ROUTES.HOME, storeSlug));
    }
  }, [currentStore, wishlist, navigate, storeSlug]);

  // Transform wishlist items to product format for ProductCard
  const products = filteredWishlist.map(item => ({
    id: item.productId || item.id,
    name: item.name,
    price: item.price,
    originalPrice: item.originalPrice,
    image: item.image,
    brand: item.brand,
    category: item.category,
    isBestseller: item.isBestseller
  }));

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
              onClick={() => navigate(getRoute(ROUTES.PRODUCTS, storeSlug))}
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
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product}
              showQuickAdd={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;

