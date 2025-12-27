package com.smartbiz.sakhistore.modules.store.dto;

import lombok.Data;

/**
 * DTO for StoreAddress response
 */
@Data
public class StoreAddressResponseDTO {

    private Long addressId;
    private String shopNoBuildingCompanyApartment;
    private String areaStreetSectorVillage;
    private String landmark;
    private String pincode;
    private String townCity;
    private String state;
    private Long storeId; // Reference to store

    public StoreAddressResponseDTO() {
    }

    public StoreAddressResponseDTO(Long addressId, String shopNoBuildingCompanyApartment,
                                   String areaStreetSectorVillage, String landmark,
                                   String pincode, String townCity, String state) {
        this.addressId = addressId;
        this.shopNoBuildingCompanyApartment = shopNoBuildingCompanyApartment;
        this.areaStreetSectorVillage = areaStreetSectorVillage;
        this.landmark = landmark;
        this.pincode = pincode;
        this.townCity = townCity;
        this.state = state;
    }
}

