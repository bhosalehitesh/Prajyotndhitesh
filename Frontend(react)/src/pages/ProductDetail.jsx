import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import { useStore } from '../contexts/StoreContext';
import { getStoreProducts } from '../utils/api';
import { transformProducts } from '../utils/format';
import ProductCard from '../components/ProductCard';
import Loading from '../components/ui/Loading';
import ErrorMessage from '../components/ui/ErrorMessage';

const ProductDetail = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { cart, addToCart, updateQuantity } = useCart();
  const { isDarkMode } = useTheme();
  const { storeSlug, currentStore, loading: storeLoading } = useStore();
  
  // Get slug from route params first (most reliable), then from store context
  // The slug param can come from either /store/:slug/product/detail or /:slug/product/detail
  const actualSlug = slug || storeSlug;
  
  console.log('📦 [ProductDetail] Route params:', {
    slugFromParams: slug,
    storeSlug,
    actualSlug,
    currentPath: window.location?.pathname
  });
  const productIdParam = searchParams.get('id');
  const fallbackName = searchParams.get('name');
  const fallbackPrice = searchParams.get('price');
  const fallbackOriginalPrice = searchParams.get('originalPrice');
  const fallbackImage = searchParams.get('image');
  const fallbackBrand = searchParams.get('brand') || currentStore?.name || 'Store';
  const fallbackCategory = searchParams.get('category');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [availableVariants, setAvailableVariants] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      // Wait for store to load if we have a slug from route but store context is still loading
      if (storeLoading && !slug) {
        console.log('⏳ [ProductDetail] Waiting for store context to load...');
        return;
      }

      // If no slug available at all, show fallback data from URL params
      if (!actualSlug) {
        console.log('⚠️ [ProductDetail] No slug available, using fallback data from URL params');
        setLoading(false);
        setError(null); // Don't show error if we have fallback data
        return;
      }

      setLoading(true);
      setError(null);
      try {
        console.log('📡 [ProductDetail] Fetching products for slug:', actualSlug);
        const backendProducts = await getStoreProducts(actualSlug);
        const transformed = transformProducts(backendProducts, currentStore?.name || 'Store');
        console.log('✅ [ProductDetail] Loaded products:', transformed.length);
        setProducts(transformed);
      } catch (err) {
        console.error('❌ [ProductDetail] Error fetching products for detail page', err);
        setError('Unable to load product details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [actualSlug, currentStore?.name, storeLoading, slug]);

  const currentProduct = useMemo(() => {
    if (!products || products.length === 0) return null;
    const byId = products.find(
      (p) => p.id && productIdParam && String(p.id) === String(productIdParam)
    );
    if (byId) return byId;
    if (fallbackName) {
      return products.find(
        (p) => p.name && p.name.toLowerCase() === fallbackName.toLowerCase()
      );
    }
    return null;
  }, [products, productIdParam, fallbackName]);

  const backend = currentProduct?.product || {};
  const isBestseller = backend.isBestseller === true || backend.bestSeller === true;
  const isActive = backend.isActive !== false;
  
  // Get variants from backend (they might be in the response or need to be fetched)
  const backendVariants = backend.variants || backend.productVariants || [];
  
  // Process and group variants by attributes (color, size)
  const processedVariants = useMemo(() => {
    if (!Array.isArray(backendVariants) || backendVariants.length === 0) {
      return [];
    }
    
    return backendVariants.map(v => {
      // Parse attributes JSON if it's a string
      let attributes = {};
      if (v.attributesJson) {
        try {
          attributes = typeof v.attributesJson === 'string' 
            ? JSON.parse(v.attributesJson) 
            : v.attributesJson;
        } catch (e) {
          console.warn('Failed to parse variant attributes:', e);
        }
      }
      // Also check if attributes are already parsed
      if (v.attributes && typeof v.attributes === 'object') {
        attributes = v.attributes;
      }
      
      return {
        variantId: v.variantId || v.id,
        color: attributes.color || v.color || '',
        size: attributes.size || v.size || '',
        price: v.sellingPrice || v.price || 0,
        mrp: v.mrp || v.originalPrice || 0,
        stock: v.stock || v.inventoryQuantity || 0,
        isActive: v.isActive !== false,
        sku: v.sku || v.customSku || '',
        hsnCode: v.hsnCode || '',
        images: v.images || v.productImages || [],
        attributes: attributes
      };
    }).filter(v => v.isActive && v.stock > 0); // Only show active variants with stock
  }, [backendVariants]);
  
  // Group variants by color and size for selection UI
  const variantGroups = useMemo(() => {
    const groups = {
      colors: new Set(),
      sizes: new Set()
    };
    
    processedVariants.forEach(v => {
      if (v.color) groups.colors.add(v.color);
      if (v.size) groups.sizes.add(v.size);
    });
    
    return {
      colors: Array.from(groups.colors).sort(),
      sizes: Array.from(groups.sizes).sort()
    };
  }, [processedVariants]);
  
  // Auto-select first available variant if none selected
  useEffect(() => {
    if (processedVariants.length > 0 && !selectedVariant) {
      setSelectedVariant(processedVariants[0]);
    }
  }, [processedVariants, selectedVariant]);
  
  // Update selected variant when color/size selection changes
  const handleVariantSelection = (selectedColor, selectedSize) => {
    const matchingVariant = processedVariants.find(v => {
      const colorMatch = !selectedColor || v.color === selectedColor;
      const sizeMatch = !selectedSize || v.size === selectedSize;
      return colorMatch && sizeMatch;
    });
    
    if (matchingVariant) {
      setSelectedVariant(matchingVariant);
    }
  };
  
  // Use selected variant data or fallback to product data
  const displayVariant = selectedVariant || (processedVariants.length > 0 ? processedVariants[0] : null);
  const inventory = displayVariant?.stock ?? backend.inventoryQuantity;
  const hsnCode = displayVariant?.hsnCode ?? backend.hsnCode;
  const sku = displayVariant?.sku ?? backend.customSku;
  const color = displayVariant?.color ?? backend.color;
  const size = displayVariant?.size ?? backend.size;
  const variant = backend.variant;
  const description = backend.description;
  const productCategory = backend.productCategory || backend.businessCategory;
  const seoTitle = backend.seoTitleTag;
  const seoDescription = backend.seoMetaDescription;

  // Resolve slug for navigation (storeSlug -> storeLink -> URL fallback)
  const resolvedSlug = useMemo(() => {
    if (storeSlug) return storeSlug;
    if (currentStore?.storeLink) {
      const parts = currentStore.storeLink.split('/').filter(Boolean);
      if (parts.length > 0) return parts.pop();
    }
    const path = window.location?.pathname || '';
    const match = path.match(/\/store\/([^/]+)/);
    return match ? match[1] : null;
  }, [storeSlug, currentStore?.storeLink]);

  // Build image gallery - prefer variant images if available, otherwise use product images
  const imageList = useMemo(() => {
    // First try variant-specific images
    let rawImages = displayVariant?.images || [];
    
    // Fallback to product images if no variant images
    if (!rawImages || rawImages.length === 0) {
      rawImages = currentProduct?.product?.productImages || [];
    }
    
    let normalizedImages = [];

    if (Array.isArray(rawImages)) {
      normalizedImages = rawImages;
    } else if (rawImages) {
      // handle string or single url value
      normalizedImages = String(rawImages)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const imgs =
      normalizedImages.map((img) => {
        if (!img) return null;
        return img.imageUrl || img.url || img;
      }) || [];

    // Primary: prefer first uploaded image, fall back to transformed image, then fallback from URL params, then placeholder
    const primary = imgs.length > 0
      ? imgs[0]
      : currentProduct?.image || fallbackImage || '/assets/products/p1.jpg';

    // If only one product image and a size chart exists, surface it as a second image
    if (imgs.length <= 1 && backend.sizeChartImage) {
      imgs.push(backend.sizeChartImage);
    }

    // Use all images in order, de-duped
    // Always include fallback image if we don't have product images yet
    const imagesToUse = imgs.length > 0 ? imgs : (fallbackImage ? [fallbackImage] : [primary]);
    const uniqueImages = Array.from(new Set([primary, ...imagesToUse].filter(Boolean)));
    return uniqueImages;
  }, [currentProduct, fallbackImage, backend.sizeChartImage, displayVariant]);

  useEffect(() => {
    if (imageList && imageList.length > 0) {
      setCurrentImageIndex(0);
    }
  }, [imageList]);

  // Ensure selectedImage always has a value - use fallback if needed
  const selectedImage = imageList[currentImageIndex] || fallbackImage || '/assets/products/p1.jpg';

  const handlePrevImage = () => {
    if (!imageList.length) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? imageList.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    if (!imageList.length) return;
    setCurrentImageIndex((prev) =>
      prev === imageList.length - 1 ? 0 : prev + 1
    );
  };

  // Use variant price if variant is selected, otherwise use product price
  const priceToShow = displayVariant?.price ?? currentProduct?.price ?? fallbackPrice ?? 0;
  const originalPriceToShow = displayVariant?.mrp ?? currentProduct?.originalPrice ?? fallbackOriginalPrice ?? priceToShow;
  const brandToShow = currentProduct?.brand || fallbackBrand;
  const categoryToShow = currentProduct?.category || fallbackCategory;

  const discountPct =
    Number(originalPriceToShow) > Number(priceToShow)
      ? Math.round(((Number(originalPriceToShow) - Number(priceToShow)) / Number(originalPriceToShow)) * 100)
      : 0;

  // SmartBiz VISIBILITY GATE for buy button:
  // Product is buyable only if active and has stock (prefer totalStock, fallback to inventory)
  const totalStock = typeof backend.totalStock === 'number' ? backend.totalStock : inventory;
  const isBuyable = isActive && (totalStock == null || Number(totalStock) > 0);

  // Find cart item for this product
  const cartItem = useMemo(() => {
    const productId = productIdParam || currentProduct?.id;
    if (!productId) return null;
    return cart.find(item => String(item.id) === String(productId) || String(item.productId) === String(productId));
  }, [cart, productIdParam, currentProduct?.id]);

  const handleAddToCart = () => {
    const productToAdd = currentProduct || {
      name: fallbackName,
      price: parseFloat(priceToShow),
      image: selectedImage,
      brand: brandToShow,
      id: productIdParam
    };

    // Use selected variant if available, otherwise use first available variant
    const variantToAdd = selectedVariant || (processedVariants.length > 0 ? processedVariants[0] : null);
    const variantId = variantToAdd?.variantId || null;
    const variantPrice = variantToAdd?.price || parseFloat(productToAdd.price);

    addToCart(
      {
        name: productToAdd.name,
        price: variantPrice,
        image: selectedImage || productToAdd.image || fallbackImage,
        brand: productToAdd.brand || currentStore?.name || 'Store',
        quantity: 1,
        productId: productToAdd.id,
        variantId: variantId, // SmartBiz: include variantId if available
        color: variantToAdd?.color,
        size: variantToAdd?.size
      },
      currentStore?.storeId || currentStore?.id,
      currentStore?.sellerId
    );
  };

  const handleQuantityChange = (newQuantity) => {
    if (!cartItem) return;
    // Use cartItem.id directly - this is the actual ID stored in the cart
    const quantity = Math.max(0, newQuantity);
    updateQuantity(cartItem.id, quantity);
  };

  const handleViewCart = () => {
    const cartPath = resolvedSlug ? `/store/${resolvedSlug}/cart` : '/cart';
    navigate(cartPath);
  };

  const handleBuyNow = () => {
    if (!cartItem) {
      handleAddToCart();
    }
    const cartPath = resolvedSlug ? `/store/${resolvedSlug}/cart` : '/cart';
    navigate(cartPath);
  };

  const relatedProducts = useMemo(() => {
    if (!currentProduct || !categoryToShow) return [];
    return products
      .filter(
        (p) =>
          p.id !== currentProduct.id &&
          p.category &&
          p.category.toLowerCase() === categoryToShow.toLowerCase()
      )
      .slice(0, 4);
  }, [products, currentProduct, categoryToShow]);

  // Show loading only if we're actually fetching AND we don't have fallback data to show
  if (loading && actualSlug && !fallbackName) {
    return <Loading fullScreen text="Loading product..." />;
  }

  // Show error only if we have an actual error and no fallback data
  if (error && !fallbackName && !currentProduct) {
    return <ErrorMessage message={error} />;
  }

  // If no product found and no fallback data, show error
  if (!currentProduct && !fallbackName) {
    // If we're still loading, show loading instead of error
    if (loading || storeLoading) {
      return <Loading fullScreen text="Loading product..." />;
    }
    return <ErrorMessage message="Product not found." />;
  }

  // If we have fallback data, render the page immediately (even while loading full product data)
  // This prevents the blank page issue

  // Ensure we always have something to render - use fallback data if currentProduct is not loaded yet
  const displayName = currentProduct?.name || fallbackName || 'Product';
  const displayPrice = currentProduct?.price || fallbackPrice || 0;
  const displayImage = selectedImage || fallbackImage || '/assets/products/p1.jpg';

  return (
    <div className="container product-detail-page" style={{ padding: '2rem 0' }}>
      <div className="product-detail-grid">
        <div className="product-detail-media">
          {displayImage && (
            <div className="product-detail-image-frame">
              <img
                src={displayImage}
                alt={displayName}
                className="product-detail-image"
              />
              {imageList.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    aria-label="Previous image"
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '12px',
                      transform: 'translateY(-50%)',
                      border: isDarkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid #e5e7eb',
                      background: 'var(--card-bg)',
                      borderRadius: '999px',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.08)'
                    }}
                  >
                    ‹
                  </button>
                  <button
                    onClick={handleNextImage}
                    aria-label="Next image"
                    style={{
                      position: 'absolute',
                      top: '50%',
                      right: '12px',
                      transform: 'translateY(-50%)',
                      border: isDarkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid #e5e7eb',
                      background: 'var(--card-bg)',
                      borderRadius: '999px',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.08)'
                    }}
                  >
                    ›
                  </button>
                </>
              )}
            </div>
          )}
          {imageList.length > 1 && (
            <div className="product-detail-thumbs">
              {imageList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`product-detail-thumb-btn ${currentImageIndex === idx ? 'active' : ''}`}
                >
                  <img
                    src={img}
                    alt="thumb"
                    className="product-detail-thumb-img"
                  />
                </button>
              ))}
            </div>
          )}

          {cartItem && isBuyable ? (
            <div className="product-detail-actions">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: `2px solid var(--vibrant-pink)`, borderRadius: '12px', padding: '0.5rem 0.75rem', background: isDarkMode ? 'var(--nav-bg)' : 'var(--white-content)' }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleQuantityChange(Math.max(0, cartItem.quantity - 1));
                  }}
                  style={{
                    width: '32px',
                    height: '32px',
                    border: 'none',
                    background: 'transparent',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    color: 'var(--vibrant-pink)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    outline: 'none',
                    boxShadow: 'none',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.color = 'var(--vibrant-pink-alt)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--vibrant-pink)';
                  }}
                >
                  −
                </button>
                <input
                  type="number"
                  value={cartItem.quantity}
                  onChange={(e) => {
                    const qty = parseInt(e.target.value);
                    if (!isNaN(qty) && qty >= 0) {
                      handleQuantityChange(qty);
                    }
                  }}
                  style={{
                    width: '50px',
                    textAlign: 'center',
                    border: 'none',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'var(--vibrant-pink)',
                    background: 'transparent'
                  }}
                  min="0"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleQuantityChange(cartItem.quantity + 1);
                  }}
                  style={{
                    width: '32px',
                    height: '32px',
                    border: 'none',
                    background: 'transparent',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    color: 'var(--vibrant-pink)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    outline: 'none',
                    boxShadow: 'none',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.color = 'var(--vibrant-pink-alt)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--vibrant-pink)';
                  }}
                >
                  +
                </button>
              </div>
              <button
                onClick={handleViewCart}
                style={{
                  width: '100%',
                  padding: '0.9rem 1rem',
                  fontSize: '1rem',
                  background: 'var(--vibrant-pink)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(232, 59, 143, 0.3)',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--vibrant-pink-alt)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(232, 59, 143, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--vibrant-pink)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(232, 59, 143, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                View Cart
              </button>
            </div>
          ) : isBuyable ? (
            <div className="product-detail-actions-row">
              <button
                onClick={handleAddToCart}
                style={{
                  flex: 1,
                  padding: '0.9rem 1rem',
                  fontSize: '1rem',
                  background: 'var(--vibrant-pink)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(232, 59, 143, 0.3)',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--vibrant-pink-alt)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(232, 59, 143, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--vibrant-pink)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(232, 59, 143, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                style={{
                  flex: 1,
                  padding: '0.9rem 1rem',
                  fontSize: '1rem',
                  background: 'var(--vibrant-pink)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(232, 59, 143, 0.3)',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--vibrant-pink-alt)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(232, 59, 143, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--vibrant-pink)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(232, 59, 143, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Buy Now
              </button>
            </div>
          ) : (
            <div style={{ marginTop: '1rem' }}>
              <p style={{ color: '#b91c1c', fontWeight: 600 }}>
                This product is currently unavailable.
              </p>
            </div>
          )}
        </div>

        <div style={{ paddingTop: '0.15rem' }}>
          <h1 style={{ margin: 0, marginBottom: '0.5rem' }}>{displayName}</h1>
          {brandToShow && <p style={{ color: isDarkMode ? 'rgba(245,245,245,0.72)' : '#666', marginBottom: '0.5rem' }}>{currentStore?.name || 'Store'} - {brandToShow}</p>}
          {categoryToShow && <p style={{ color: isDarkMode ? 'rgba(245,245,245,0.6)' : '#888', marginBottom: '0.5rem' }}>Category: {categoryToShow}</p>}

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {isBestseller && (
              <span className="product-badge bestseller" style={{ position: 'relative' }}>
                Bestseller
              </span>
            )}
            {!isActive && (
              <span className="product-badge sale" style={{ position: 'relative' }}>
                Inactive
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: '700' }}>₹{Number(priceToShow).toLocaleString('en-IN')}</span>
            {originalPriceToShow && Number(originalPriceToShow) > Number(priceToShow) && (
              <span style={{ textDecoration: 'line-through', color: '#999' }}>
                ₹{Number(originalPriceToShow).toLocaleString('en-IN')}
              </span>
          )}
            {discountPct > 0 && (
              <span style={{ color: 'var(--vibrant-pink)', fontWeight: 700 }}>{discountPct}% Off</span>
            )}
          </div>
          <p style={{ color: '#888', marginTop: '-0.5rem' }}>Inclusive of all taxes</p>

          {/* Variant Selection UI (Amazon-style) */}
          {processedVariants.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              {/* Color Selection */}
              {variantGroups.colors.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Color:</span>
                    {selectedVariant?.color && (
                      <span style={{ fontSize: '0.9rem', color: isDarkMode ? 'rgba(245,245,245,0.72)' : '#666' }}>
                        {selectedVariant.color}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {variantGroups.colors.map((colorOption) => {
                      const isSelected = selectedVariant?.color === colorOption;
                      const hasStock = processedVariants.some(v => v.color === colorOption && v.stock > 0);
                      return (
                        <button
                          key={colorOption}
                          onClick={() => handleVariantSelection(colorOption, selectedVariant?.size)}
                          disabled={!hasStock}
                          style={{
                            padding: '0.5rem 1rem',
                            border: `2px solid ${isSelected ? 'var(--vibrant-pink)' : (isDarkMode ? 'rgba(255,255,255,0.2)' : '#e5e7eb')}`,
                            borderRadius: '8px',
                            background: isSelected 
                              ? 'var(--vibrant-pink)' 
                              : (isDarkMode ? 'var(--nav-bg)' : '#fff'),
                            color: isSelected ? '#fff' : (isDarkMode ? 'var(--text-color)' : '#111827'),
                            cursor: hasStock ? 'pointer' : 'not-allowed',
                            opacity: hasStock ? 1 : 0.5,
                            fontWeight: isSelected ? 600 : 400,
                            fontSize: '0.9rem',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (hasStock && !isSelected) {
                              e.currentTarget.style.borderColor = 'var(--vibrant-pink)';
                              e.currentTarget.style.background = isDarkMode ? 'rgba(230, 21, 128, 0.1)' : '#fce7f3';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.2)' : '#e5e7eb';
                              e.currentTarget.style.background = isDarkMode ? 'var(--nav-bg)' : '#fff';
                            }
                          }}
                        >
                          {colorOption}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {variantGroups.sizes.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Size:</span>
                    {selectedVariant?.size && (
                      <span style={{ fontSize: '0.9rem', color: isDarkMode ? 'rgba(245,245,245,0.72)' : '#666' }}>
                        {selectedVariant.size}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {variantGroups.sizes.map((sizeOption) => {
                      const isSelected = selectedVariant?.size === sizeOption;
                      const hasStock = processedVariants.some(v => 
                        v.size === sizeOption && 
                        v.stock > 0 &&
                        (!selectedVariant?.color || v.color === selectedVariant.color)
                      );
                      return (
                        <button
                          key={sizeOption}
                          onClick={() => handleVariantSelection(selectedVariant?.color, sizeOption)}
                          disabled={!hasStock}
                          style={{
                            padding: '0.5rem 1rem',
                            border: `2px solid ${isSelected ? 'var(--vibrant-pink)' : (isDarkMode ? 'rgba(255,255,255,0.2)' : '#e5e7eb')}`,
                            borderRadius: '8px',
                            background: isSelected 
                              ? 'var(--vibrant-pink)' 
                              : (isDarkMode ? 'var(--nav-bg)' : '#fff'),
                            color: isSelected ? '#fff' : (isDarkMode ? 'var(--text-color)' : '#111827'),
                            cursor: hasStock ? 'pointer' : 'not-allowed',
                            opacity: hasStock ? 1 : 0.5,
                            fontWeight: isSelected ? 600 : 400,
                            fontSize: '0.9rem',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (hasStock && !isSelected) {
                              e.currentTarget.style.borderColor = 'var(--vibrant-pink)';
                              e.currentTarget.style.background = isDarkMode ? 'rgba(230, 21, 128, 0.1)' : '#fce7f3';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.2)' : '#e5e7eb';
                              e.currentTarget.style.background = isDarkMode ? 'var(--nav-bg)' : '#fff';
                            }
                          }}
                        >
                          {sizeOption}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="product-detail-info-grid">
            <DetailItem label="SKU" value={sku} />
            <DetailItem label="HSN" value={hsnCode} />
            {!processedVariants.length && (
              <>
                <DetailItem label="Color" value={color} />
                <DetailItem label="Size" value={size} />
                <DetailItem label="Variant" value={variant} />
              </>
            )}
            <DetailItem label="Category" value={productCategory || categoryToShow} />
            <DetailItem
              label="Stock"
              value={
                inventory !== undefined && inventory !== null
                  ? inventory > 0
                    ? `${inventory} available`
                    : 'Out of stock'
                  : '—'
              }
              highlight={inventory !== undefined && inventory !== null && inventory > 0}
            />
            <DetailItem label="Active" value={isActive ? 'Yes' : 'No'} highlight={isActive} />
            <DetailItem label="Bestseller" value={isBestseller ? 'Yes' : 'No'} highlight={isBestseller} />
            <DetailItem label="SEO Title" value={seoTitle} />
            <DetailItem label="SEO Description" value={seoDescription} />
          </div>

          {description && (
            <div style={{ marginTop: '1.5rem', color: isDarkMode ? 'rgba(245,245,245,0.75)' : '#444', lineHeight: 1.6 }}>
              <h3 style={{ marginBottom: '0.5rem' }}>Product Description</h3>
              <p>{description}</p>
            </div>
          )}

          <div style={{ marginTop: '1.5rem', color: isDarkMode ? 'rgba(245,245,245,0.72)' : '#555', lineHeight: 1.6 }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Delivery & Returns</h3>
            <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
              <li>Delivered in 3-5 days (varies by pincode)</li>
              <li>Free shipping on all orders</li>
              <li>Easy returns within 2 days of delivery (store policy applies)</li>
            </ul>
          </div>

          <div className="product-detail-feature-grid">
            <FeaturePill icon="💳" label="Secure Payments" />
            <FeaturePill icon="🏅" label="Assured Quality" />
            <FeaturePill icon="🧵" label="Made in India" />
            <FeaturePill icon="🚚" label="Timely Delivery" />
          </div>
        </div>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>You may also like</h2>
        {relatedProducts.length === 0 ? (
          <p style={{ color: isDarkMode ? 'rgba(245,245,245,0.72)' : '#666' }}>No related products found.</p>
        ) : (
          <div className="product-detail-related-grid">
            {relatedProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;

const DetailItem = ({ label, value, highlight = false }) => {
  if (!value) return null;
  const { isDarkMode } = useTheme();
  return (
    <div
      style={{
        background: isDarkMode ? 'var(--nav-bg)' : 'var(--white-content)',
        border: isDarkMode ? '1px solid var(--muted-white)' : '1px solid var(--light-pink)',
        borderRadius: '12px',
        padding: '0.6rem 0.75rem',
        minHeight: '54px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.08)'
      }}
    >
      <span style={{ fontSize: '0.78rem', color: isDarkMode ? 'var(--text-secondary)' : '#6b7280', marginBottom: '0.18rem' }}>{label}</span>
      <span style={{ fontWeight: 600, fontSize: '0.95rem', color: highlight ? 'var(--vibrant-pink)' : (isDarkMode ? 'var(--text-color)' : '#111827'), overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{value}</span>
    </div>
  );
};

const FeaturePill = ({ icon, label }) => {
  const { isDarkMode } = useTheme();
  return (
    <div
      style={{
        background: isDarkMode ? 'var(--nav-bg)' : 'var(--white-content)',
        border: isDarkMode ? '1px solid var(--muted-white)' : '1px solid var(--light-pink)',
        borderRadius: '12px',
        padding: '0.9rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        fontWeight: 600,
        color: isDarkMode ? 'var(--text-color)' : '#111827',
        minHeight: '52px',
        boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.08)'
      }}
    >
      <span style={{ fontSize: '1.2rem' }}>{icon}</span>
      <span>{label}</span>
    </div>
  );
};

