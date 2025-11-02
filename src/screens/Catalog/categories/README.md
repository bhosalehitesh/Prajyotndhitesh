# Categories Module

Manages product categories with full CRUD operations and sharing capabilities.

## Files

- **CategoriesScreen.tsx**: Categories list with search and actions
- **AddCategoryScreen.tsx**: Form for adding/editing categories (also used for EditCategory)
- **index.ts**: Module exports

## Features

- Category listing with search
- Add/Edit/Delete categories
- Image upload for category
- Business category selection
- Share functionality (WhatsApp, Messages, Chrome, Snapchat, etc.)
- Bottom sheet with action options

## Navigation

- Navigate from: `CatalogScreen` → `Categories`
- Navigate to: `AddCategory` (via FAB or bottom sheet Edit option)
- Edit mode: `EditCategory` (reuses AddCategoryScreen)

## Bottom Sheet Actions

- Edit Category → Opens EditCategory screen
- Share Category → Opens share sheet
- Delete Category → Shows confirmation modal

