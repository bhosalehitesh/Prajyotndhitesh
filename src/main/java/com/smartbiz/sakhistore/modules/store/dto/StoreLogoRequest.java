package com.smartbiz.sakhistore.modules.store.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO for uploading store logo
 */
@Data
public class StoreLogoRequest {

    @NotNull(message = "Seller ID is required")
    private Long sellerId;

    // Logo URL (after upload to Cloudinary)
    private String logoUrl;

    // Optional: Store ID (if known)
    private Long storeId;

    // Optional: Set as active logo
    private Boolean isActive = true;

    public StoreLogoRequest() {
    }

    public StoreLogoRequest(Long sellerId, String logoUrl) {
        this.sellerId = sellerId;
        this.logoUrl = logoUrl;
    }

    // Validation helper
    public boolean isValid() {
        return sellerId != null && sellerId > 0;
    }
}

