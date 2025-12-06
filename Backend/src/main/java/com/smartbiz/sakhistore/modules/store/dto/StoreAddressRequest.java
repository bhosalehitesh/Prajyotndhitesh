package com.smartbiz.sakhistore.modules.store.dto;

import lombok.Data;

/**
 * DTO for creating/updating StoreAddress
 * Allows receiving storeId directly without deserialization issues
 */
@Data
public class StoreAddressRequest {
    private String shopNoBuildingCompanyApartment;
    private String areaStreetSectorVillage;
    private String landmark;
    private String pincode;
    private String townCity;
    private String state;
    private Long storeId; // Direct storeId instead of nested StoreDetails object
}

