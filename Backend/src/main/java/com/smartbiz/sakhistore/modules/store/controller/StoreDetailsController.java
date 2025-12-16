package com.smartbiz.sakhistore.modules.store.controller;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.smartbiz.sakhistore.common.exceptions.ResourceNotFoundException;
import com.smartbiz.sakhistore.modules.auth.sellerauth.service.JwtService;
import com.smartbiz.sakhistore.modules.category.model.Category;
import com.smartbiz.sakhistore.modules.collection.model.collection;
import com.smartbiz.sakhistore.modules.store.model.StoreDetails;
import com.smartbiz.sakhistore.modules.store.service.StoreDetailsService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/stores")
@RequiredArgsConstructor
public class StoreDetailsController {

    @Autowired
    StoreDetailsService storeService;
    
    @Autowired
    private JwtService jwtService;
    
    // Helper method to extract sellerId from JWT token
    private Long extractSellerIdFromToken(HttpServletRequest httpRequest) {
        try {
            String authHeader = httpRequest.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                return jwtService.extractUserId(token);
            }
        } catch (Exception e) {
            // If token extraction fails, return null (will return all stores for backward compatibility)
        }
        return null;
    }

    @GetMapping("/allStores")
    public List<StoreDetails> allStores(HttpServletRequest httpRequest) {
        Long sellerId = extractSellerIdFromToken(httpRequest);
        return storeService.allStores(sellerId);
    }

    @PostMapping("/addStore")
    public StoreDetails addStore(
            @RequestBody StoreDetails store,
            @RequestParam(value = "sellerId", required = true) Long sellerId) {
        return storeService.addStore(store, sellerId);
    }

    @PostMapping("/editStore")
    public StoreDetails editStore(
            @RequestBody StoreDetails store,
            @RequestParam(value = "sellerId", required = false) Long sellerId) {
        // For edit, sellerId is optional (only needed if creating new store)
        if (store.getStoreId() != null) {
            // Updating existing store - use updateStore method
            return storeService.updateStore(store.getStoreId(), store);
        } else {
            // Creating new store - sellerId is required
            if (sellerId == null) {
                throw new RuntimeException("Seller ID is required when creating a new store.");
            }
            return storeService.addStore(store, sellerId);
        }
    }

    // Check store name availability
    @GetMapping("/check-availability")
    public ResponseEntity<?> checkStoreNameAvailability(@RequestParam("storeName") String storeName) {
        boolean isAvailable = storeService.isStoreNameAvailable(storeName);
        return ResponseEntity.ok(new java.util.HashMap<String, Object>() {{
            put("available", isAvailable);
            put("storeName", storeName);
            put("message", isAvailable 
                ? "Store name is available" 
                : "Store name already exists. Please choose a different name.");
        }});
    }

    // Upload logo for a store by seller ID
    // IMPORTANT: This must come before @GetMapping("/{storeId}") to avoid path conflict
    @PostMapping(value = "/upload-logo", consumes = {"multipart/form-data"})
    public ResponseEntity<?> uploadLogo(
            @RequestParam("sellerId") Long sellerId,
            @RequestParam("logo") MultipartFile logoFile) {
        try {
            if (logoFile.isEmpty()) {
                return ResponseEntity.badRequest().body("Logo file is required");
            }

            // Validate file type
            String contentType = logoFile.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body("File must be an image");
            }

            // Validate file size (5MB max)
            if (logoFile.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body("Image size must be less than 5MB");
            }

            StoreDetails store = storeService.uploadLogoBySellerId(sellerId, logoFile);
            
            return ResponseEntity.ok(new java.util.HashMap<String, Object>() {{
                put("success", true);
                put("message", "Logo uploaded successfully");
                put("logoUrl", store.getLogoUrl());
                put("storeId", store.getStoreId());
            }});
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new java.util.HashMap<String, Object>() {{
                put("success", false);
                put("message", "Failed to upload logo: " + e.getMessage());
            }});
        }
    }

    @GetMapping("/{storeId}")
    public StoreDetails getStore(@PathVariable Long storeId) throws ResourceNotFoundException {
        return storeService.findByIdDS(storeId);
    }

    // Get store for a specific seller (assumes one store per seller)
    // Use a fixed path segment to avoid conflict with "/{storeId}"
    @GetMapping("/seller")
    public ResponseEntity<?> getStoreBySeller(@RequestParam("sellerId") Long sellerId) {
        try {
            StoreDetails store = storeService.findBySellerId(sellerId);
            
            // Log storeAddress for debugging
            if (store.getStoreAddress() != null) {
                System.out.println("📍 [getStoreBySeller] StoreAddress found for sellerId " + sellerId + ":");
                System.out.println("   - shopNoBuildingCompanyApartment: " + store.getStoreAddress().getShopNoBuildingCompanyApartment());
                System.out.println("   - areaStreetSectorVillage: " + store.getStoreAddress().getAreaStreetSectorVillage());
                System.out.println("   - landmark: " + store.getStoreAddress().getLandmark());
                System.out.println("   - townCity: " + store.getStoreAddress().getTownCity());
                System.out.println("   - state: " + store.getStoreAddress().getState());
                System.out.println("   - pincode: " + store.getStoreAddress().getPincode());
            } else {
                System.out.println("⚠️ [getStoreBySeller] No StoreAddress found for sellerId: " + sellerId);
            }
            
            // Try to get logo from store_logos table first (new table)
            try {
                com.smartbiz.sakhistore.modules.store.model.StoreLogo activeLogo = 
                    storeService.getActiveLogoBySellerId(sellerId);
                if (activeLogo != null && activeLogo.getLogoUrl() != null) {
                    // Use logo from store_logos table if available
                    store.setLogoUrl(activeLogo.getLogoUrl());
                    System.out.println("✅ Retrieved logo from store_logos table for sellerId: " + sellerId);
                } else if (store.getLogoUrl() != null) {
                    // Fallback to store_details.logoUrl
                    System.out.println("ℹ️ Using logo from store_details table for sellerId: " + sellerId);
                }
            } catch (Exception e) {
                // If new table doesn't exist yet or error, use store_details.logoUrl
                System.out.println("⚠️ Could not retrieve from store_logos, using store_details: " + e.getMessage());
            }
            
            return ResponseEntity.ok(store);
        } catch (NoSuchElementException e) {
            // Return null/empty response instead of 500 error when store doesn't exist
            return ResponseEntity.ok(null);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new java.util.HashMap<String, Object>() {{
                put("error", "Internal Server Error");
                put("message", e.getMessage());
            }});
        }
    }

    @DeleteMapping("/deleteStore/{id}")
    public ResponseEntity<String> deleteStore(@PathVariable Long id, HttpServletRequest httpRequest) throws ResourceNotFoundException {
        Long sellerId = extractSellerIdFromToken(httpRequest);
        if (sellerId == null) {
            return ResponseEntity.status(401).body("Authentication required. Please provide a valid JWT token.");
        }
        
        // Verify store belongs to seller
        StoreDetails store = storeService.findByIdDS(id);
        if (store.getSeller() == null || !store.getSeller().getSellerId().equals(sellerId)) {
            return ResponseEntity.status(403).body("You can only delete your own stores.");
        }
        
        storeService.deleteStore(id);
        return ResponseEntity.ok("✅ Store with ID " + id + " deleted successfully.");
    }
    
    // Get store by slug (for public access)
    @GetMapping("/slug/{slug}")
    public StoreDetails getStoreBySlug(@PathVariable String slug) {
        return storeService.findBySlug(slug);
    }
    
   
  /*  @GetMapping("/{storeName}/categories")
    public ResponseEntity<?> getStoreCategories(@PathVariable String storeName) {
        try {
            List<Category> categories = storeService.getCategoriesByStoreName(storeName);
            return ResponseEntity.ok(categories);

        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body("Store not found: " + storeName);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Something went wrong: " + e.getMessage());
        }
    } */
    
    @GetMapping("/{storeName}/categories1")
    public ResponseEntity<?> getStoreCategories1(@PathVariable String storeName) {
        try {
            List<Category> categories = storeService.getCategoriesByStoreName(storeName);
            return ResponseEntity.ok(categories);

        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body("Store not found: " + storeName);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Something went wrong");
        }
    }
    
    @GetMapping("/{storeName}/collections")
    public ResponseEntity<?> getStoreCollections(@PathVariable String storeName) {
        try {
            List<collection> collections = storeService.getCollectionsByStoreName(storeName);
            return ResponseEntity.ok(collections);

        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body("Store not found: " + storeName);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Something went wrong");
        }
    }




}