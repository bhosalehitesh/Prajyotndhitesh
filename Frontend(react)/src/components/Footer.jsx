import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';

const Footer = () => {
  const { currentStore } = useStore();

  const storeName = currentStore?.name || 'Store';
  
  // Get store address from storeAddress object (if available)
  const storeAddressObj = currentStore?.storeAddress || {};
  
  // Build formatted address from storeAddress fields
  const formatStoreAddress = () => {
    if (!storeAddressObj || Object.keys(storeAddressObj).length === 0) {
      // Fallback to simple address string if available
      return currentStore?.businessAddress ||
             currentStore?.address ||
             currentStore?.shopAddress ||
             'Shraddha Garden, Gawade Colony, Chinchwad, Maharashtra, 411019';
    }
    
    const parts = [];
    if (storeAddressObj.shopNoBuildingCompanyApartment) {
      parts.push(storeAddressObj.shopNoBuildingCompanyApartment);
    }
    if (storeAddressObj.areaStreetSectorVillage) {
      parts.push(storeAddressObj.areaStreetSectorVillage);
    }
    if (storeAddressObj.landmark) {
      parts.push(storeAddressObj.landmark);
    }
    if (storeAddressObj.townCity) {
      parts.push(storeAddressObj.townCity);
    }
    if (storeAddressObj.state) {
      parts.push(storeAddressObj.state);
    }
    if (storeAddressObj.pincode) {
      parts.push(storeAddressObj.pincode);
    }
    
    return parts.length > 0 ? parts.join(', ') : 'Shraddha Garden, Gawade Colony, Chinchwad, Maharashtra, 411019';
  };
  
  const storeAddress = formatStoreAddress();
  const storePhone = currentStore?.phone || '+91 7588933972';

  return (
    <footer className="site-footer">
      <div className="footer-container container">
        <div className="footer-column contact-info">
          <div className="footer-avatar">V</div>
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

