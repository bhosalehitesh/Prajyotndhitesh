package com.smartbiz.sakhistore.modules.store.controller;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.smartbiz.sakhistore.modules.store.dto.*;
import com.smartbiz.sakhistore.modules.store.model.StoreAddress;
import com.smartbiz.sakhistore.modules.store.service.StoreAddressService;
import com.smartbiz.sakhistore.modules.store.service.StoreDetailsService;
import com.smartbiz.sakhistore.modules.auth.sellerauth.service.JwtService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;



@RestController

@RequestMapping("/api/store-address")

@RequiredArgsConstructor

public class StoreAddressController {



    @Autowired
    private StoreAddressService storeAddressService;

    @Autowired
    private StoreDetailsService storeDetailsService;
    
    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private StoreMapper storeMapper;



    // Get all store addresses (filtered by authenticated seller)
    @GetMapping("/allAddresses")
    public ResponseEntity<List<StoreAddressResponseDTO>> allAddresses(HttpServletRequest httpRequest) {
        Long sellerId = extractSellerIdFromToken(httpRequest);
        List<StoreAddress> addresses = storeAddressService.allAddresses(sellerId);
        List<StoreAddressResponseDTO> addressDTOs = addresses.stream()
                .map(storeMapper::toStoreAddressResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(addressDTOs);
    }
    
    // Helper method to extract sellerId from JWT token
    private Long extractSellerIdFromToken(HttpServletRequest httpRequest) {
        try {
            String authHeader = httpRequest.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                return jwtService.extractUserId(token);
            }
        } catch (Exception e) {
            // If token extraction fails, return null (will return all addresses for backward compatibility)
        }
        return null;
    }



    // Add new store address (accepts DTO with storeId directly)
    // Automatically links to current seller's store if storeId not provided
    @PostMapping("/addAddress")
    public ResponseEntity<StoreAddressResponseDTO> addAddress(
            @Valid @RequestBody StoreAddressRequest request,
            HttpServletRequest httpRequest) {
        
        // ✅ DETAILED LOGGING: Log incoming request
        System.out.println("📥 [StoreAddressController] Received addAddress request:");
        System.out.println("   - shopNoBuildingCompanyApartment: " + request.getShopNoBuildingCompanyApartment());
        System.out.println("   - areaStreetSectorVillage: " + request.getAreaStreetSectorVillage());
        System.out.println("   - landmark: " + request.getLandmark());
        System.out.println("   - townCity: " + request.getTownCity());
        System.out.println("   - state: " + request.getState());
        System.out.println("   - pincode: " + request.getPincode());
        System.out.println("   - storeId (from request): " + request.getStoreId());
        
        // If storeId is not provided, automatically get it from authenticated seller's store
        if (request.getStoreId() == null) {
            System.out.println("⚠️ [StoreAddressController] StoreId not provided, fetching from JWT token...");
            try {
                // Extract sellerId from JWT token
                String authHeader = httpRequest.getHeader("Authorization");
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    String token = authHeader.substring(7);
                    Long sellerId = jwtService.extractUserId(token);
                    
                    // Find store for this seller
                    try {
                        Long storeId = storeDetailsService.findBySellerId(sellerId).getStoreId();
                        request.setStoreId(storeId);
                        System.out.println("✅ [StoreAddressController] Found storeId from seller: " + storeId);
                    } catch (Exception e) {
                        System.out.println("❌ [StoreAddressController] No store found for sellerId: " + sellerId);
                        throw new IllegalArgumentException("No store found for the current seller. Please create a store first.");
                    }
                } else {
                    System.out.println("❌ [StoreAddressController] No Authorization header found");
                    throw new IllegalArgumentException("Authentication required. Please provide a valid JWT token.");
                }
            } catch (Exception e) {
                if (e instanceof IllegalArgumentException) {
                    throw e;
                }
                System.out.println("❌ [StoreAddressController] Error finding store: " + e.getMessage());
                throw new IllegalArgumentException("Unable to determine store. Please provide storeId or ensure you are authenticated and have a store.");
            }
        } else {
            System.out.println("✅ [StoreAddressController] StoreId provided in request: " + request.getStoreId());
        }
        
        // Use the DTO method which handles storeId directly
        System.out.println("🔄 [StoreAddressController] Calling storeAddressService.addAddressFromRequest...");
        StoreAddress address = storeAddressService.addAddressFromRequest(request);
        System.out.println("✅ [StoreAddressController] Address saved successfully! AddressId: " + address.getAddressId());
        System.out.println("   - Final storeId: " + (address.getStoreDetails() != null ? address.getStoreDetails().getStoreId() : "NULL"));
        
