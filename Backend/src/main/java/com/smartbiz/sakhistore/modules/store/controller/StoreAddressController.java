package com.smartbiz.sakhistore.modules.store.controller;

import java.util.List; 

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.smartbiz.sakhistore.modules.store.dto.StoreAddressRequest;
import com.smartbiz.sakhistore.modules.store.model.StoreAddress;
import com.smartbiz.sakhistore.modules.store.service.StoreAddressService;
import com.smartbiz.sakhistore.modules.store.service.StoreDetailsService;
import com.smartbiz.sakhistore.modules.auth.sellerauth.service.JwtService;

import jakarta.servlet.http.HttpServletRequest;

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



    // Get all store addresses (filtered by authenticated seller)
    @GetMapping("/allAddresses")
    public List<StoreAddress> allAddresses(HttpServletRequest httpRequest) {
        Long sellerId = extractSellerIdFromToken(httpRequest);
        return storeAddressService.allAddresses(sellerId);
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
    public StoreAddress addAddress(
            @RequestBody StoreAddressRequest request,
            HttpServletRequest httpRequest) {
        
        // If storeId is not provided, automatically get it from authenticated seller's store
        if (request.getStoreId() == null) {
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
        
        // Use the DTO method which handles storeId directly
        return storeAddressService.addAddressFromRequest(request);
    }
    
    // Add new store address (backward compatibility - accepts StoreAddress entity)
    @PostMapping("/addAddressLegacy")
    public StoreAddress addAddressLegacy(@RequestBody StoreAddress address) {
        return storeAddressService.addAddress(address);
    }



    //  Edit store address

    @PostMapping("/editAddress")

    public StoreAddress editAddress(@RequestBody StoreAddress address) {

        return storeAddressService.addAddress(address);

    }



    //  Get store address by ID

    @GetMapping("/{addressId}")

    public StoreAddress getAddress(@PathVariable Long addressId) {

        return storeAddressService.findById(addressId);

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

}