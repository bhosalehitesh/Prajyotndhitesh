# Catalog Module

This module contains all catalog-related screens including Products, Categories, and Collections management.

## 📁 Folder Structure

```
Catalog/
├── CatalogScreen.tsx          # Main catalog screen with navigation to all modules
├── products/                  # Products module
│   ├── ProductsScreen.tsx     # Products list, filter, sort
│   ├── AddProductScreen.tsx   # Add/Edit product form
│   └── index.ts              # Exports
├── categories/                # Categories module
│   ├── CategoriesScreen.tsx   # Categories list with search
│   ├── AddCategoryScreen.tsx # Add/Edit category form
│   └── index.ts              # Exports
├── collections/               # Collections module
│   ├── CollectionsScreen.tsx  # Collections list with toggle
│   ├── AddCollectionScreen.tsx # Add/Edit collection form
│   ├── SelectProductsScreen.tsx # Product selection for collections
│   └── index.ts              # Exports
└── index.ts                  # Main exports
```

## 🎯 Features

### Products
- ✅ List all products with search
- ✅ Filter by inventory status, discount, price range
- ✅ Sort by name, price, discount
- ✅ Add new products
- ✅ Edit existing products
- ✅ Delete products
- ✅ Add products to collections
- ✅ Mark in/out of stock

### Categories
- ✅ List all categories with search
- ✅ Add new categories with image upload
- ✅ Edit categories
- ✅ Delete categories
- ✅ Share categories via multiple apps
- ✅ Business category selection

### Collections
- ✅ List all collections with search
- ✅ Add new collections with image upload
- ✅ Edit collections
- ✅ Delete collections
- ✅ Toggle "Hide from website" with success notifications
- ✅ Add products to collections
- ✅ Share collections via multiple apps

## 🚀 Navigation Flow

### From Catalog Screen:
1. **Click Products/Categories/Collections** → Opens respective list screen
2. **Click FAB (+ button)** → Opens menu:
   - Product → Navigates to AddProduct
   - Category → Navigates to AddCategory
   - Collection → Navigates to AddCollection

### From List Screens:
- **Categories**: 
  - Three dots (⋮) → Bottom sheet with Edit/Share/Delete
  - Add New Category button → AddCategory screen
  
- **Collections**:
  - Three dots (⋮) → Bottom sheet with Edit/Share/Delete
  - Toggle switch → Hides/shows from website
  - Add New Collection button → AddCollection screen
  
- **Products**:
  - Three dots (⋮) → Bottom sheet with actions
  - Add New Product button → AddProduct screen

## 📱 Screens Overview

### CatalogScreen.tsx
Main entry point with:
- Three navigation cards (Products, Categories, Collections)
- Floating Action Button (FAB) with expandable menu

### ProductsScreen.tsx
- Product listing with filters and sorting
- Search functionality
- Action sheet for product operations

### AddProductScreen.tsx
- Complete product form
- Image upload (camera/gallery)
- Business and product category selection
- Price, MRP, inventory fields

### CategoriesScreen.tsx
- Category listing with search
- Bottom sheet with Edit/Share/Delete options
- Share functionality with multiple apps

### AddCategoryScreen.tsx
- Category form with image upload
- Category name (max 30 chars)
- Description (max 250 chars)
- Business category selection

### CollectionsScreen.tsx
- Collection listing with search
- Toggle to hide/show from website
- Success toast notifications
- Bottom sheet with Edit/Share/Delete

### AddCollectionScreen.tsx
- Collection form with image upload
- Collection name (max 30 chars)
- Description (max 250 chars)
- Link to add products to collection

### SelectProductsScreen.tsx
- Product selection interface
- Checkbox selection for multiple products
- Search products
- Returns selected products to AddCollection

## 🔧 Shared Components

- **IconSymbol**: Custom icon component for consistent iconography
- **Share functionality**: Reusable share sheet with multiple apps

## 📝 Notes

- All screens use React Navigation
- Local state management (can be upgraded to Context/Redux)
- Image uploads support camera and gallery
- Share functionality supports WhatsApp, Messages, Chrome, Snapchat
- Form validation for required fields
- Character counters for text inputs

