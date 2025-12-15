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
            
            // Get products by seller
            List<Product> products = productService.allProductForSeller(sellerId);
            System.out.println("📦 [DEBUG] Found " + products.size() + " products for seller " + sellerId);
            
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
            List<Product> products = productService.getFeaturedProducts(sellerId);
            System.out.println("✅ [DEBUG] Returning " + products.size() + " featured products for slug: " + slug);
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
            if (store.getSeller() == null) {
                System.out.println("Store has no seller");
                return ResponseEntity.ok(new java.util.ArrayList<>());
            }
            
            if (store.getSeller().getSellerId() == null) {
                System.out.println("Store seller has no sellerId");
                return ResponseEntity.ok(new java.util.ArrayList<>());
            }
            
            // Get seller ID from store
            Long sellerId = store.getSeller().getSellerId();
            System.out.println("SellerId: " + sellerId);
            
            // Get banners for seller
            List<Banner> banners = activeOnly 
                ? bannerService.getActiveBannersBySellerId(sellerId)
                : bannerService.getBannersBySellerId(sellerId);
            
            System.out.println("Found " + banners.size() + " banners for sellerId: " + sellerId);
            return ResponseEntity.ok(banners);
        } catch (Exception e) {
            if (e instanceof NoSuchElementException) {
                System.out.println("NoSuchElementException for slug: " + slug);
                return ResponseEntity.ok(new java.util.ArrayList<>());
            }
            // Log error and return empty list instead of error
            System.err.println("Error fetching banners for store slug: " + slug);
            e.printStackTrace();
            return ResponseEntity.ok(new java.util.ArrayList<>());
        }
    }
}