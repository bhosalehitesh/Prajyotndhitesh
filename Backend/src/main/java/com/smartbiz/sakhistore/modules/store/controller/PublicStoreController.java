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

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/public/store")
@RequiredArgsConstructor
public class PublicStoreController {

    @Autowired
    private StoreDetailsService storeService;
    
    @Autowired
    private ProductService productService;

    /**
     * Get store details by slug (public endpoint)
     * Example: GET /api/public/store/brownn_boys
     */
    @GetMapping("/{slug}")
    public ResponseEntity<StoreDetails> getStoreBySlug(@PathVariable String slug) {
        try {
            StoreDetails store = storeService.findBySlug(slug);
            return ResponseEntity.ok(store);
        } catch (NoSuchElementException e) {
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
            
            // Get products by seller
            List<Product> products = productService.allProductForSeller(sellerId);
            
            // Filter by category if provided
            if (category != null && !category.isEmpty()) {
                products = products.stream()
                    .filter(p -> category.equalsIgnoreCase(p.getProductCategory()) || 
                                category.equalsIgnoreCase(p.getBusinessCategory()))
                    .toList();
            }
            
            return ResponseEntity.ok(products);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            // Log error and return empty list instead of error
            System.err.println("Error fetching products for store slug: " + slug);
            e.printStackTrace();
            return ResponseEntity.ok(new java.util.ArrayList<>());
        }
    }
}

