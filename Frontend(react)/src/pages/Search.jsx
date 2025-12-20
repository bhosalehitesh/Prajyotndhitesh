import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';
import { getStoreProducts, searchProducts, getStoreCategories, getStoreCollections } from '../utils/api';
import { transformProducts } from '../utils/format';
import ProductCard from '../components/ProductCard';
import Loading from '../components/ui/Loading';
import ErrorMessage from '../components/ui/ErrorMessage';
import StoreError from '../components/StoreError';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { slug } = useParams();
  const { storeSlug, currentStore, loading: storeLoading } = useStore();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const actualSlug = slug || storeSlug || currentStore?.slug;

  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let data = [];

        if (actualSlug) {
          let rawProducts = [];
          let fetchedBySmartCategory = false;

          // 1. Try Category Search Context
          try {
            const categories = await getStoreCategories(actualSlug);
            if (Array.isArray(categories)) {
              const sortedCats = categories.sort((a, b) => (b.name || '').length - (a.name || '').length);
              const lowerQuery = query.toLowerCase();
              const matchedCat = sortedCats.find(c => {
                const cName = (c.name || '').toLowerCase();
                return cName && lowerQuery.includes(cName);
              });
              if (matchedCat) {
                console.log('Search: Detected category context:', matchedCat.name);
                rawProducts = await getStoreProducts(actualSlug, matchedCat.name);
                fetchedBySmartCategory = true;
              }
            }
          } catch (e) {
            console.warn('Search: Category detection error', e);
          }

          // 2. Try Collection Search Context (only if category not found)
          let fetchedBySmartCollection = false;
          if (!fetchedBySmartCategory) {
            try {
              const collections = await getStoreCollections(actualSlug);
              if (Array.isArray(collections)) {
                const lowerQuery = query.toLowerCase();
                const matchedCol = collections.find(c => {
                  const cName = (c.name || c.collectionName || '').toLowerCase();
                  return cName && lowerQuery.includes(cName);
                });
                if (matchedCol) {
                  console.log('Search: Detected collection context:', matchedCol.collectionName || matchedCol.name);
                  // Since we don't have a direct getProductsByCollection API in current api.js
                  // We'll fetch all products and filter locally for now.
                }
              }
            } catch (e) {
              console.warn('Search: Collection detection error', e);
            }
          }

          // 3. Fallback to all products
          if (!fetchedBySmartCategory) {
            rawProducts = await getStoreProducts(actualSlug);
          }

          console.log(`Search: Fetched ${rawProducts?.length || 0} raw products from backend`);

          if (Array.isArray(rawProducts)) {
            // Filter by name, description, category, or brand
            // Filter by name, description, category, or brand
            const searchTerms = query.toLowerCase().split(' ').filter(t => t.length > 0);

            const filterFn = (p, useEvery = true) => {
              const name = (p.name || p.productName || '').toLowerCase();
              const desc = (p.description || '').toLowerCase();
              const brand = (p.brand || '').toLowerCase();
              const rawCat = p.productCategory || p.category || p.businessCategory;
              let catName = (typeof rawCat === 'object' ? rawCat?.name : String(rawCat || '')).toLowerCase();

              const check = (term) => name.includes(term) || desc.includes(term) || catName.includes(term) || brand.includes(term);
              return useEvery ? searchTerms.every(check) : searchTerms.some(check);
            };

            data = rawProducts.filter(p => filterFn(p, true));
            if (data.length === 0) {
              // If strict search yields nothing, try lenient
              data = rawProducts.filter(p => filterFn(p, false));
            }
            console.log(`Search: Filtered down to ${data.length} matching products`);
          }
        } else {
          // Global search
          data = await searchProducts(query);
        }

        if (Array.isArray(data)) {
          // Utilize same formatting and visibility logic as Products.jsx
          const transformedProducts = transformProducts(data, currentStore?.name || 'Store');
          console.log(`Search: Transformed ${transformedProducts.length} products`);

          const visibleProducts = transformedProducts.filter(p => {
            // If searching specifically, we might be more lenient, but keeping stock check is good.
            // Copying visibility logic from Products.jsx for consistency
            const backend = p.product || {};
            const productActive = backend.isActive !== false;
            const categoryActive = backend.category ? backend.category.isActive !== false : true;

            const isVisible = productActive && categoryActive;
            if (!isVisible) {
              console.log(`Search: Product ${p.name} hidden (Active: ${productActive}, CatActive: ${categoryActive})`);
            }
            return isVisible;
          });

          console.log(`Search: ${visibleProducts.length} products visible after filtering`);
          setProducts(visibleProducts);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to perform search. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (!storeLoading) {
      performSearch();
    }
  }, [query, actualSlug, storeLoading, currentStore]);

  const handleProductClick = (product) => {
    const basePath = actualSlug ? `/store/${actualSlug}` : '';
    const detailPath = basePath ? `${basePath}/product/detail` : '/product/detail';

    // Pass minimal params, ProductDetail should fetch full data if needed, 
    // but typical pattern here relies on params
    const params = new URLSearchParams({
      id: product.id || product.productId,
      name: product.name,
      price: product.price,
      image: product.image
    });

    navigate(`${detailPath}?${params.toString()}`);
  };

  if (storeLoading || loading) {
    return <Loading fullScreen text={`Searching for "${query}"...`} />;
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '2rem 0' }}>
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <StoreError />
      <div className="search-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          Search Results
        </h1>
        <p style={{ color: '#666' }}>
          Found {products.length} result{products.length !== 1 ? 's' : ''} for "{query}"
        </p>
      </div>

      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#666' }}>
          <svg
            viewBox="0 0 24 24"
            width="64"
            height="64"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            style={{ marginBottom: '1rem', color: '#ccc' }}
          >
            <circle cx="11" cy="11" r="6"></circle>
            <path d="M21 21l-4.35-4.35" strokeLinecap="round"></path>
          </svg>
          <p style={{ fontSize: '1.1rem' }}>No products found matching "{query}"</p>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Try checking your spelling or using different keywords.</p>
          <button
            onClick={() => navigate(actualSlug ? `/store/${actualSlug}/products` : '/products')}
            style={{
              marginTop: '1.5rem',
              padding: '0.75rem 1.5rem',
              background: '#000',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Browse All Products
          </button>
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

export default Search;
