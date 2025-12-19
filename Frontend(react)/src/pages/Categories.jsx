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
      if (!actualSlug) {
        setCategories([]);
        setLoading(false);
        return;
      }

      if (storeLoading) {
        return;
      }

      if (!currentStore || !currentStore.sellerId) {
        return;
      }

      setLoading(true);
      setError(null);
      try {
        console.log('🔍 [Categories] Fetching categories for slug:', actualSlug);
        console.log('🔍 [Categories] Store info:', {
          storeId: currentStore?.storeId,
          sellerId: currentStore?.sellerId,
          storeName: currentStore?.name
        });
        
        const data = await getStoreCategories(actualSlug);
        const categoriesArray = Array.isArray(data) ? data : [];
        
        console.log('📦 [Categories] API Response:', {
          isArray: Array.isArray(data),
          count: categoriesArray.length,
          data: data
        });
        
        if (categoriesArray.length === 0) {
          console.warn('⚠️ [Categories] No categories returned. Possible issues:');
          console.warn('  1. Store slug might not match');
          console.warn('  2. Store might not be linked to seller');
          console.warn('  3. Categories might not exist for this seller');
          console.warn('  4. Categories might be inactive (isActive = false)');
        } else {
          console.log('✅ [Categories] Categories received:', categoriesArray.length);
          console.log('📦 [Categories] First category sample:', categoriesArray[0]);
          console.log('📦 [Categories] All category names:', categoriesArray.map(c => c.categoryName || c.name));
        }
        
        setCategories(categoriesArray);
      } catch (err) {
        console.error('❌ [Categories] Error fetching categories:', err);
        setError(`Error loading categories: ${err.message || 'Please try again.'}`);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [actualSlug, storeLoading, currentStore]);

  const handleCategoryClick = (category) => {
    const basePath = actualSlug ? `/store/${actualSlug}` : '';
    const categorySlug = category.slug || category.categoryName || category.name || category.businessCategory;
    navigate(`${basePath}/products?category=${encodeURIComponent(categorySlug)}`);
  };

  if (storeLoading || loading) {
    return <Loading fullScreen text="Loading categories..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="container" style={{padding: '2rem 0'}}>
      {categories.length === 0 ? (
        <div style={{textAlign: 'center', padding: '3rem'}}>
          <p>No categories found for this store.</p>
          <div style={{marginTop: '1rem', fontSize: '0.9rem', color: '#666'}}>
            <p>Store slug: <code>{actualSlug || 'None'}</code></p>
            <p>Seller ID: <code>{currentStore?.sellerId || 'None'}</code></p>
            <p style={{marginTop: '1rem', fontSize: '0.85rem'}}>
              Make sure you have created categories in your mobile app and they are active.
            </p>
          </div>
        </div>
      ) : (
        <div className="trending-grid">
          {categories.map((category, index) => {
            const categoryName =
              category.categoryName ||
              category.name ||
              category.businessCategory ||
              `Category ${index + 1}`;

            // Try multiple field name variations to find the image
            let categoryImage =
              category.categoryImage ||        // Primary field from backend
              category.category_image ||       // Snake case variant
              category.socialSharingImage ||   // Social sharing image
              category.social_sharing_image || // Snake case variant
              category.categoryImageUrl ||
              category.category_image_url ||
              category.imageUrl ||
              category.image_url ||
              category.image ||
              null;
            
            // Log image status
            if (!categoryImage || categoryImage.trim() === '') {
              console.log(`⚠️ No image for category "${categoryName}" - will show placeholder icon`);
            } else {
              // Log successful image detection
              console.log(`✅ Found image for "${categoryName}":`, categoryImage.substring(0, 50) + '...');
            }
            
            return (
              <div
                key={category.categoryId || category.category_id || category.id || index}
                onClick={() => handleCategoryClick(category)}
                className="category-card"
              >
                {categoryImage && categoryImage.trim() !== '' ? (
                  <>
                    <img
                      src={categoryImage}
                      alt={categoryName}
                      onError={(e) => {
                        // Hide image on error, show placeholder instead
                        e.target.style.display = 'none';
                        const placeholder = e.target.parentElement?.querySelector('.category-placeholder');
                        if (placeholder) {
                          placeholder.style.display = 'flex';
                        }
                      }}
                    />
                    <div className="category-placeholder" style={{
                      width: '100%',
                      height: '280px',
                      display: 'none',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f3f4f6',
                      color: '#9ca3af',
                      gap: '8px'
                    }}>
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{opacity: 0.5}}>
                        <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="currentColor"/>
                      </svg>
                      <span style={{fontSize: '0.875rem', fontWeight: 500}}>Image Missing</span>
                    </div>
                  </>
                ) : (
                  <div className="category-placeholder" style={{
                    width: '100%',
                    height: '280px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f3f4f6',
                    color: '#9ca3af',
                    gap: '8px'
                  }}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{opacity: 0.5}}>
                      <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="currentColor"/>
                    </svg>
                    <span style={{fontSize: '0.875rem', fontWeight: 500}}>Image Missing</span>
                  </div>
                )}
                <p>{categoryName}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Categories;
