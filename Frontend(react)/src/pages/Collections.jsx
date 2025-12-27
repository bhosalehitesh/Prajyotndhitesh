import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';
import { getStoreCollections } from '../utils/api';
import Loading from '../components/ui/Loading';
import ErrorMessage from '../components/ui/ErrorMessage';

const Collections = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { storeSlug, currentStore, loading: storeLoading } = useStore();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const actualSlug = slug || storeSlug;

  useEffect(() => {
    const fetchCollections = async () => {
      if (!actualSlug) {
        setCollections([]);
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
        console.log('🔍 [Collections] Fetching collections for slug:', actualSlug);
        console.log('🔍 [Collections] Store info:', {
          storeId: currentStore?.storeId,
          sellerId: currentStore?.sellerId,
          storeName: currentStore?.name
        });
        
        const data = await getStoreCollections(actualSlug);
        const collectionsArray = Array.isArray(data) ? data : [];
        
        console.log('📦 [Collections] API Response:', {
          isArray: Array.isArray(data),
          count: collectionsArray.length,
          data: data
        });
        
        if (collectionsArray.length === 0) {
          console.warn('⚠️ [Collections] No collections returned. Possible issues:');
          console.warn('  1. Store slug might not match');
          console.warn('  2. Store might not be linked to seller');
          console.warn('  3. Collections might not exist for this seller');
          console.warn('  4. Collections might be inactive (isActive = false)');
        } else {
          console.log('✅ [Collections] Collections received:', collectionsArray.length);
          console.log('📦 [Collections] First collection sample:', collectionsArray[0]);
          console.log('📦 [Collections] All collection names:', collectionsArray.map(c => c.collectionName || c.name));
        }
        
        setCollections(collectionsArray);
      } catch (err) {
        console.error('❌ [Collections] Error fetching collections:', err);
        setError(`Error loading collections: ${err.message || 'Please try again.'}`);
        setCollections([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [actualSlug, storeLoading, currentStore]);

  const handleCollectionClick = (collection) => {
    const basePath = actualSlug ? `/store/${actualSlug}` : '';
    const collectionSlug = collection.slug || collection.collectionName || collection.name;
    // Navigate to products filtered by collection
    navigate(`${basePath}/products?collection=${encodeURIComponent(collectionSlug)}`);
  };

  if (storeLoading || loading) {
    return <Loading fullScreen text="Loading collections..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="container" style={{padding: '2rem 0'}}>
      {collections.length === 0 ? (
        <div style={{textAlign: 'center', padding: '3rem'}}>
          <p>No collections found for this store.</p>
          <div style={{marginTop: '1rem', fontSize: '0.9rem', color: '#666'}}>
            <p>Store slug: <code>{actualSlug || 'None'}</code></p>
            <p>Seller ID: <code>{currentStore?.sellerId || 'None'}</code></p>
            <p style={{marginTop: '1rem', fontSize: '0.85rem'}}>
              Make sure you have created collections in your mobile app and they are active.
            </p>
          </div>
        </div>
      ) : (
        <div className="deals-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem'}}>
          {collections.map((collection, index) => {
            const collectionName =
              collection.collectionName ||
              collection.name ||
              `Collection ${index + 1}`;

            // Try multiple field name variations to find the image
            let collectionImage =
              collection.collectionImage ||
              collection.collection_image ||
              collection.imageUrl ||
              collection.image_url ||
              collection.image ||
              null;
            
            // Get starting price if available
            const startingPrice = collection.startingPrice || collection.starting_price || null;
            
            // Log image status
            if (!collectionImage || collectionImage.trim() === '') {
              console.log(`⚠️ No image for collection "${collectionName}" - will show placeholder`);
            } else {
              console.log(`✅ Found image for "${collectionName}":`, collectionImage.substring(0, 50) + '...');
            }
            
            return (
              <div
                key={collection.collectionId || collection.collection_id || collection.id || index}
                onClick={() => handleCollectionClick(collection)}
                className="deal-card"
                style={{cursor: 'pointer'}}
              >
                <div className="image-wrapper">
                  {collectionImage && collectionImage.trim() !== '' ? (
                    <img
                      src={collectionImage}
                      alt={collectionName}
                      onError={(e) => {
                        // Hide image on error, show placeholder instead
                        e.target.style.display = 'none';
                        const placeholder = e.target.parentElement?.querySelector('.collection-placeholder');
                        if (placeholder) {
                          placeholder.style.display = 'flex';
                        }
                      }}
                    />
                  ) : (
                    <div className="collection-placeholder" style={{
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
                  <div className="overlay">
                    <h3>{collectionName}</h3>
                    {startingPrice && (
                      <p className="price">STARTING ₹{startingPrice}</p>
                    )}
                  </div>
                  <div className="collection-placeholder" style={{
                    width: '100%',
                    height: '280px',
                    display: 'none',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f3f4f6',
                    color: '#9ca3af',
                    gap: '8px',
                    position: 'absolute',
                    top: 0,
                    left: 0
                  }}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{opacity: 0.5}}>
                      <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="currentColor"/>
                    </svg>
                    <span style={{fontSize: '0.875rem', fontWeight: 500}}>Image Missing</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Collections;
