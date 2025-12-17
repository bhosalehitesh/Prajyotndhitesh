import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';

const Footer = () => {
  const { currentStore } = useStore();

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

  return (
    <footer className="site-footer">
      <div className="footer-container container">
        <div className="footer-column contact-info">
          <div className="footer-avatar">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={storeName}
                className="footer-logo-img"
                onError={(e) => {
                  console.error('Failed to load footer logo:', logoUrl);
                  e.target.style.display = 'none';
                  e.target.closest('.footer-avatar').textContent = storeName.charAt(0).toUpperCase();
                }}
              />
            ) : (
              storeName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="address">
            <p><strong>{storeName}</strong></p>
            <p>{storeAddress}</p>
          </div>
          <div className="phone">
            <p><strong>Talk to us</strong></p>
            <p><a href={`tel:${storePhone}`}>{storePhone}</a></p>
          </div>
        </div>

        <div className="footer-column">
          <h4>Help</h4>
          <ul>
            <li><Link to="/faq">FAQ</Link></li>
            <li><a href="#">Store policies</a></li>
            <li><Link to="/order-tracking">Track your Orders</Link></li>
            <li><a href="#">Return Policy</a></li>
            <li><a href="#">Privacy Policy</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Shop</h4>
          <ul>
            <li><a href="#">Mens all wear</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom container">
        <div className="payment-info">
          <span>We accept</span>
          <span className="icon">&#128179;</span>
          <span>Cash on Delivery</span>
        </div>
        <div className="powered-by">
          <span>Built with</span>
          <img src="/assets/SmartBiz.png" alt="Smartbiz by Sakhi" className="smartbiz-logo" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;

