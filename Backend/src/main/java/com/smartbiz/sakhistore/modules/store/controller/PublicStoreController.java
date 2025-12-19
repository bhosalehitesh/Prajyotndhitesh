package com.smartbiz.sakhistore.modules.store.controller;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.smartbiz.sakhistore.modules.store.model.StoreDetails;
import com.smartbiz.sakhistore.modules.store.service.StoreDetailsService;
import com.smartbiz.sakhistore.modules.product.model.Product;
import com.smartbiz.sakhistore.modules.product.service.ProductService;
import com.smartbiz.sakhistore.modules.category.model.Category;
import com.smartbiz.sakhistore.modules.category.service.CategoryService;
import com.smartbiz.sakhistore.modules.collection.model.collection;
import com.smartbiz.sakhistore.modules.collection.service.CollectionService;
import com.smartbiz.sakhistore.modules.store.model.Banner;
import com.smartbiz.sakhistore.modules.store.service.BannerService;
import com.smartbiz.sakhistore.modules.product.repository.ProductVariantRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/public/store")
@RequiredArgsConstructor
public class PublicStoreController {

    @Autowired
    private StoreDetailsService storeService;
    
    @Autowired
    private ProductService productService;
    
    @Autowired
    private CategoryService categoryService;
    
    @Autowired
    private CollectionService collectionService;
    
    @Autowired
    private BannerService bannerService;
    
    @Autowired
    private ProductVariantRepository productVariantRepository;

