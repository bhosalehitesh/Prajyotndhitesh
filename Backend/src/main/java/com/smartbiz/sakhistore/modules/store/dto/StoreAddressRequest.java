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
	
    public String getShopNoBuildingCompanyApartment() {
		return shopNoBuildingCompanyApartment;
	}
	public void setShopNoBuildingCompanyApartment(String shopNoBuildingCompanyApartment) {
		this.shopNoBuildingCompanyApartment = shopNoBuildingCompanyApartment;
	}
	public String getAreaStreetSectorVillage() {
		return areaStreetSectorVillage;
	}
	public void setAreaStreetSectorVillage(String areaStreetSectorVillage) {
		this.areaStreetSectorVillage = areaStreetSectorVillage;
	}
	public String getLandmark() {
		return landmark;
	}
	public void setLandmark(String landmark) {
		this.landmark = landmark;
	}
	public String getPincode() {
		return pincode;
	}
	public void setPincode(String pincode) {
		this.pincode = pincode;
	}
	public String getTownCity() {
		return townCity;
	}
	public void setTownCity(String townCity) {
		this.townCity = townCity;
	}
	public String getState() {
		return state;
	}
	public void setState(String state) {
		this.state = state;
	}
	public Long getStoreId() {
		return storeId;
	}
	public void setStoreId(Long storeId) {
		this.storeId = storeId;
	}
	public StoreAddressRequest(String shopNoBuildingCompanyApartment, String areaStreetSectorVillage, String landmark,
			String pincode, String townCity, String state, Long storeId) {
		super();
		this.shopNoBuildingCompanyApartment = shopNoBuildingCompanyApartment;
		this.areaStreetSectorVillage = areaStreetSectorVillage;
		this.landmark = landmark;
		this.pincode = pincode;
		this.townCity = townCity;
		this.state = state;
		this.storeId = storeId;
	}
	
    
    
}

