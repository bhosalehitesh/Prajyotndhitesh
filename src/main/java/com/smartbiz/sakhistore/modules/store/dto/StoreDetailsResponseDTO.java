package com.smartbiz.sakhistore.modules.store.dto;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * DTO for StoreDetails response
 * Excludes internal entities and provides clean API response
 */
@Data
public class StoreDetailsResponseDTO {

    private Long storeId;
    private String storeName;
    private String storeLink;
    private String logoUrl;
    private String slug; // URL-friendly identifier

    // Seller information (without full SellerDetails object)
    private Long sellerId;
    private String sellerPhone;
    private String sellerFullName;

    // Nested DTOs
    private StoreAddressResponseDTO storeAddress;
    private BusinessDetailsResponseDTO businessDetails;

    // Metadata
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public StoreDetailsResponseDTO() {
    }

    public StoreDetailsResponseDTO(Long storeId, String storeName, String storeLink, String logoUrl) {
        this.storeId = storeId;
        this.storeName = storeName;
        this.storeLink = storeLink;
        this.logoUrl = logoUrl;
    }
}

