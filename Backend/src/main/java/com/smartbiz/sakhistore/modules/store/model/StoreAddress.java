package com.smartbiz.sakhistore.modules.store.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "store_address")
public class StoreAddress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long addressId;

    private String shopNoBuildingCompanyApartment;
    private String areaStreetSectorVillage;
    private String landmark;
    private String pincode;
    private String townCity;
    private String state;

    @OneToOne
    @JoinColumn(name = "store_id")
    @JsonIgnore // prevent infinite JSON recursion via StoreDetails -> StoreAddress -> StoreDetails -> ...
    private StoreDetails storeDetails;

    // Getters and Setters
    public Long getAddressId() { return addressId; }
    public void setAddressId(Long addressId) { this.addressId = addressId; }

    public String getShopNoBuildingCompanyApartment() { return shopNoBuildingCompanyApartment; }
    public void setShopNoBuildingCompanyApartment(String shopNoBuildingCompanyApartment) {
        this.shopNoBuildingCompanyApartment = shopNoBuildingCompanyApartment;
    }

    public String getAreaStreetSectorVillage() { return areaStreetSectorVillage; }
    public void setAreaStreetSectorVillage(String areaStreetSectorVillage) {
        this.areaStreetSectorVillage = areaStreetSectorVillage;
    }

    public String getLandmark() { return landmark; }
    public void setLandmark(String landmark) { this.landmark = landmark; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public String getTownCity() { return townCity; }
    public void setTownCity(String townCity) { this.townCity = townCity; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public StoreDetails getStoreDetails() { return storeDetails; }
    public void setStoreDetails(StoreDetails storeDetails) { this.storeDetails = storeDetails; }
}
