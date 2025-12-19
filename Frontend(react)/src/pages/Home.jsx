import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BANNERS, CATEGORIES, DEALS, FEATURES, ROUTES, STORAGE_KEYS } from '../constants';
import { useStore } from '../contexts/StoreContext';
import { getStoreFeatured, getStoreBanners, getStoreProducts } from '../utils/api';
import { transformProducts } from '../utils/format';
import ProductCard from '../components/ProductCard';
import Loading from '../components/ui/Loading';
import StoreError from '../components/StoreError';
import FloatingLoginButton from '../components/FloatingLoginButton';

const Home = () => {
  const navigate = useNavigate();
  const { slug } = useParams(); // Get slug from route params
  const { storeSlug, currentStore, loading: storeLoading } = useStore();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [banners, setBanners] = useState(BANNERS); // default to static banners as fallback
  const [currentProductSlide, setCurrentProductSlide] = useState(0);
  const [flashSaleTime, setFlashSaleTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [loading, setLoading] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  
  // Determine the actual store slug (from route params or context)
  const actualSlug = slug || storeSlug || currentStore?.slug;
  
  // Debug logging
  useEffect(() => {
    console.log('🏠 [HOME] Route params slug:', slug);
    console.log('🏠 [HOME] Context storeSlug:', storeSlug);
    console.log('🏠 [HOME] Current store slug:', currentStore?.slug);
    console.log('🏠 [HOME] Actual slug being used:', actualSlug);
  }, [slug, storeSlug, currentStore, actualSlug]);

  // Fetch featured products for the store
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      // Wait for store to load if we have a slug but no store yet
      if (!actualSlug) {
        console.log('🏠 [HOME] No slug available, skipping product fetch');
        setFeaturedProducts([]);
        return;
      }

      // If store is still loading, wait a bit
      if (storeLoading) {
        console.log('🏠 [HOME] Store still loading, waiting...');
        return;
      }

      // Wait for store to be loaded (should have sellerId)
      if (!currentStore || !currentStore.sellerId) {
        console.log('🏠 [HOME] Store not loaded or missing sellerId, waiting...', {
          hasStore: !!currentStore,
          sellerId: currentStore?.sellerId
        });
        return;
      }

      setLoading(true);
      try {
        const slugToUse = actualSlug;
        console.log('🏠 [HOME] Fetching featured products for slug:', slugToUse);
        console.log('🏠 [HOME] Store info:', {
          storeId: currentStore.storeId,
          sellerId: currentStore.sellerId,
          storeName: currentStore.name
        });
        
        // Try to fetch featured products first, but fallback to all products if none found
        let products = [];
        try {
          products = await getStoreFeatured(slugToUse);
          console.log('🏠 [HOME] Featured products API Response:', {
            isArray: Array.isArray(products),
            length: Array.isArray(products) ? products.length : 'N/A',
            firstProduct: Array.isArray(products) && products.length > 0 ? products[0] : null
          });
        } catch (featuredError) {
          console.warn('⚠️ [HOME] Error fetching featured products, trying all products:', featuredError);
        }
        
        // If no featured products, fetch all products instead
        if (!Array.isArray(products) || products.length === 0) {
          console.log('🏠 [HOME] No featured products found, fetching all products...');
          try {
            products = await getStoreProducts(slugToUse, null);
            console.log('🏠 [HOME] All products API Response:', {
              isArray: Array.isArray(products),
              length: Array.isArray(products) ? products.length : 'N/A',
            });
          } catch (allProductsError) {
            console.error('❌ [HOME] Error fetching all products:', allProductsError);
            products = [];
          }
        }
        
        if (Array.isArray(products) && products.length > 0) {
          // Transform backend product format to frontend format using utility
          const transformedProducts = transformProducts(products, currentStore?.name || 'Store');

          // SmartBiz VISIBILITY GATE (website-side safety):
          // Only show products that are:
          // - product.isActive === true
          // - category (if present) is active
          // - have stock (prefer totalStock, fallback to inventoryQuantity)
          const visibleProducts = transformedProducts.filter(p => {
            const backend = p.product || {};
            const productActive = backend.isActive !== false;
            const categoryActive = backend.category ? backend.category.isActive !== false : true;
            const totalStock = typeof backend.totalStock === 'number' ? backend.totalStock : backend.inventoryQuantity;
            const hasStock = totalStock == null || Number(totalStock) > 0;
            return productActive && categoryActive && hasStock;
          });

          console.log('🏠 [HOME] Transformed products:', {
            count: transformedProducts.length,
            visibleCount: visibleProducts.length,
            firstTransformed: transformedProducts[0],
            firstVisible: visibleProducts[0],
          });

          setFeaturedProducts(visibleProducts);
        } else {
          console.warn('⚠️ [HOME] No products returned for slug:', slugToUse);
          console.warn('⚠️ [HOME] Check backend API: http://localhost:8080/api/public/store/' + slugToUse + '/products');
          console.warn('⚠️ [HOME] Verify products exist and are active for seller_id:', currentStore.sellerId);
          setFeaturedProducts([]);
        }
      } catch (error) {
        console.error('❌ [HOME] Error fetching featured products:', error);
        console.error('❌ [HOME] Error details:', {
          message: error.message,
          stack: error.stack,
          slug: actualSlug
        });
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, [actualSlug, storeLoading, currentStore]);

  // Fetch banners for the store (public endpoint). Fallback to static BANNERS if none.
  useEffect(() => {
    const fetchBanners = async () => {
      if (!actualSlug) {
        console.log('🏠 [HOME] No slug available, using static banners');
        setBanners(BANNERS);
        return;
      }

      // Wait for store to be available (optional, but keeps logging consistent)
      if (storeLoading) {
        console.log('🏠 [HOME] Store still loading, waiting to fetch banners...');
        return;
      }

      console.log('🏠 [HOME] Fetching banners for slug:', actualSlug);
      try {
        const result = await getStoreBanners(actualSlug, true);
        console.log('🏠 [HOME] Banners API response:', {
          isArray: Array.isArray(result),
          length: Array.isArray(result) ? result.length : 'N/A',
          first: Array.isArray(result) && result.length > 0 ? result[0] : null,
        });

        if (Array.isArray(result) && result.length > 0) {
          const trimmed = result.slice(0, 3);
          setBanners(trimmed.map((b, idx) => ({
            id: b.bannerId || b.id || idx,
            image: b.imageUrl,
            alt: b.title || `Banner ${idx + 1}`,
          })));
          // Reset current banner index to 0 when new data arrives
          setCurrentBanner(0);
        } else {
          console.warn('⚠️ [HOME] No banners returned for slug:', actualSlug, 'falling back to static BANNERS');
          setBanners(BANNERS);
        }
      } catch (error) {
        console.error('❌ [HOME] Error fetching banners:', error);
        setBanners(BANNERS);
      }
    };

    fetchBanners();
  }, [actualSlug, storeLoading]);

  useEffect(() => {
    const total = banners.length || 1;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % total);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  useEffect(() => {
    // Flash sale timer
    const updateFlashSaleTimer = () => {
      let endTime = localStorage.getItem(STORAGE_KEYS.FLASH_SALE_END);
      if (!endTime) {
        endTime = new Date().getTime() + (24 * 60 * 60 * 1000);
        localStorage.setItem(STORAGE_KEYS.FLASH_SALE_END, endTime.toString());
      }

      const now = new Date().getTime();
      const distance = parseInt(endTime) - now;

      if (distance < 0) {
        const newEndTime = new Date().getTime() + (24 * 60 * 60 * 1000);
        localStorage.setItem(STORAGE_KEYS.FLASH_SALE_END, newEndTime.toString());
        updateFlashSaleTimer();
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setFlashSaleTime({ hours, minutes, seconds });
    };

    updateFlashSaleTimer();
    const timerInterval = setInterval(updateFlashSaleTimer, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  const goToBanner = (index) => {
    if (banners.length === 0) return;
    setCurrentBanner(index % banners.length);
  };

  const nextBanner = () => {
    if (banners.length === 0) return;
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    if (banners.length === 0) return;
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  // Show 4 products at a time
  const PRODUCTS_PER_SLIDE = 4;

  const nextProductSlide = () => {
    const maxSlides = Math.max(0, featuredProducts.length - PRODUCTS_PER_SLIDE);
    setCurrentProductSlide((prev) => Math.min(prev + 1, maxSlides));
  };

  const prevProductSlide = () => {
    setCurrentProductSlide((prev) => Math.max(prev - 1, 0));
  };

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
    console.log('🏠 [Home] Navigating to product detail:', detailPath);
    navigate(`${detailPath}?${params.toString()}`);
  };


  const subscribeNewsletter = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    if (email) {
      alert('Thank you for subscribing!');
      e.target.reset();
    }
  };

  // Build navigation paths with store slug using utility function
  const getNavPath = (path) => {
    return actualSlug ? `/store/${actualSlug}${path}` : path;
  };

  if (storeLoading || loading) {
    return <Loading fullScreen text="Loading store..." />;
  }

  return (
    <div className="home-page">
      <StoreError />
      
      {/* Floating Login Button Component */}
      <FloatingLoginButton />
      {/* Banner Carousel */}
      <section className="banner-carousel-section">
        <div className="banner-carousel-container">
          <div className="banner-carousel-wrapper">
            <button className="banner-carousel-btn banner-prev" onClick={prevBanner} aria-label="Previous banner">&#10094;</button>
            
            <div className="banner-carousel-track">
              {banners.map((banner, index) => (
                <div key={banner.id} className={`banner-slide ${index === currentBanner ? 'active' : ''}`}>
                  <img src={banner.image} alt={banner.alt} className="banner-image" />
                </div>
              ))}
            </div>

            <button className="banner-carousel-btn banner-next" onClick={nextBanner} aria-label="Next banner">&#10095;</button>
          </div>
          
          <div className="banner-indicators">
            {banners.map((banner, index) => (
              <span 
                key={banner.id}
                className={`banner-indicator ${index === currentBanner ? 'active' : ''}`}
                onClick={() => goToBanner(index)}
              ></span>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="biggest-deals" style={{ marginTop: '3rem' }}>
        <div className="container">
          <h2 className="section-title">Featured Products</h2>
          {featuredProducts.length === 0 && !loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              <p style={{ fontSize: '1.1rem', fontWeight: '500', marginBottom: '8px' }}>
                No products available.
              </p>
              <p style={{ fontSize: '14px', marginTop: '10px', color: '#888' }}>
                Products will appear here once they are added and marked as active.
                <br />
                Check the seller app to add products or ensure products are active.
              </p>
            </div>
          ) : (
            <div className="featured-product-grid">
              {featuredProducts.map((product) => {
                const handleProductClick = () => {
                  const basePath = actualSlug ? `/store/${actualSlug}` : '';
                  const params = new URLSearchParams({
                    id: product.id || product.productId,
                    name: product.name,
                    price: product.price,
                    originalPrice: product.originalPrice || product.price,
                    image: product.image,
                    brand: product.brand,
                    category: product.category
                  });
                  const detailPath = basePath ? `${basePath}/product/detail` : '/product/detail';
                  navigate(`${detailPath}?${params.toString()}`);
                };

                return (
                  <div key={product.id} className="featured-product-card" onClick={handleProductClick}>
                    <div className="image-section">
                      <img src={product.image || '/assets/products/p1.jpg'} alt={product.name} />
                    </div>
                    <div className="label-section">
                      <h3>{product.name}</h3>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Trending Categories */}
      <section className="trending-section">
        <div className="container">
          <h2 className="section-title">Trending Categories</h2>
          <div className="trending-grid">
            {CATEGORIES.slice(0, 2).map((category) => (
              <div key={category.id} className="category-card" onClick={() => navigate(getNavPath(ROUTES.CATEGORIES))}>
                <img src={category.image} alt={category.name} />
                <p>{category.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Biggest Deals */}
      <section className="biggest-deals">
        <div className="container">
          <h2 className="section-title">Collection</h2>
          <div className="deals-grid">
            {DEALS.map((deal) => (
              <div key={deal.id} className="deal-card" onClick={() => navigate(getNavPath(ROUTES.PRODUCTS))}>
                <div className="image-wrapper">
                  <img src={deal.image} alt={deal.name} />
                  <div className="overlay">
                    <h3>{deal.name}</h3>
                    <p className="price">STARTING {deal.price}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container features-grid">
          {FEATURES.map((feature) => (
            <div key={feature.id} className="feature-item">
              <img src={feature.image} alt={feature.name} />
              <p>{feature.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Flash Sale Banner */}
      <section className="flash-sale-section" style={{padding: '24px 0'}}>
        <div className="container">
          <div className="flash-sale-banner">
            <div className="flash-sale-content">
              <div className="flash-sale-title">⚡ Flash Sale - Up to 70% OFF!</div>
              <div className="flash-sale-subtitle">Limited time offer. Hurry up!</div>
            </div>
            <div className="flash-sale-timer">
              <div className="timer-item">
                <span className="timer-value">{String(flashSaleTime.hours).padStart(2, '0')}</span>
                <span className="timer-label">Hours</span>
              </div>
              <div className="timer-item">
                <span className="timer-value">{String(flashSaleTime.minutes).padStart(2, '0')}</span>
                <span className="timer-label">Minutes</span>
              </div>
              <div className="timer-item">
                <span className="timer-value">{String(flashSaleTime.seconds).padStart(2, '0')}</span>
                <span className="timer-label">Seconds</span>
              </div>
            </div>
            <button className="flash-sale-button" onClick={() => navigate(getNavPath(ROUTES.PRODUCTS))}>Shop Now</button>
          </div>
        </div>
      </section>

      {/* Newsletter Subscription */}
      <section className="newsletter-section">
        <div className="container">
          <h2 className="newsletter-title">Subscribe to Our Newsletter</h2>
          <p className="newsletter-subtitle">Get exclusive offers, new arrivals, and fashion tips delivered to your inbox</p>
          <form className="newsletter-form" onSubmit={subscribeNewsletter}>
            <input type="email" name="email" className="newsletter-input" placeholder="Enter your email address" required />
            <button type="submit" className="newsletter-button">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;

