import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';
import { getStoreFeatured } from '../utils/api';
import { transformProducts } from '../utils/format';
import ProductCard from '../components/ProductCard';
import Loading from '../components/ui/Loading';
import ErrorMessage from '../components/ui/ErrorMessage';
import StoreError from '../components/StoreError';

const Featured = () => {
  const { slug } = useParams();
  const { storeSlug, currentStore, loading: storeLoading } = useStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const actualSlug = slug || storeSlug || currentStore?.slug;

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      // Wait for store to load if we have a slug but no store yet
      if (!actualSlug) {
        console.log('⭐ [FEATURED] No slug available, skipping product fetch');
        setProducts([]);
        setLoading(false);
        return;
      }

      // If store is still loading, wait a bit
      if (storeLoading) {
        console.log('⭐ [FEATURED] Store still loading, waiting...');
        return;
      }

      // Wait for store to be loaded (should have sellerId)
      if (!currentStore || !currentStore.sellerId) {
        console.log('⭐ [FEATURED] Store not loaded or missing sellerId, waiting...', {
          hasStore: !!currentStore,
          sellerId: currentStore?.sellerId
        });
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const slugToUse = actualSlug;
        console.log('⭐ [FEATURED] Fetching featured products for slug:', slugToUse);
        console.log('⭐ [FEATURED] Store info:', {
          storeId: currentStore.storeId,
          sellerId: currentStore.sellerId,
          storeName: currentStore.name
        });
        
        const data = await getStoreFeatured(slugToUse);
        console.log('⭐ [FEATURED] API Response:', {
          isArray: Array.isArray(data),
          length: Array.isArray(data) ? data.length : 'N/A',
          firstProduct: Array.isArray(data) && data.length > 0 ? data[0] : null
        });
        
        if (Array.isArray(data) && data.length > 0) {
          const transformedProducts = transformProducts(data, currentStore?.name || 'Store');
          console.log('⭐ [FEATURED] Transformed products:', transformedProducts.length);
          setProducts(transformedProducts);
        } else {
          console.warn('⭐ [FEATURED] No featured products returned for slug:', slugToUse);
          setProducts([]);
        }
      } catch (err) {
        console.error('❌ [FEATURED] Error fetching featured products:', err);
        setError('Error loading featured products. Please try again.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, [actualSlug, storeLoading, currentStore]);

  if (storeLoading || loading) {
    return <Loading fullScreen text="Loading featured products..." />;
  }

  if (error) {
    return (
      <>
        <StoreError />
        <ErrorMessage message={error} />
      </>
    );
  }

  return (
    <div className="container" style={{padding: '2rem 0'}}>
      <StoreError />
      {products.length === 0 ? (
        <div style={{textAlign: 'center', padding: '3rem'}}>
          <p>No featured products available.</p>
          <p style={{fontSize: '14px', marginTop: '10px', color: '#999'}}>
            Products marked as bestseller will appear here.
          </p>
        </div>
      ) : (
        <div className="products-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem',
          padding: '1rem 0'
        }}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Featured;

