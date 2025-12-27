# ABhidnya - E-commerce React Application

A modern, responsive e-commerce web application built with React, featuring a complete shopping experience with cart management, wishlist, authentication, and more.

## 🚀 Features

- **Responsive Design**: Mobile-first approach with desktop and mobile views
- **Shopping Cart**: Add, remove, and manage cart items
- **Wishlist**: Save favorite products
- **User Authentication**: OTP-based phone number authentication
- **Product Browsing**: Categories, Featured Products, Collections
- **Search Functionality**: Search products across the store
- **Dark Mode**: Toggle between light and dark themes
- **Order Tracking**: Track your orders
- **Mobile Sidebar**: Beautiful mobile navigation menu

## 📁 Project Structure

```
src/
├── components/          # Reusable React components
│   ├── Header/          # Header components (modular)
│   │   ├── index.jsx
│   │   ├── LoginModal.jsx
│   │   ├── MobileSidebar.jsx
│   │   ├── ProfileSidebar.jsx
│   │   └── SearchModal.jsx
│   ├── ui/              # UI components (Button, Card, Loading, etc.)
│   ├── Breadcrumb.jsx
│   ├── ErrorBoundary.jsx
│   ├── Footer.jsx
│   ├── Header.jsx
│   ├── Layout.jsx
│   └── ProductCard.jsx
│
├── contexts/            # React Context providers
│   ├── AuthContext.jsx
│   ├── CartContext.jsx
│   ├── StoreContext.jsx
│   ├── ThemeContext.jsx
│   └── WishlistContext.jsx
│
├── pages/               # Page components
│   ├── Home.jsx
│   ├── Categories.jsx
│   ├── Featured.jsx
│   ├── Products.jsx
│   ├── Collections.jsx
│   ├── ProductDetail.jsx
│   ├── Cart.jsx
│   ├── Wishlist.jsx
│   ├── Orders.jsx
│   ├── OrderTracking.jsx
│   ├── Search.jsx
│   └── FAQ.jsx
│
├── hooks/               # Custom React hooks
│   ├── useDebounce.js
│   └── useLocalStorage.js
│
├── utils/               # Utility functions
│   ├── api.js
│   ├── format.js
│   ├── validation.js
│   ├── helpers.js
│   └── localStorage.js
│
├── constants/           # Application constants
│   ├── api.js
│   ├── config.js
│   ├── data.js
│   ├── index.js
│   └── routes.js
│
├── App.jsx              # Main application component
├── main.jsx             # Application entry point
├── index.css            # Global styles
└── styles.css           # Component styles
```

## 🛠️ Technology Stack

- **React 18**: UI library
- **React Router**: Navigation and routing
- **Vite**: Build tool and dev server
- **Context API**: State management
- **LocalStorage**: Data persistence

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎨 Key Components

### Contexts
- **AuthContext**: Manages user authentication state
- **CartContext**: Handles shopping cart operations
- **WishlistContext**: Manages wishlist items
- **ThemeContext**: Controls dark/light mode
- **StoreContext**: Manages store information

### Pages
- **Home**: Landing page with featured products and banners
- **Products**: Product listing page
- **ProductDetail**: Individual product details
- **Cart**: Shopping cart page
- **Wishlist**: Saved products page

## 📱 Responsive Design

The application features:
- **Desktop View**: Full navigation bar with all features
- **Mobile View**: Hamburger menu with sidebar navigation
- **Tablet View**: Optimized layout for medium screens

## 🔧 Configuration

### API Configuration
Update API endpoints in `src/constants/api.js`:
```javascript
export const getBackendUrl = () => {
  // Configure your backend URL
};
```

### Routes
All routes are defined in `src/constants/routes.js` for easy maintenance.

## 📝 Code Structure Best Practices

1. **Components**: Reusable, single-responsibility components
2. **Contexts**: Global state management
3. **Hooks**: Custom hooks for reusable logic
4. **Utils**: Pure utility functions
5. **Constants**: Centralized configuration
6. **Pages**: Route-level components

## 🚀 Development

```bash
# Development mode
npm run dev

# The app will be available at http://localhost:5173
```

## 📄 License

This project is part of the ABhidnya e-commerce platform.
