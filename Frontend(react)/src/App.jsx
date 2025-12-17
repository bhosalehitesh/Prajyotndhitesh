import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext.jsx';
import { WishlistProvider } from './contexts/WishlistContext.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { StoreProvider } from './contexts/StoreContext.jsx';

// Layout
import Layout from './components/Layout';

// Pages
import Home from './pages/Home';
import Categories from './pages/Categories';
import Featured from './pages/Featured';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Search from './pages/Search';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import ConfirmOrder from './pages/ConfirmOrder';
import OrderSuccess from './pages/OrderSuccess';
import Wishlist from './pages/Wishlist';
import Orders from './pages/Orders';
import OrderTracking from './pages/OrderTracking';
import FAQ from './pages/FAQ';
import Collections from './pages/Collections';
import RazorpayTest from './pages/RazorpayTest';

// Components
import ErrorBoundary from './components/ErrorBoundary';
import CartStoreSync from './components/CartStoreSync';

// Import CSS
import './styles.css';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <StoreProvider>
              <CartProvider>
                <CartStoreSync />
                <WishlistProvider>
                  <Layout>
                    <Routes>
                      {/* PRIMARY: Store-specific routes - /store/:slug/* */}
                      <Route path="/store/:slug" element={<Home />} />
                      <Route path="/store/:slug/categories" element={<Categories />} />
                      <Route path="/store/:slug/featured" element={<Featured />} />
                      <Route path="/store/:slug/products" element={<Products />} />
                      <Route path="/store/:slug/collections" element={<Collections />} />
                      <Route path="/store/:slug/product/detail" element={<ProductDetail />} />
                      <Route path="/store/:slug/search" element={<Search />} />
                      <Route path="/store/:slug/cart" element={<Cart />} />
                      <Route path="/store/:slug/checkout" element={<Checkout />} />
                      <Route path="/store/:slug/checkout/confirm" element={<ConfirmOrder />} />
                      <Route path="/store/:slug/checkout/payment" element={<RazorpayTest />} />
                      <Route path="/store/:slug/order/success" element={<OrderSuccess />} />
                      <Route path="/store/:slug/wishlist" element={<Wishlist />} />
                      <Route path="/store/:slug/orders" element={<Orders />} />
                      <Route path="/store/:slug/order-tracking" element={<OrderTracking />} />
                      <Route path="/store/:slug/faq" element={<FAQ />} />
                      
                      {/* Fallback: Root-level routes (non-store) */}
                      <Route path="/" element={<Home />} />
                      <Route path="/categories" element={<Categories />} />
                      <Route path="/featured" element={<Featured />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/collections" element={<Collections />} />
                      <Route path="/product/detail" element={<ProductDetail />} />
                      <Route path="/search" element={<Search />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/checkout/confirm" element={<ConfirmOrder />} />
                      {/* Payment test page (root-level) */}
                      <Route path="/checkout/payment" element={<RazorpayTest />} />
                      <Route path="/order/success" element={<OrderSuccess />} />

                      {/* Extra fallback for store checkout without slug (e.g. /store/checkout/payment) */}
                      <Route path="/store/checkout" element={<Checkout />} />
                      <Route path="/store/checkout/payment" element={<RazorpayTest />} />
                      <Route path="/wishlist" element={<Wishlist />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/order-tracking" element={<OrderTracking />} />
                      <Route path="/faq" element={<FAQ />} />
                    </Routes>
                  </Layout>
                </WishlistProvider>
              </CartProvider>
            </StoreProvider>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
