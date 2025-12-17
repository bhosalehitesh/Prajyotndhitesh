import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
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
  const inventory = backend.inventoryQuantity;
  const hsnCode = backend.hsnCode;
  const sku = backend.customSku;
  const color = backend.color;
  const size = backend.size;
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

  // Build image gallery - always include fallback image if available
  const imageList = useMemo(() => {
    const rawImages = currentProduct?.product?.productImages;
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
  }, [currentProduct, fallbackImage, backend.sizeChartImage]);

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

  const priceToShow = currentProduct?.price || fallbackPrice || 0;
  const originalPriceToShow =
    currentProduct?.originalPrice || fallbackOriginalPrice || priceToShow;
  const brandToShow = currentProduct?.brand || fallbackBrand;
  const categoryToShow = currentProduct?.category || fallbackCategory;

  const discountPct =
    Number(originalPriceToShow) > Number(priceToShow)
      ? Math.round(((Number(originalPriceToShow) - Number(priceToShow)) / Number(originalPriceToShow)) * 100)
      : 0;

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

    addToCart(
      {
        name: productToAdd.name,
        price: parseFloat(productToAdd.price),
        image: selectedImage || productToAdd.image || fallbackImage,
        brand: productToAdd.brand || currentStore?.name || 'Store',
        quantity: 1,
        productId: productToAdd.id
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
    <div className="container" style={{ padding: '2rem 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '2rem', alignItems: 'flex-start' }}>
        <div style={{ background: '#fafafa', borderRadius: '10px', padding: '1.2rem', position: 'relative' }}>
          {displayImage && (
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '460px',
                aspectRatio: '4 / 5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f6f7fb',
                borderRadius: '12px',
                overflow: 'hidden',
                margin: '0 auto',
                boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
              }}
            >
              <img
                src={displayImage}
                alt={displayName}
                style={{
                  width: '100%',
                  height: '100%',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  padding: '8px'
                }}
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
                      border: '1px solid #e5e7eb',
                      background: '#fff',
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
                      border: '1px solid #e5e7eb',
                      background: '#fff',
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
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              {imageList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  style={{
                    border: currentImageIndex === idx ? '2px solid #f97316' : '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '6px',
                    background: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  <img
                    src={img}
                    alt="thumb"
                    style={{
                      width: '68px',
                      height: '68px',
                      objectFit: 'contain',
                      borderRadius: '6px',
                      background: '#f8fafc'
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>{displayName}</h1>
          {brandToShow && <p style={{ color: '#666', marginBottom: '0.5rem' }}>Brand: {brandToShow}</p>}
          {categoryToShow && <p style={{ color: '#888', marginBottom: '0.5rem' }}>Category: {categoryToShow}</p>}

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
              <span style={{ color: '#16a34a', fontWeight: 700 }}>{discountPct}% Off</span>
            )}
          </div>
          <p style={{ color: '#888', marginTop: '-0.5rem' }}>Inclusive of all taxes</p>

          {cartItem ? (
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '2px solid #f97316', borderRadius: '8px', padding: '0.5rem 0.75rem', background: '#fff' }}>
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
                    color: '#f97316',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    outline: 'none',
                    boxShadow: 'none',
                    transition: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.boxShadow = 'none';
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
                    color: '#f97316'
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
                    color: '#f97316',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    outline: 'none',
                    boxShadow: 'none',
                    transition: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  +
                </button>
              </div>
              <button
                onClick={handleViewCart}
                style={{
                  padding: '1rem 2rem',
                  fontSize: '1.05rem',
                  background: 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                  whiteSpace: 'nowrap'
                }}
              >
                View Cart
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={handleAddToCart}
                style={{
                  padding: '1rem 2rem',
                  fontSize: '1.05rem',
                  background: 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.12)'
                }}
              >
            Add to Cart
          </button>
              <button
                onClick={handleBuyNow}
                style={{
                  padding: '1rem 2rem',
                  fontSize: '1.05rem',
                  background: 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.12)'
                }}
              >
                Buy Now
              </button>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
            <DetailItem label="SKU" value={sku} />
            <DetailItem label="HSN" value={hsnCode} />
            <DetailItem label="Color" value={color} />
            <DetailItem label="Size" value={size} />
            <DetailItem label="Variant" value={variant} />
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
            <div style={{ marginTop: '1.5rem', color: '#444', lineHeight: 1.6 }}>
              <h3 style={{ marginBottom: '0.5rem' }}>Product Description</h3>
              <p>{description}</p>
            </div>
          )}

          <div style={{ marginTop: '1.5rem', color: '#555', lineHeight: 1.6 }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Delivery & Returns</h3>
            <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
              <li>Delivered in 3-5 days (varies by pincode)</li>
              <li>Free shipping on all orders</li>
              <li>Easy returns within 2 days of delivery (store policy applies)</li>
            </ul>
          </div>

          <div
            style={{
              marginTop: '1.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '0.75rem',
              alignItems: 'center'
            }}
          >
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
          <p style={{ color: '#666' }}>No related products found.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
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
  return (
    <div
      style={{
        background: '#f9fafb',
        border: '1px solid #eef0f2',
        borderRadius: '8px',
        padding: '0.75rem 0.9rem',
        minHeight: '64px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}
    >
      <span style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.25rem' }}>{label}</span>
      <span style={{ fontWeight: 600, color: highlight ? '#16a34a' : '#111827' }}>{value}</span>
    </div>
  );
};

const FeaturePill = ({ icon, label }) => (
  <div
    style={{
      background: '#f9fafb',
      border: '1px solid #eef0f2',
      borderRadius: '10px',
      padding: '0.9rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.65rem',
      fontWeight: 600,
      color: '#111827',
      minHeight: '52px'
    }}
  >
    <span style={{ fontSize: '1.2rem' }}>{icon}</span>
    <span>{label}</span>
  </div>
);

