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
import Wishlist from './pages/Wishlist';
import Orders from './pages/Orders';
import OrderTracking from './pages/OrderTracking';
import FAQ from './pages/FAQ';
import Collections from './pages/Collections';

// Components
import ErrorBoundary from './components/ErrorBoundary';

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
                <WishlistProvider>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/categories" element={<Categories />} />
                      <Route path="/featured" element={<Featured />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/collections" element={<Collections />} />
                      <Route path="/product/detail" element={<ProductDetail />} />
                      <Route path="/search" element={<Search />} />
                      <Route path="/cart" element={<Cart />} />
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