        StoreAddressResponseDTO responseDTO = storeMapper.toStoreAddressResponseDTO(address);
        System.out.println("📤 [StoreAddressController] Sending response with addressId: " + responseDTO.getAddressId());
        return ResponseEntity.ok(responseDTO);
    }
    
    // Add new store address (backward compatibility - accepts StoreAddress entity)
    @PostMapping("/addAddressLegacy")
    public StoreAddress addAddressLegacy(@RequestBody StoreAddress address) {
        return storeAddressService.addAddress(address);
    }



    //  Edit store address (with storeId validation)

    @PostMapping("/editAddress")
    public ResponseEntity<StoreAddressResponseDTO> editAddress(
            @RequestBody StoreAddress address,
            HttpServletRequest httpRequest) {
        
        // ✅ CRITICAL: Ensure storeId is set before saving
        // If address doesn't have storeDetails with storeId, try to get it from authenticated seller
        if (address.getStoreDetails() == null || address.getStoreDetails().getStoreId() == null) {
            try {
                // Extract sellerId from JWT token
                String authHeader = httpRequest.getHeader("Authorization");
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    String token = authHeader.substring(7);
                    Long sellerId = jwtService.extractUserId(token);
                    
                    // Find store for this seller
                    try {
                        com.smartbiz.sakhistore.modules.store.model.StoreDetails sellerStore = 
                            storeDetailsService.findBySellerId(sellerId);
                        // Use the actual StoreDetails object from the database
                        address.setStoreDetails(sellerStore);
                    } catch (Exception e) {
                        throw new IllegalArgumentException("No store found for the current seller. Please create a store first.");
                    }
                } else {
                    throw new IllegalArgumentException("Authentication required. Please provide a valid JWT token.");
                }
            } catch (Exception e) {
                if (e instanceof IllegalArgumentException) {
                    throw e;
                }
                throw new IllegalArgumentException("Unable to determine store. Please provide storeId or ensure you are authenticated and have a store.");
            }
        }
        
        StoreAddress savedAddress = storeAddressService.addAddress(address);
        StoreAddressResponseDTO responseDTO = storeMapper.toStoreAddressResponseDTO(savedAddress);
        return ResponseEntity.ok(responseDTO);
    }



    //  Get store address by ID
    @GetMapping("/{addressId}")
    public ResponseEntity<StoreAddressResponseDTO> getAddress(@PathVariable Long addressId) {
        StoreAddress address = storeAddressService.findById(addressId);
        StoreAddressResponseDTO responseDTO = storeMapper.toStoreAddressResponseDTO(address);
        return ResponseEntity.ok(responseDTO);
    }



    // Delete store address (with seller verification)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAddress(@PathVariable Long id, HttpServletRequest httpRequest) {
        Long sellerId = extractSellerIdFromToken(httpRequest);
        if (sellerId == null) {
            return ResponseEntity.status(401).body("Authentication required. Please provide a valid JWT token.");
        }
        
        // Verify address belongs to seller's store
        StoreAddress address = storeAddressService.findById(id);
        if (address.getStoreDetails() == null || 
            address.getStoreDetails().getSeller() == null || 
            !address.getStoreDetails().getSeller().getSellerId().equals(sellerId)) {
            return ResponseEntity.status(403).body("You can only delete your own store addresses.");
        }

        storeAddressService.deleteAddress(id);
        return ResponseEntity.ok("✅ Store Address with ID " + id + " deleted successfully.");
    }

    // ✅ Fix orphaned address for the current seller
    // Links the most recent orphaned address (null store_id) to the seller's store
    @PostMapping("/fix-orphaned")
    public ResponseEntity<StoreAddressResponseDTO> fixOrphanedAddress(HttpServletRequest httpRequest) {
        Long sellerId = extractSellerIdFromToken(httpRequest);
        if (sellerId == null) {
            return ResponseEntity.status(401).body(null);
        }
        
        try {
            StoreAddress fixedAddress = storeAddressService.fixOrphanedAddressForSeller(sellerId);
            StoreAddressResponseDTO responseDTO = storeMapper.toStoreAddressResponseDTO(fixedAddress);
            return ResponseEntity.ok(responseDTO);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
    
    // ✅ Admin endpoint: Fix ALL orphaned addresses in the database
    // Matches orphaned addresses (null store_id) to stores that don't have addresses yet
    // Requires authentication - can be called by any authenticated seller
    @PostMapping("/fix-all-orphaned")
    public ResponseEntity<java.util.Map<String, Object>> fixAllOrphanedAddresses(HttpServletRequest httpRequest) {
        // ✅ Require authentication
        Long sellerId = extractSellerIdFromToken(httpRequest);
        if (sellerId == null) {
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("success", false);
            response.put("error", "Authentication required. Please provide a valid JWT token.");
            return ResponseEntity.status(401).body(response);
        }
        
        try {
            int fixedCount = storeAddressService.fixAllOrphanedAddresses();
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("success", true);
            response.put("fixedCount", fixedCount);
            response.put("message", "Fixed " + fixedCount + " orphaned address(es)");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

}