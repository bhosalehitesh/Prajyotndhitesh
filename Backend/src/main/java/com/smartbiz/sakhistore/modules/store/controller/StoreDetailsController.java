package com.smartbiz.sakhistore.modules.store.controller;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.smartbiz.sakhistore.common.exceptions.ResourceNotFoundException;
import com.smartbiz.sakhistore.modules.store.model.StoreDetails;
import com.smartbiz.sakhistore.modules.store.service.StoreDetailsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/stores")
@RequiredArgsConstructor
public class StoreDetailsController {

    @Autowired
    StoreDetailsService storeService;

    @GetMapping("/allStores")
    public List<StoreDetails> allStores() {
        return storeService.allStores();
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
    public ResponseEntity<String> deleteStore(@PathVariable Long id) throws ResourceNotFoundException {
        storeService.deleteStore(id);
        return ResponseEntity.ok("✅ Store with ID " + id + " deleted successfully.");
    }
}