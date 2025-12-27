# Collections Module

Manages product collections with visibility controls and product association.

## Files

- **CollectionsScreen.tsx**: Collections list with search and toggle controls
- **AddCollectionScreen.tsx**: Form for adding/editing collections (also used for EditCollection)
- **SelectProductsScreen.tsx**: Screen for selecting products to add to a collection
- **index.ts**: Module exports

## Features

- Collection listing with search
- Add/Edit/Delete collections
- Image upload for collection
- Toggle "Hide from website" with success notifications
- Add products to collections
- Share functionality (WhatsApp, Messages, Chrome, Snapchat, etc.)
- Bottom sheet with action options

## Navigation

- Navigate from: `CatalogScreen` → `Collections`
- Navigate to: `AddCollection` (via FAB or bottom sheet Edit option)
- Navigate to: `SelectProducts` (from AddCollection → "Add products to Collection")
- Edit mode: `EditCollection` (reuses AddCollectionScreen)

## Bottom Sheet Actions

- Edit Collection → Opens EditCollection screen
- Share Collection → Opens share sheet
- Delete Collection → Shows confirmation modal

## Toggle Functionality

- **Toggle ON (Blue)**: Collection is hidden from website
- **Toggle OFF (Grey)**: Collection is visible on website
- Success toast appears when toggling (auto-dismisses after 2 seconds)

