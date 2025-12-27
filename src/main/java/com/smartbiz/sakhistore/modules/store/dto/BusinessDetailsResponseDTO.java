package com.smartbiz.sakhistore.modules.store.dto;

import lombok.Data;

/**
 * DTO for BusinessDetails response
 */
@Data
public class BusinessDetailsResponseDTO {

    private Long businessId;
    private String businessDescription;
    private String ownBusiness;
    private String businessSize;
    private String platform;
    private Long storeId; // Reference to store

    public BusinessDetailsResponseDTO() {
    }

    public BusinessDetailsResponseDTO(Long businessId, String businessDescription,
                                      String ownBusiness, String businessSize, String platform) {
        this.businessId = businessId;
        this.businessDescription = businessDescription;
        this.ownBusiness = ownBusiness;
        this.businessSize = businessSize;
        this.platform = platform;
    }
}

