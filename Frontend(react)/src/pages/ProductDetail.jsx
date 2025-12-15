import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
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
  const { addToCart } = useCart();
  const { storeSlug, currentStore } = useStore();

  const actualSlug = slug || storeSlug;
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
      if (!actualSlug) {
        setLoading(false);
        return;
      }
      try {
        const backendProducts = await getStoreProducts(actualSlug);
        const transformed = transformProducts(backendProducts, currentStore?.name || 'Store');
        setProducts(transformed);
      } catch (err) {
        console.error('❌ [ProductDetail] Error fetching products for detail page', err);
        setError('Unable to load product details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [actualSlug, currentStore?.name]);

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

  // Build image gallery
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

    // Primary: prefer first uploaded image, fall back to transformed image, then placeholder
    const primary = imgs.length > 0
      ? imgs[0]
      : currentProduct?.image || fallbackImage || '/assets/products/p1.jpg';

    // If only one product image and a size chart exists, surface it as a second image
    if (imgs.length <= 1 && backend.sizeChartImage) {
      imgs.push(backend.sizeChartImage);
    }

    // Use all images in order, de-duped
    const uniqueImages = Array.from(new Set([primary, ...imgs].filter(Boolean)));
    // Deduplicate
    return uniqueImages;
  }, [currentProduct, fallbackImage, backend.sizeChartImage]);

  useEffect(() => {
    if (imageList && imageList.length > 0) {
      setCurrentImageIndex(0);
    }
  }, [imageList]);

  const selectedImage = imageList[currentImageIndex] || null;

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
    alert('Added to cart!');
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

  if (loading) {
    return <Loading fullScreen text="Loading product..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!currentProduct && !fallbackName) {
    return <ErrorMessage message="Product not found." />;
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '2rem', alignItems: 'flex-start' }}>
        <div style={{ background: '#fafafa', borderRadius: '10px', padding: '1.2rem', position: 'relative' }}>
          {selectedImage && (
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
                src={selectedImage}
                alt={currentProduct?.name || fallbackName}
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
          <h1 style={{ marginBottom: '0.5rem' }}>{currentProduct?.name || fallbackName}</h1>
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

          <button
            onClick={handleAddToCart}
            style={{
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              background: 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
              marginBottom: '1rem'
            }}
          >
            Add to Cart
          </button>

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

