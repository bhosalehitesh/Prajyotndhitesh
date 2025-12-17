import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';
import { getStoreProducts } from '../utils/api';
import { transformProducts } from '../utils/format';
import ProductCard from '../components/ProductCard';
import Loading from '../components/ui/Loading';
import ErrorMessage from '../components/ui/ErrorMessage';
import StoreError from '../components/StoreError';

const Products = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { storeSlug, currentStore, loading: storeLoading } = useStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');

  const actualSlug = slug || storeSlug || currentStore?.slug;

  useEffect(() => {
    const fetchProducts = async () => {
      if (!actualSlug) {
        console.log('No slug available, skipping product fetch');
        setError('No store selected');
        setLoading(false);
        return;
      }

      // If store is still loading, wait a bit
      if (storeLoading) {
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const slugToUse = actualSlug;
        console.log('Fetching products for slug:', slugToUse, 'category:', selectedCategory);
        
        const data = await getStoreProducts(slugToUse, selectedCategory || null);
        console.log('Received products:', Array.isArray(data) ? data.length : 'not array');
        
        if (Array.isArray(data) && data.length > 0) {
          const transformedProducts = transformProducts(data, currentStore?.name || 'Store');
          console.log('Transformed products:', transformedProducts.length);
          setProducts(transformedProducts);
        } else {
          console.warn('No products returned for slug:', slugToUse);
          setProducts([]);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Error loading products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [actualSlug, selectedCategory, storeLoading, currentStore]);

  const handleProductClick = (product) => {
    // ALWAYS use /store/:slug/product/detail pattern for consistency
    const basePath = actualSlug ? `/store/${actualSlug}` : '';
    const params = new URLSearchParams({
      id: product.id || product.productId,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      brand: product.brand,
      category: product.category
    });
    const detailPath = basePath ? `${basePath}/product/detail` : '/product/detail';
    console.log('🛍️ [Products] Navigating to product detail:', detailPath);
    navigate(`${detailPath}?${params.toString()}`);
  };

  if (storeLoading || loading) {
    return <Loading fullScreen text="Loading products..." />;
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
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
        <h1>Products</h1>
        {selectedCategory && (
          <button 
            onClick={() => setSelectedCategory('')}
            style={{padding: '0.5rem 1rem', cursor: 'pointer'}}
          >
            Clear Filter
          </button>
        )}
      </div>

      {products.length === 0 ? (
        <div style={{textAlign: 'center', padding: '3rem'}}>
          <p>No products found for this store.</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} onClick={() => handleProductClick(product)} style={{cursor: 'pointer'}}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;

