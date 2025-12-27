import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';
import { getStoreProducts } from '../utils/api';
import { transformProducts, groupProductsByBaseId } from '../utils/format';
import ProductCard from '../components/ProductCard';
import Loading from '../components/ui/Loading';
import ErrorMessage from '../components/ui/ErrorMessage';
import StoreError from '../components/StoreError';

const Products = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { storeSlug, currentStore, loading: storeLoading } = useStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Read parameters from URL
  const selectedCategory = searchParams.get('category') || '';
  const selectedCollection = searchParams.get('collection') || '';

  const actualSlug = slug || storeSlug || currentStore?.slug;

  // Scroll to top when route params change (ScrollToTop component handles initial mount)
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [selectedCategory, selectedCollection]);

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
        console.log('Fetching products for slug:', slugToUse, 'category:', selectedCategory, 'collection:', selectedCollection);

        const data = await getStoreProducts(slugToUse, selectedCategory || null, selectedCollection || null);
        console.log('📦 [Products] Received products:', {
          count: Array.isArray(data) ? data.length : 0,
          isArray: Array.isArray(data),
          selectedCategory,
          selectedCollection,
          firstProduct: Array.isArray(data) && data.length > 0 ? data[0] : null
        });

        if (Array.isArray(data) && data.length > 0) {
          const transformedProducts = transformProducts(data, currentStore?.name || 'Store');

          // SmartBiz VISIBILITY GATE (website-side safety):
          // Only list products that are active, in an active category, and have stock.
          const visibleProducts = transformedProducts.filter(p => {
            const backend = p.product || {};
            const productActive = backend.isActive !== false;
            const categoryActive = backend.category ? backend.category.isActive !== false : true;

            // Collection filter is handled by backend
            // Note: backend.collections is @JsonIgnore so we can't verify here
            // The backend should have already filtered correctly

            const totalStock = typeof backend.totalStock === 'number' ? backend.totalStock : backend.inventoryQuantity;
            const hasStock = totalStock == null || Number(totalStock) > 0;

            // For collection-specific views, we might want to show out of stock, but for now sticking to store policy
            return productActive && categoryActive && hasStock;
          });

          // Group products by base product ID (to avoid showing multiple entries for products with variants)
          const groupedProducts = groupProductsByBaseId(visibleProducts);
          
          console.log('Transformed products:', transformedProducts.length, 'Visible:', visibleProducts.length, 'Grouped:', groupedProducts.length);
          setProducts(groupedProducts);
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
  }, [actualSlug, selectedCategory, selectedCollection, storeLoading, currentStore]);

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
    <div className="container" style={{ padding: '2rem 0' }}>
      <StoreError />
      {(selectedCategory || selectedCollection) && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
          {selectedCategory && (
            <span style={{ fontSize: '0.9rem', color: '#666' }}>Category: <strong>{selectedCategory}</strong></span>
          )}
          {selectedCollection && (
            <span style={{ fontSize: '0.9rem', color: '#666' }}>Collection: <strong>{selectedCollection}</strong></span>
          )}
          <button
            onClick={() => navigate(`${actualSlug ? `/store/${actualSlug}` : ''}/products`)}
            style={{ padding: '0.5rem 1rem', cursor: 'pointer', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>No products found{selectedCollection ? ` in collection "${selectedCollection}"` : selectedCategory ? ` in category "${selectedCategory}"` : ' for this store'}.</p>
          {selectedCollection && (
            <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
              <p>Make sure:</p>
              <ul style={{ textAlign: 'left', display: 'inline-block', marginTop: '0.5rem' }}>
                <li>The collection exists and is active</li>
                <li>Products are assigned to this collection</li>
                <li>Products are active and have stock</li>
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} onClick={() => handleProductClick(product)} style={{ cursor: 'pointer' }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;

