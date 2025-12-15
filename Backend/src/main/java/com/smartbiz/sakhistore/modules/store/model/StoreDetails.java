package com.smartbiz.sakhistore.modules.store.model;

import jakarta.persistence.Entity;
import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.smartbiz.sakhistore.modules.auth.sellerauth.model.SellerDetails;

@Entity
@Table(name = "store_details")
public class StoreDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long storeId;

    private String storeName;
    private String storeLink;
    private String logoUrl; // URL to store logo image

    @OneToOne
    @JoinColumn(name = "seller_id")
    @JsonIgnore
    private SellerDetails seller;

    @OneToOne(mappedBy = "storeDetails", cascade = CascadeType.ALL)
    @JsonIgnore
    private StoreAddress storeAddress;

    @OneToOne(mappedBy = "storeDetails", cascade = CascadeType.ALL)
    @JsonIgnore
    private BusinessDetails businessDetails;
    
    
    

    public StoreDetails() {
		super();
		// TODO Auto-generated constructor stub
	}
	public StoreDetails(Long storeId, String storeName, String storeLink, String logoUrl, SellerDetails seller,
			StoreAddress storeAddress, BusinessDetails businessDetails) {
		super();
		this.storeId = storeId;
		this.storeName = storeName;
		this.storeLink = storeLink;
		this.logoUrl = logoUrl;
		this.seller = seller;
		this.storeAddress = storeAddress;
		this.businessDetails = businessDetails;
	}
	
	// Getters and Setters
    public Long getStoreId() { return storeId; }
    public void setStoreId(Long storeId) { this.storeId = storeId; }

    public String getStoreName() { return storeName; }
    public void setStoreName(String storeName) { this.storeName = storeName; }

    public String getStoreLink() { return storeLink; }
    public void setStoreLink(String storeLink) { this.storeLink = storeLink; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public SellerDetails getSeller() { return seller; }
    public void setSeller(SellerDetails seller) { this.seller = seller; }

    public StoreAddress getStoreAddress() { return storeAddress; }
    public void setStoreAddress(StoreAddress storeAddress) { this.storeAddress = storeAddress; }

    public BusinessDetails getBusinessDetails() { return businessDetails; }
    public void setBusinessDetails(BusinessDetails businessDetails) { this.businessDetails = businessDetails; }

    /**
     * Get seller ID for JSON serialization (seller object is @JsonIgnore)
     * This allows frontend to access sellerId without exposing full seller object
     */
    @JsonProperty("sellerId")
    public Long getSellerId() {
        if (seller != null) {
            return seller.getSellerId();
        }
        return null;
    }
}
