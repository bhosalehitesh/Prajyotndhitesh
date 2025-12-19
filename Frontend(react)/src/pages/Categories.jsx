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
      <h1>{currentStore ? `${currentStore.name} - Categories` : 'Categories'}</h1>
      <p style={{marginBottom: '2rem', color: '#666'}}>Browse products by category</p>

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
            
            // If no image found, use placeholder
            if (!categoryImage || categoryImage.trim() === '') {
              categoryImage = '/assets/products/p1.jpg';
              console.log(`⚠️ No image for category "${categoryName}" - using placeholder`);
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
                <img
                  src={categoryImage}
                  alt={categoryName}
                  onError={(e) => {
                    e.target.src = '/assets/products/p1.jpg';
                  }}
                />
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
