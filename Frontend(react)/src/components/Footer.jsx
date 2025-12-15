import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-container container">
        <div className="footer-column contact-info">
          <div className="footer-avatar">V</div>
          <div className="address">
            <p><strong>Shraddha Garden, Gawade Colony</strong></p>
            <p>Chinchwad, Maharashtra, 411019</p>
          </div>
          <div className="phone">
            <p><strong>Talk to us</strong></p>
            <p><a href="tel:+917588933972">+91 7588933972</a></p>
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

