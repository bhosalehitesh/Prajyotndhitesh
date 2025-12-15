import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BANNERS, CATEGORIES, DEALS, FEATURES, ROUTES, STORAGE_KEYS } from '../constants';
import ProductCard from '../components/ProductCard';
import Loading from '../components/ui/Loading';

const Home = () => {
  const navigate = useNavigate();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [currentProductSlide, setCurrentProductSlide] = useState(0);
  const [flashSaleTime, setFlashSaleTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [loading, setLoading] = useState(false);

  const featuredProducts = [
    { id: 1, name: "Men's Pure Cotton T-Shirt", price: 476, originalPrice: 1499, image: '/assets/products/p1.jpg', brand: 'V Store' },
    { id: 2, name: "Men's Casual T-Shirt", price: 499, originalPrice: 1099, image: '/assets/products/p2.jpg', brand: 'V Store' },
    { id: 3, name: "Men's Formal Shirt", price: 699, originalPrice: 1299, image: '/assets/products/p3.jpg', brand: 'V Store' },
    { id: 4, name: "Men's Polo T-Shirt", price: 479, originalPrice: 999, image: '/assets/products/p4.jpg', brand: 'V Store' },
    { id: 5, name: "Men's Cotton Shirt", price: 619, originalPrice: 1199, image: '/assets/products/p5.jpg', brand: 'V Store' },
    { id: 6, name: "Men's Printed T-Shirt", price: 404, originalPrice: 899, image: '/assets/products/p6.jpg', brand: 'V Store' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % BANNERS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
    setCurrentBanner(index);
  };

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % BANNERS.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + BANNERS.length) % BANNERS.length);
  };

  const nextProductSlide = () => {
    setCurrentProductSlide((prev) => Math.min(prev + 1, featuredProducts.length - 4));
  };

  const prevProductSlide = () => {
    setCurrentProductSlide((prev) => Math.max(prev - 1, 0));
  };

  const handleProductClick = (product) => {
    const params = new URLSearchParams({
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      brand: product.brand
    });
    navigate(`/product/detail?${params.toString()}`);
  };


  const subscribeNewsletter = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    if (email) {
      alert('Thank you for subscribing!');
      e.target.reset();
    }
  };

  if (loading) {
    return <Loading fullScreen text="Loading products..." />;
  }

  return (
    <div className="home-page">
      {/* Banner Carousel */}
      <section className="banner-carousel-section">
        <div className="banner-carousel-container">
          <div className="banner-carousel-wrapper">
            <button className="banner-carousel-btn banner-prev" onClick={prevBanner} aria-label="Previous banner">&#10094;</button>
            
            <div className="banner-carousel-track">
              {BANNERS.map((banner, index) => (
                <div key={banner.id} className={`banner-slide ${index === currentBanner ? 'active' : ''}`}>
                  <img src={banner.image} alt={banner.alt} className="banner-image" />
                </div>
              ))}
            </div>

            <button className="banner-carousel-btn banner-next" onClick={nextBanner} aria-label="Next banner">&#10095;</button>
          </div>
          
          <div className="banner-indicators">
            {BANNERS.map((banner, index) => (
              <span 
                key={banner.id}
                className={`banner-indicator ${index === currentBanner ? 'active' : ''}`}
                onClick={() => goToBanner(index)}
              ></span>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Carousel */}
      <section className="carousel-section">
        <div className="carousel-container container">
          <h2 className="carousel-title">Featured Products</h2>
          <div className="carousel">
            <button className="carousel-btn prev" onClick={prevProductSlide} disabled={currentProductSlide === 0}>&#10094;</button>
            
            <div className="carousel-track" style={{transform: `translateX(-${currentProductSlide * 25}%)`}}>
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <button className="carousel-btn next" onClick={nextProductSlide} disabled={currentProductSlide >= featuredProducts.length - 4}>&#10095;</button>
          </div>
        </div>
      </section>

      {/* Trending Categories */}
      <section className="trending-section">
        <div className="container">
          <h2 className="section-title">Trending Categories</h2>
          <div className="trending-grid">
            {CATEGORIES.slice(0, 2).map((category) => (
              <div key={category.id} className="category-card" onClick={() => navigate(ROUTES.CATEGORIES)}>
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
          <h2 className="section-title">BIGGEST DEALS ON TOP DRIPS</h2>
          <div className="deals-grid">
            {DEALS.map((deal) => (
              <div key={deal.id} className="deal-card" onClick={() => navigate(ROUTES.PRODUCTS)}>
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
            <button className="flash-sale-button" onClick={() => navigate(ROUTES.PRODUCTS)}>Shop Now</button>
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

