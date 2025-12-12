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
	public String getBusinessDescription() {
		return businessDescription;
	}
	public void setBusinessDescription(String businessDescription) {
		this.businessDescription = businessDescription;
	}
	public String getOwnBusiness() {
		return ownBusiness;
	}
	public void setOwnBusiness(String ownBusiness) {
		this.ownBusiness = ownBusiness;
	}
	public String getBusinessSize() {
		return businessSize;
	}
	public void setBusinessSize(String businessSize) {
		this.businessSize = businessSize;
	}
	public String getPlatform() {
		return platform;
	}
	public void setPlatform(String platform) {
		this.platform = platform;
	}
	public Long getStoreId() {
		return storeId;
	}
	public void setStoreId(Long storeId) {
		this.storeId = storeId;
	}
	public BusinessDetailsRequest(String businessDescription, String ownBusiness, String businessSize, String platform,
			Long storeId) {
		super();
		this.businessDescription = businessDescription;
		this.ownBusiness = ownBusiness;
		this.businessSize = businessSize;
		this.platform = platform;
		this.storeId = storeId;
	}
    
    
    
}

