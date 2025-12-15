import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';
import { getStoreCategories } from '../utils/api';
import Loading from '../components/ui/Loading';
import ErrorMessage from '../components/ui/ErrorMessage';

const Categories = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { storeSlug, currentStore, loading: storeLoading } = useStore();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const actualSlug = slug || storeSlug;

  useEffect(() => {
    const fetchCategories = async () => {
      // Wait for store to load if we have a slug but no store yet
      if (!actualSlug) {
        console.log('🏷️ [Categories] No slug available, skipping category fetch');
        setCategories([]);
        setLoading(false);
        return;
      }

      // If store is still loading, wait a bit
      if (storeLoading) {
        console.log('🏷️ [Categories] Store still loading, waiting...');
        return;
      }

      // Wait for store to be loaded (should have sellerId)
      if (!currentStore || !currentStore.sellerId) {
        console.log('🏷️ [Categories] Store not loaded or missing sellerId, waiting...', {
          hasStore: !!currentStore,
          sellerId: currentStore?.sellerId
        });
        return;
      }

      setLoading(true);
      setError(null);
      try {
        console.log('🏷️ [Categories] Fetching categories for slug:', actualSlug);
        console.log('🏷️ [Categories] Store info:', {
          storeId: currentStore.storeId,
          sellerId: currentStore.sellerId,
          storeName: currentStore.name
        });
        
        const data = await getStoreCategories(actualSlug);
        console.log('🏷️ [Categories] Received categories:', Array.isArray(data) ? data.length : 'not array', data);
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('❌ [Categories] Error fetching categories:', err);
        setError('Error loading categories. Please try again.');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [actualSlug, storeLoading, currentStore]);

  const handleCategoryClick = (category) => {
    const basePath = actualSlug ? `/store/${actualSlug}` : '';
    const categoryName = category.categoryName || category.name || category.businessCategory;
    navigate(`${basePath}/products?category=${encodeURIComponent(categoryName)}`);
  };

  if (storeLoading || loading) {
    return <Loading fullScreen text="Loading categories..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="container" style={{padding: '2rem 0'}}>
      <h1>{currentStore ? `${currentStore.name} - Categories` : 'Categories'}</h1>
      <p style={{marginBottom: '2rem', color: '#666'}}>Browse products by category</p>

      {categories.length === 0 ? (
        <div style={{textAlign: 'center', padding: '3rem'}}>
          <p>No categories found for this store.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1.5rem'
        }}>
          {categories.map((category, index) => {
            const categoryName =
              category.categoryName ||
              category.name ||
              category.businessCategory ||
              `Category ${index + 1}`;

            // Prefer seller-uploaded image fields before falling back
            const categoryImage =
              category.categoryImage || // primary from backend model
              category.socialSharingImage ||
              category.categoryImageUrl ||
              category.imageUrl ||
              category.image ||
              '/assets/products/p1.jpg';
            
            return (
              <div
                key={category.categoryId || category.id || index}
                onClick={() => handleCategoryClick(category)}
                style={{
                  cursor: 'pointer',
                  padding: '1.5rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  textAlign: 'center',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  backgroundColor: '#fff'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <img
                  src={categoryImage}
                  alt={categoryName}
                  style={{
                    width: '100%',
                    height: '150px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    marginBottom: '1rem'
                  }}
                />
                <h3 style={{margin: 0, fontSize: '1.1rem', color: '#333'}}>{categoryName}</h3>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Categories;