    /**
     * Get store details by slug (public endpoint)
     * Example: GET /api/public/store/brownn_boys
     */
    @GetMapping("/{slug}")
    public ResponseEntity<StoreDetails> getStoreBySlug(@PathVariable String slug) {
        System.out.println("🔍 [getStoreBySlug] Requested slug: '" + slug + "'");
        try {
            StoreDetails store = storeService.findBySlug(slug);
            System.out.println("✅ [getStoreBySlug] Store found: " + store.getStoreName() + " (ID: " + store.getStoreId() + ")");
            
            // Log storeAddress for debugging
            if (store.getStoreAddress() != null) {
                System.out.println("📍 [getStoreBySlug] StoreAddress found for slug '" + slug + "':");
                System.out.println("   - shopNoBuildingCompanyApartment: " + store.getStoreAddress().getShopNoBuildingCompanyApartment());
                System.out.println("   - areaStreetSectorVillage: " + store.getStoreAddress().getAreaStreetSectorVillage());
                System.out.println("   - landmark: " + store.getStoreAddress().getLandmark());
                System.out.println("   - townCity: " + store.getStoreAddress().getTownCity());
                System.out.println("   - state: " + store.getStoreAddress().getState());
                System.out.println("   - pincode: " + store.getStoreAddress().getPincode());
            } else {
                System.out.println("⚠️ [getStoreBySlug] No StoreAddress found for slug: " + slug);
            }
            
            return ResponseEntity.ok(store);
        } catch (NoSuchElementException e) {
            System.err.println("❌ [getStoreBySlug] Store not found: " + e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get products for a store by slug (public endpoint)
     * Example: GET /api/public/store/brownn_boys/products?category=shoes
     */
    @GetMapping("/{slug}/products")
    public ResponseEntity<?> getStoreProducts(
            @PathVariable String slug,
            @RequestParam(value = "category", required = false) String category) {
        try {
            System.out.println("🔍 [DEBUG] Fetching products for slug: " + slug);
            
            // Find store by slug
            StoreDetails store = storeService.findBySlug(slug);
            System.out.println("✅ [DEBUG] Store found: " + store.getStoreName() + " (ID: " + store.getStoreId() + ")");
            
            // Check if store has a seller
            if (store.getSeller() == null) {
                System.out.println("❌ [DEBUG] Store has NO seller - returning empty products");
                return ResponseEntity.ok(new java.util.ArrayList<>());
            }
            
            // Get seller ID from store
            Long sellerId = store.getSeller().getSellerId();
            System.out.println("📦 [DEBUG] Seller ID: " + sellerId);
            
            if (sellerId == null) {
                System.out.println("❌ [DEBUG] Seller ID is NULL - returning empty products");
                return ResponseEntity.ok(new java.util.ArrayList<>());
            }
            
            // Get products by seller (all products)
            List<Product> allProducts = productService.allProductForSeller(sellerId);
            System.out.println("📦 [DEBUG] Found " + allProducts.size() + " total products for seller " + sellerId);
            
            // SmartBiz VISIBILITY GATE (backend side):
            // Only include products that:
            // - are ACTIVE
            // - have a Category and that Category is ACTIVE
            // - have at least one ACTIVE variant with stock > 0
            List<Product> products = allProducts.stream()
                .filter(p -> {
                    boolean productActive = p.getIsActive() != null && p.getIsActive();
                    boolean hasCategory = p.getCategory() != null;
                    boolean categoryActive = hasCategory &&
                            (p.getCategory().getIsActive() == null || p.getCategory().getIsActive());
                    
                    // Check variants directly from database (not from lazy-loaded collection)
                    // This avoids issues with multiple JOIN FETCH
                    boolean hasActiveVariants = false;
                    try {
                        List<com.smartbiz.sakhistore.modules.product.model.ProductVariant> activeVariants = 
                            productVariantRepository.findByProduct_ProductsIdAndIsActiveTrue(p.getProductsId());
                        
                        if (activeVariants != null && !activeVariants.isEmpty()) {
                            System.out.println("   - Found " + activeVariants.size() + " active variants for product " + p.getProductsId());
                            for (com.smartbiz.sakhistore.modules.product.model.ProductVariant v : activeVariants) {
                                System.out.println("     Variant ID: " + v.getVariantId() + ", Stock: " + v.getStock() + ", Active: " + v.getIsActive());
                            }
                            hasActiveVariants = activeVariants.stream().anyMatch(v -> v.getStock() != null && v.getStock() > 0);
                        } else {
                            System.out.println("   - No active variants found for product " + p.getProductsId());
                        }
                    } catch (Exception e) {
                        System.err.println("⚠️ [DEBUG] Error checking variants for product " + p.getProductsId() + ": " + e.getMessage());
                        e.printStackTrace();
                    }
                    
                    // Detailed logging for debugging
                    if (!productActive || !hasCategory || !categoryActive || !hasActiveVariants) {
                        System.out.println("🔍 [DEBUG] Product filtered: " + p.getProductName() + " (ID: " + p.getProductsId() + ")");
                        System.out.println("   - productActive: " + productActive + " (isActive: " + p.getIsActive() + ")");
                        System.out.println("   - hasCategory: " + hasCategory + " (category: " + (p.getCategory() != null ? p.getCategory().getCategoryName() : "null") + ")");
                        System.out.println("   - categoryActive: " + categoryActive + " (category.isActive: " + (p.getCategory() != null ? p.getCategory().getIsActive() : "N/A") + ")");
                        System.out.println("   - hasActiveVariants: " + hasActiveVariants);
                    }
                    
                    return productActive && hasCategory && categoryActive && hasActiveVariants;
                })
                .toList();
            
            int inactiveOrHiddenCount = allProducts.size() - products.size();
            if (inactiveOrHiddenCount > 0) {
                System.out.println("⚠️ [DEBUG] Filtered out " + inactiveOrHiddenCount + " products (inactive / no category / hidden category / no active variants)");
            }
            System.out.println("📦 [DEBUG] " + products.size() + " visible products after SmartBiz visibility gate");
            
            // Log products without images (they might not display properly)
            long productsWithoutImages = products.stream()
                .filter(p -> p.getProductImages() == null || p.getProductImages().isEmpty())
                .count();
            if (productsWithoutImages > 0) {
                System.out.println("⚠️ [DEBUG] " + productsWithoutImages + " products have no images (may not display properly)");
            }
            
            // Filter by category if provided (category param is now a SLUG, not name)
            if (category != null && !category.isEmpty()) {
                int beforeFilter = products.size();
                
                // Resolve Category by SLUG for this seller, then filter by category_id (foreign key)
                Category matchedCategory = categoryService.findBySlugAndSellerId(category, sellerId);

                if (matchedCategory != null) {
                    Long resolvedCategoryId = matchedCategory.getCategory_id();
                    products = products.stream()
                        .filter(p -> p.getCategoryId() != null && p.getCategoryId().equals(resolvedCategoryId))
                        .toList();
                } else {
                    // If no matching category found, return empty list
                    products = java.util.Collections.emptyList();
                }

                System.out.println("🔍 [DEBUG] After category filter by slug (" + category + ") -> category_id (" + (matchedCategory != null ? matchedCategory.getCategory_id() : "null") + "): " + products.size() + " products (was " + beforeFilter + ")");
            }
            
            System.out.println("✅ [DEBUG] Returning " + products.size() + " products for slug: " + slug);
            return ResponseEntity.ok(products);
        } catch (NoSuchElementException e) {
            System.err.println("❌ [DEBUG] Store not found with slug: " + slug);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            // Log error and return empty list instead of error
            System.err.println("❌ [DEBUG] Error fetching products for store slug: " + slug);
            e.printStackTrace();
            return ResponseEntity.ok(new java.util.ArrayList<>());
        }
    }

    /**
     * Get featured (bestseller) products for a store by slug (public endpoint)
     * Only returns products marked as bestseller (is_bestseller = true AND is_active = true)
     * Example: GET /api/public/store/my-store/featured
     */
    @GetMapping("/{slug}/featured")
    public ResponseEntity<?> getStoreFeatured(@PathVariable String slug) {
        try {
            System.out.println("🔍 [DEBUG] Fetching featured products for slug: " + slug);
            StoreDetails store = storeService.findBySlug(slug);
            System.out.println("✅ [DEBUG] Store found: " + store.getStoreName() + " (ID: " + store.getStoreId() + ")");

            if (store.getSeller() == null || store.getSeller().getSellerId() == null) {
                System.out.println("❌ [DEBUG] Store has NO seller or seller ID is NULL - returning empty featured products");
                return ResponseEntity.ok(new java.util.ArrayList<>());
            }

            Long sellerId = store.getSeller().getSellerId();
            System.out.println("📦 [DEBUG] Seller ID: " + sellerId);
            
            // Get only bestseller products (is_bestseller = true AND is_active = true)
            List<Product> rawProducts = productService.getFeaturedProducts(sellerId);
            System.out.println("📦 [DEBUG] Found " + rawProducts.size() + " bestseller products for seller " + sellerId);

            // Apply same SmartBiz visibility gate used for /products:
            // product ACTIVE, category ACTIVE, at least one active variant
            List<Product> products = rawProducts.stream()
                .filter(p -> {
                    boolean productActive = p.getIsActive() != null && p.getIsActive();
                    boolean hasCategory = p.getCategory() != null;
                    boolean categoryActive = hasCategory &&
                            (p.getCategory().getIsActive() == null || p.getCategory().getIsActive());
                    
                    // Check variants directly from database (not from lazy-loaded collection)
                    boolean hasActiveVariants = false;
                    try {
                        List<com.smartbiz.sakhistore.modules.product.model.ProductVariant> activeVariants = 
                            productVariantRepository.findByProduct_ProductsIdAndIsActiveTrue(p.getProductsId());
                        hasActiveVariants = activeVariants != null && 
                            activeVariants.stream().anyMatch(v -> v.getStock() != null && v.getStock() > 0);
                    } catch (Exception e) {
                        System.err.println("⚠️ [DEBUG] Error checking variants for product " + p.getProductsId() + ": " + e.getMessage());
                    }
                    
                    return productActive && hasCategory && categoryActive && hasActiveVariants;
                })
                .toList();
            
            if (products == null || products.isEmpty()) {
                System.out.println("⚠️ [DEBUG] No bestseller products found - returning empty list");
                System.out.println("⚠️ [DEBUG] To show products here, mark them as bestseller in database: UPDATE products SET is_bestseller = 1 WHERE seller_id = " + sellerId + " AND is_active = 1");
            }
            
            System.out.println("✅ [DEBUG] Returning " + products.size() + " featured (bestseller) products for slug: " + slug);
            return ResponseEntity.ok(products);
        } catch (NoSuchElementException e) {
            System.err.println("❌ [DEBUG] Store not found with slug: " + slug);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("❌ [DEBUG] Error fetching featured products for store slug: " + slug);
            e.printStackTrace();
            return ResponseEntity.ok(new java.util.ArrayList<>());
        }
    }

    /**
     * Get categories for a store by slug (public endpoint)
     * Example: GET /api/public/store/brownn_boys/categories
     */
    @GetMapping("/{slug}/categories")
    public ResponseEntity<?> getStoreCategories(@PathVariable String slug) {
        try {
            System.out.println("🔍 [Categories API] Fetching categories for slug: " + slug);
            
            // Find store by slug
            StoreDetails store = storeService.findBySlug(slug);
            
            if (store == null) {
                System.out.println("❌ [Categories API] Store not found for slug: " + slug);
                return ResponseEntity.notFound().build();
            }
            
            System.out.println("✅ [Categories API] Store found: " + store.getStoreName() + " (ID: " + store.getStoreId() + ")");
            
            // Check if store has a seller
            if (store.getSeller() == null) {
                System.out.println("⚠️ [Categories API] Store has no seller linked");
                return ResponseEntity.ok(new java.util.ArrayList<>());
            }
            
            // Get seller ID from store
            Long sellerId = store.getSeller().getSellerId();
            
            if (sellerId == null) {
                System.out.println("⚠️ [Categories API] Seller ID is null");
                return ResponseEntity.ok(new java.util.ArrayList<>());
            }
            
            System.out.println("✅ [Categories API] Seller ID: " + sellerId);
            
            // Get categories by seller
            List<Category> categories = categoryService.allCategories(sellerId);
            System.out.println("📦 [Categories API] Total categories found: " + categories.size());

            // SmartBiz: only ACTIVE categories should appear in website navigation,
            // ordered by orderIndex
            List<Category> navCategories = categories.stream()
                    .filter(c -> c.getIsActive() == null || c.getIsActive())
                    .sorted((c1, c2) -> Integer.compare(c1.getOrderIndex(), c2.getOrderIndex()))
                    .toList();
            
            System.out.println("✅ [Categories API] Active categories: " + navCategories.size());
            
            if (navCategories.size() > 0) {
                System.out.println("📋 [Categories API] Category names: " + 
                    navCategories.stream()
                        .map(c -> c.getCategoryName())
                        .collect(java.util.stream.Collectors.joining(", ")));
            }
            
            return ResponseEntity.ok(navCategories);
        } catch (NoSuchElementException e) {
            System.err.println("❌ [Categories API] Store not found: " + slug);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            // Log error and return empty list instead of error
            System.err.println("❌ [Categories API] Error fetching categories for store slug: " + slug);
            e.printStackTrace();
            return ResponseEntity.ok(new java.util.ArrayList<>());
        }
    }

    /**
     * Get collections for a store by slug (public endpoint)
     * SmartBiz: Only ACTIVE collections, ordered by orderIndex (same as categories)
     * Example: GET /api/public/store/brownn_boys/collections
     */
    @GetMapping("/{slug}/collections")
    public ResponseEntity<?> getStoreCollections(@PathVariable String slug) {
        try {
            // Find store by slug
            StoreDetails store = storeService.findBySlug(slug);
            
            // Check if store has a seller
            if (store.getSeller() == null) {
                return ResponseEntity.ok(new java.util.ArrayList<>());
            }
            
            // Get seller ID from store
            Long sellerId = store.getSeller().getSellerId();
            
            if (sellerId == null) {
                return ResponseEntity.ok(new java.util.ArrayList<>());
            }
            
            // Get collections by seller
            List<collection> collections = collectionService.allCollections(sellerId);

            // SmartBiz: only ACTIVE collections should appear on website,
            // ordered by orderIndex (same as categories)
            List<collection> activeCollections = collections.stream()
                    .filter(c -> c.getIsActive() == null || c.getIsActive())
                    .sorted((c1, c2) -> Integer.compare(c1.getOrderIndex(), c2.getOrderIndex()))
                    .toList();
            
            return ResponseEntity.ok(activeCollections);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            // Log error and return empty list instead of error
            System.err.println("Error fetching collections for store slug: " + slug);
            e.printStackTrace();
            return ResponseEntity.ok(new java.util.ArrayList<>());
        }
    }

    /**
     * Get banners for a store by slug (public endpoint)
     * Example: GET /api/public/store/my-store/banners
     */
    @GetMapping("/{slug}/banners")
    public ResponseEntity<?> getStoreBanners(
            @PathVariable String slug,
            @RequestParam(value = "activeOnly", defaultValue = "true") Boolean activeOnly) {
        try {
            System.out.println("=== Banner API called for slug: " + slug + " ===");

            // Find store by slug
            StoreDetails store = storeService.findBySlug(slug);

            if (store == null) {
                System.out.println("Store not found for slug: " + slug);
                return ResponseEntity.ok(new java.util.ArrayList<>());
            }

            System.out.println("Store found: " + store.getStoreName() + ", StoreId: " + store.getStoreId());

            // Check if store has a seller
            if (store.getSeller() == null || store.getSeller().getSellerId() == null) {
                System.out.println("Store has no seller or sellerId is null");
                return ResponseEntity.ok(new java.util.ArrayList<>());
            }

            Long sellerId = store.getSeller().getSellerId();
            System.out.println("SellerId: " + sellerId);

            // Get banners for seller
            List<Banner> banners = activeOnly
                    ? bannerService.getActiveBannersBySellerId(sellerId)
                    : bannerService.getBannersBySellerId(sellerId);

            System.out.println("Found " + banners.size() + " banners for sellerId: " + sellerId);
            return ResponseEntity.ok(banners);
        } catch (NoSuchElementException e) {
            return ResponseEntity.ok(new java.util.ArrayList<>());
        } catch (Exception e) {
            System.err.println("Error fetching banners for store slug: " + slug);
            e.printStackTrace();
            return ResponseEntity.ok(new java.util.ArrayList<>());
        }
    }
}