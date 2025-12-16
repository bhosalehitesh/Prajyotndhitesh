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
import com.smartbiz.sakhistore.modules.store.model.Banner;
import com.smartbiz.sakhistore.modules.store.service.BannerService;

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
    private BannerService bannerService;

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
            
            // Filter to only active products (public endpoint should only show active products)
            List<Product> products = allProducts.stream()
                .filter(p -> p.getIsActive() != null && p.getIsActive())
                .toList();
            
            int inactiveCount = allProducts.size() - products.size();
            if (inactiveCount > 0) {
                System.out.println("⚠️ [DEBUG] Filtered out " + inactiveCount + " inactive products (only showing active products)");
            }
            System.out.println("📦 [DEBUG] " + products.size() + " active products after filtering");
            
            // Log products without images (they might not display properly)
            long productsWithoutImages = products.stream()
                .filter(p -> p.getProductImages() == null || p.getProductImages().isEmpty())
                .count();
            if (productsWithoutImages > 0) {
                System.out.println("⚠️ [DEBUG] " + productsWithoutImages + " products have no images (may not display properly)");
            }
            
            // Filter by category if provided
            if (category != null && !category.isEmpty()) {
                int beforeFilter = products.size();
                products = products.stream()
                    .filter(p -> category.equalsIgnoreCase(p.getProductCategory()) || 
                                category.equalsIgnoreCase(p.getBusinessCategory()))
                    .toList();
                System.out.println("🔍 [DEBUG] After category filter (" + category + "): " + products.size() + " products (was " + beforeFilter + ")");
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
            List<Product> products = productService.getFeaturedProducts(sellerId);
            System.out.println("📦 [DEBUG] Found " + products.size() + " bestseller products for seller " + sellerId);
            
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
            
            // Get categories by seller
            List<Category> categories = categoryService.allCategories(sellerId);
            
            return ResponseEntity.ok(categories);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            // Log error and return empty list instead of error
            System.err.println("Error fetching categories for store slug: " + slug);
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