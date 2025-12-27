import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';
import { ROUTES, getRoute } from '../constants/routes';

const Footer = () => {
  const { currentStore, storeSlug } = useStore();

  const storeName = currentStore?.name || 'Store';
  const logoUrl = currentStore?.logo;

  // Get store address from storeAddress object (if available) - this comes from the profile/database
  const storeAddressObj = currentStore?.storeAddress || {};

  // Debug: Log address data to verify it's being loaded from profile
  useEffect(() => {
    if (currentStore?.storeAddress) {
      console.log('📍 [Footer] Store address loaded from profile:', currentStore.storeAddress);
    } else {
      console.log('⚠️ [Footer] No storeAddress found in currentStore, using fallback');
    }
  }, [currentStore?.storeAddress]);

  // Build formatted address from storeAddress fields (matches mobile app format)
  const formatStoreAddress = () => {
    // First try to use storeAddress object from profile/database
    if (storeAddressObj && Object.keys(storeAddressObj).length > 0) {
      console.log('📍 [Footer] Raw storeAddress from DB:', JSON.stringify(storeAddressObj, null, 2));

      const parts = [];

      // Build address in the same format as mobile app: "Building, Area, Landmark (optional), City, State, Pincode"
      // Order matches database: shopNoBuildingCompanyApartment, areaStreetSectorVillage, landmark, townCity, state, pincode
      if (storeAddressObj.shopNoBuildingCompanyApartment) {
        parts.push(storeAddressObj.shopNoBuildingCompanyApartment.trim());
      }
      if (storeAddressObj.areaStreetSectorVillage) {
        parts.push(storeAddressObj.areaStreetSectorVillage.trim());
      }
      // Include landmark only if it exists and is not empty (optional field)
      if (storeAddressObj.landmark && storeAddressObj.landmark.trim()) {
        parts.push(storeAddressObj.landmark.trim());
      }
      if (storeAddressObj.townCity) {
        parts.push(storeAddressObj.townCity.trim());
      }
      if (storeAddressObj.state) {
        parts.push(storeAddressObj.state.trim());
      }
      if (storeAddressObj.pincode) {
        parts.push(storeAddressObj.pincode.trim());
      }

      const formattedAddress = parts.join(', ');
      console.log('✅ [Footer] Formatted address from DB:', formattedAddress);
      console.log('📋 [Footer] Address parts:', parts);

      // Join with comma and space, matching mobile app format
      if (parts.length > 0) {
        return formattedAddress;
      }
    }

    // Fallback to simple address string if storeAddress object is not available
    console.log('⚠️ [Footer] No storeAddress object, using fallback');
    return currentStore?.businessAddress ||
      currentStore?.address ||
      currentStore?.shopAddress ||
      'Shraddha Garden, Gawade Colony, Chinchwad, Maharashtra, 411019';
  };

  const storeAddress = formatStoreAddress();
  const storePhone = currentStore?.phone || '+91 7588933972';
  const storeEmail = currentStore?.businessEmail || currentStore?.email || '';
  const storeDescription = currentStore?.description || 'We offer a wide range of products to meet all your needs, from everyday essentials to premium selections.';

  // Social media links - can be extended to use store data if available
  const socialLinks = {
    instagram: currentStore?.instagram || '#',
    facebook: currentStore?.facebook || '#',
    twitter: currentStore?.twitter || currentStore?.x || '#',
    youtube: currentStore?.youtube || '#',
    app: currentStore?.appLink || '#'
  };

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-main">
          {/* Left Column: Brand Info + Social Media */}
          <div className="footer-column footer-brand-column">
            <div className="footer-brand-section">
              <h2 className="footer-brand-name">{storeName}™</h2>
              <p className="footer-brand-description">{storeDescription}</p>
            </div>
            <div className="footer-social-media">
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Twitter/X">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="YouTube">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Middle Column: Extra Links */}
          <div className="footer-column">
            <h4 className="footer-heading">Extra links</h4>
            <ul className="footer-links">
              <li><Link to={storeSlug ? `/store/${storeSlug}` : '/'}>Home</Link></li>
              <li><Link to={getRoute(ROUTES.FAQ, storeSlug)}>FAQ</Link></li>
              <li><Link to={getRoute(ROUTES.ORDER_TRACKING, storeSlug)}>Track your Orders</Link></li>
              <li><a href="#">Store policies</a></li>
              <li><a href="#">About Us</a></li>
            </ul>
          </div>

          {/* Right Column: Contact */}
          <div className="footer-column">
            <h4 className="footer-heading">Contact</h4>
            <div className="footer-contact-info">
              <p className="contact-line">{storeAddress}</p>
              {storeEmail && (
                <p className="contact-line">
                  <a href={`mailto:${storeEmail}`}>{storeEmail}</a>
                </p>
              )}
              <p className="contact-line">
                <a href={`tel:${storePhone}`}>{storePhone}</a>
              </p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="payment-info">
              <span className="payment-label">We accept</span>
              <span className="payment-icon">💳</span>
              <span className="payment-method">Cash on Delivery</span>
            </div>
            <div className="powered-by">
              <span className="payment-label">Powered by </span>
              <img src="/assets/SmartBiz.png" alt="SmartBiz" className="smartbiz-logo" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

