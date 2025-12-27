package com.smartbiz.sakhistore.modules.store.controller;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.smartbiz.sakhistore.modules.store.dto.*;
import com.smartbiz.sakhistore.modules.store.model.BusinessDetails;
import com.smartbiz.sakhistore.modules.store.service.BusinessDetailsService;
import com.smartbiz.sakhistore.modules.store.service.StoreDetailsService;
import com.smartbiz.sakhistore.modules.auth.sellerauth.service.JwtService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;



@RestController
@RequestMapping("/api/business-details")
@RequiredArgsConstructor
public class BusinessDetailsController {

    @Autowired
    private BusinessDetailsService businessDetailsService;

    @Autowired
    private StoreDetailsService storeDetailsService;
    
    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private StoreMapper storeMapper;

    // ✅ Get all (filtered by authenticated seller)
    @GetMapping("/allBusinessDetails")
    public ResponseEntity<List<BusinessDetailsResponseDTO>> allBusinessDetails(HttpServletRequest httpRequest) {
        Long sellerId = extractSellerIdFromToken(httpRequest);
        List<BusinessDetails> details = businessDetailsService.allBusinessDetails(sellerId);
        List<BusinessDetailsResponseDTO> detailDTOs = details.stream()
                .map(storeMapper::toBusinessDetailsResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(detailDTOs);
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
            // If token extraction fails, return null (will return all business details for backward compatibility)
        }
        return null;
    }



    // ✅ Add new (accepts DTO with storeId directly)
    // Automatically links to current seller's store if storeId not provided
    @PostMapping("/addBusinessDetails")
    public ResponseEntity<BusinessDetailsResponseDTO> addBusinessDetails(
            @Valid @RequestBody BusinessDetailsRequest request,
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
        BusinessDetails details = businessDetailsService.addBusinessDetailsFromRequest(request);
        BusinessDetailsResponseDTO responseDTO = storeMapper.toBusinessDetailsResponseDTO(details);
        return ResponseEntity.ok(responseDTO);
    }
    
    // ✅ Add new (backward compatibility - accepts BusinessDetails entity)
    @PostMapping("/addBusinessDetailsLegacy")
    public BusinessDetails addBusinessDetailsLegacy(@RequestBody BusinessDetails details) {
        return businessDetailsService.addBusinessDetails(details);
    }



    // ✅ Edit (update existing business details)
    @PostMapping("/editBusinessDetails")
    public BusinessDetails editBusinessDetails(@RequestBody BusinessDetails details) {
        return businessDetailsService.addBusinessDetails(details);
    }
    
    // ✅ Update store_id for existing business details (fix null store_id)
    @PutMapping("/{businessId}/updateStoreId")
    public BusinessDetails updateStoreId(
            @PathVariable Long businessId,
            @RequestParam(value = "storeId", required = true) Long storeId) {
        return businessDetailsService.updateStoreId(businessId, storeId);
    }



    // ✅ Get by ID
    @GetMapping("/{businessId}")
    public ResponseEntity<BusinessDetailsResponseDTO> getBusinessDetails(@PathVariable Long businessId) {
        BusinessDetails details = businessDetailsService.findById(businessId);
        BusinessDetailsResponseDTO responseDTO = storeMapper.toBusinessDetailsResponseDTO(details);
        return ResponseEntity.ok(responseDTO);
    }



    // ✅ Delete (with seller verification)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBusinessDetails(@PathVariable Long id, HttpServletRequest httpRequest) {
        Long sellerId = extractSellerIdFromToken(httpRequest);
        if (sellerId == null) {
            return ResponseEntity.status(401).body("Authentication required. Please provide a valid JWT token.");
        }
        
        // Verify business details belong to seller's store
        BusinessDetails businessDetails = businessDetailsService.findById(id);
        if (businessDetails.getStoreDetails() == null || 
            businessDetails.getStoreDetails().getSeller() == null || 
            !businessDetails.getStoreDetails().getSeller().getSellerId().equals(sellerId)) {
            return ResponseEntity.status(403).body("You can only delete your own business details.");
        }

        businessDetailsService.deleteBusinessDetails(id);
        return ResponseEntity.ok("✅ Business Details with ID " + id + " deleted successfully.");
    }

}

