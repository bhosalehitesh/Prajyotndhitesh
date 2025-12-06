package com.smartbiz.sakhistore.modules.store.dto;

import lombok.Data;

/**
 * DTO for creating/updating BusinessDetails
 * Allows receiving storeId directly without deserialization issues
 */
@Data
public class BusinessDetailsRequest {
    private String businessDescription;
    private String ownBusiness;
    private String businessSize;
    private String platform;
    private Long storeId; // Direct storeId instead of nested StoreDetails object
}

