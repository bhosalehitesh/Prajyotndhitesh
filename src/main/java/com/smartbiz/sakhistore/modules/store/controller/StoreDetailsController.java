package com.smartbiz.sakhistore.modules.store.controller;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

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
import com.smartbiz.sakhistore.modules.store.dto.*;
import com.smartbiz.sakhistore.modules.store.model.StoreDetails;
import com.smartbiz.sakhistore.modules.store.service.StoreDetailsService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/stores")
@RequiredArgsConstructor
public class StoreDetailsController {

    @Autowired
    StoreDetailsService storeService;
    
    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private StoreMapper storeMapper;
    
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
    public ResponseEntity<List<StoreDetailsResponseDTO>> allStores(HttpServletRequest httpRequest) {
        Long sellerId = extractSellerIdFromToken(httpRequest);
        List<StoreDetails> stores = storeService.allStores(sellerId);
        List<StoreDetailsResponseDTO> storeDTOs = stores.stream()
                .map(storeMapper::toStoreDetailsResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(storeDTOs);
    }

    @PostMapping("/addStore")
    public ResponseEntity<StoreDetailsResponseDTO> addStore(
            @Valid @RequestBody StoreDetailsRequest request,
            @RequestParam(value = "sellerId", required = true) Long sellerId) {
        if (!request.isValid()) {
            return ResponseEntity.badRequest().build();
        }
        
        // Convert DTO to entity
        StoreDetails store = new StoreDetails();
        store.setStoreName(request.getStoreName());
        store.setStoreLink(request.getStoreLink());
        store.setLogoUrl(request.getLogoUrl());
        
        // ✅ CRITICAL: Handle store address if provided in request
        if (request.getStoreAddress() != null) {
            com.smartbiz.sakhistore.modules.store.model.StoreAddress address = 
                new com.smartbiz.sakhistore.modules.store.model.StoreAddress();
            address.setShopNoBuildingCompanyApartment(request.getStoreAddress().getShopNoBuildingCompanyApartment());
            address.setAreaStreetSectorVillage(request.getStoreAddress().getAreaStreetSectorVillage());
            address.setLandmark(request.getStoreAddress().getLandmark());
            address.setPincode(request.getStoreAddress().getPincode());
            address.setTownCity(request.getStoreAddress().getTownCity());
            address.setState(request.getStoreAddress().getState());
            // Note: storeDetails will be set in addStore() after store is saved
            store.setStoreAddress(address);
        }
        
        StoreDetails savedStore = storeService.addStore(store, sellerId);
        StoreDetailsResponseDTO responseDTO = storeMapper.toStoreDetailsResponseDTO(savedStore);
        return ResponseEntity.ok(responseDTO);
    }

    @PostMapping("/editStore")
    public ResponseEntity<StoreDetailsResponseDTO> editStore(
            @Valid @RequestBody StoreDetailsRequest request,
            @RequestParam(value = "sellerId", required = false) Long sellerId) {
        if (!request.isValid()) {
            return ResponseEntity.badRequest().build();
        }
        
        // Convert DTO to entity
        StoreDetails store = new StoreDetails();
        store.setStoreName(request.getStoreName());
        store.setStoreLink(request.getStoreLink());
        store.setLogoUrl(request.getLogoUrl());
        
        StoreDetails savedStore;
        // For edit, sellerId is optional (only needed if creating new store)
        if (request.getStoreId() != null) {
            // Updating existing store - use updateStore method
            savedStore = storeService.updateStore(request.getStoreId(), store);
        } else {
            // Creating new store - sellerId is required
            if (sellerId == null) {
                return ResponseEntity.badRequest().build();
            }
            savedStore = storeService.addStore(store, sellerId);
        }
        
        StoreDetailsResponseDTO responseDTO = storeMapper.toStoreDetailsResponseDTO(savedStore);
        return ResponseEntity.ok(responseDTO);
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
    public ResponseEntity<StoreLogoResponseDTO> uploadLogo(
            @RequestParam("sellerId") Long sellerId,
            @RequestParam("logo") MultipartFile logoFile) {
        try {
            if (logoFile.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            // Validate file type
            String contentType = logoFile.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().build();
            }

            // Validate file size (5MB max)
            if (logoFile.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().build();
            }

            StoreDetails store = storeService.uploadLogoBySellerId(sellerId, logoFile);
            
            // Get the uploaded logo from store_logos table
            try {
                com.smartbiz.sakhistore.modules.store.model.StoreLogo logo = 
                    storeService.getActiveLogoBySellerId(sellerId);
                if (logo != null) {
                    StoreLogoResponseDTO responseDTO = storeMapper.toStoreLogoResponseDTO(logo);
                    return ResponseEntity.ok(responseDTO);
                }
            } catch (Exception e) {
                // Fallback to store logoUrl
            }
            
            // Fallback response
            StoreLogoResponseDTO responseDTO = new StoreLogoResponseDTO();
            responseDTO.setLogoUrl(store.getLogoUrl());
            responseDTO.setSellerId(sellerId);
            responseDTO.setStoreId(store.getStoreId());
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{storeId}")
    public ResponseEntity<StoreDetailsResponseDTO> getStore(@PathVariable Long storeId) throws ResourceNotFoundException {
        StoreDetails store = storeService.findByIdDS(storeId);
        StoreDetailsResponseDTO responseDTO = storeMapper.toStoreDetailsResponseDTO(store);
        return ResponseEntity.ok(responseDTO);
    }

    // Get store for a specific seller (assumes one store per seller)
    // Use a fixed path segment to avoid conflict with "/{storeId}"
    @GetMapping("/seller")
    public ResponseEntity<StoreDetailsResponseDTO> getStoreBySeller(@RequestParam("sellerId") Long sellerId) {
        try {
            StoreDetails store = storeService.findBySellerId(sellerId);
            
            // Try to get logo from store_logos table first (new table)
            try {
                com.smartbiz.sakhistore.modules.store.model.StoreLogo activeLogo = 
                    storeService.getActiveLogoBySellerId(sellerId);
                if (activeLogo != null && activeLogo.getLogoUrl() != null) {
                    // Use logo from store_logos table if available
                    store.setLogoUrl(activeLogo.getLogoUrl());
                }
            } catch (Exception e) {
                // If new table doesn't exist yet or error, use store_details.logoUrl
            }
            
            StoreDetailsResponseDTO responseDTO = storeMapper.toStoreDetailsResponseDTO(store);
            return ResponseEntity.ok(responseDTO);
        } catch (NoSuchElementException e) {
            // Return null/empty response instead of 500 error when store doesn't exist
            return ResponseEntity.ok(null);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
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
    public ResponseEntity<StoreDetailsResponseDTO> getStoreBySlug(@PathVariable String slug) {
        StoreDetails store = storeService.findBySlug(slug);
        StoreDetailsResponseDTO responseDTO = storeMapper.toStoreDetailsResponseDTO(store);
        return ResponseEntity.ok(responseDTO);
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