package com.smartbiz.sakhistore.modules.store.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO for creating/updating StoreDetails
 */
@Data
public class StoreDetailsRequest {

    private Long storeId; // For updates, null for new stores

    @NotBlank(message = "Store name is required")
    @Size(min = 2, max = 100, message = "Store name must be between 2 and 100 characters")
    private String storeName;

    @Size(max = 200, message = "Store link must be less than 200 characters")
    private String storeLink;

    private String logoUrl; // URL to store logo image

    // Optional: sellerId (can be extracted from JWT token)
    private Long sellerId;

    // Nested DTOs for related entities
    private StoreAddressRequest storeAddress;
    private BusinessDetailsRequest businessDetails;

    public StoreDetailsRequest() {
    }

    public StoreDetailsRequest(String storeName, String storeLink, String logoUrl) {
        this.storeName = storeName;
        this.storeLink = storeLink;
        this.logoUrl = logoUrl;
    }

    // Validation helper
    public boolean isValid() {
        return storeName != null && !storeName.trim().isEmpty();
    }
}

