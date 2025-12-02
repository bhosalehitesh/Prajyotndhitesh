package com.smartbiz.sakhistore.modules.store.model;

import jakarta.persistence.Entity;
import jakarta.persistence.*;
import com.smartbiz.sakhistore.modules.auth.sellerauth.model.SellerDetails;

@Entity
@Table(name = "store_details")
public class StoreDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long storeId;

    private String storeName;
    private String storeLink;

    @OneToOne
    @JoinColumn(name = "seller_id")
    private SellerDetails seller;

    @OneToOne(mappedBy = "storeDetails", cascade = CascadeType.ALL)
    private StoreAddress storeAddress;

    @OneToOne(mappedBy = "storeDetails", cascade = CascadeType.ALL)
    private BusinessDetails businessDetails;

    // Getters and Setters
    public Long getStoreId() { return storeId; }
    public void setStoreId(Long storeId) { this.storeId = storeId; }

    public String getStoreName() { return storeName; }
    public void setStoreName(String storeName) { this.storeName = storeName; }

    public String getStoreLink() { return storeLink; }
    public void setStoreLink(String storeLink) { this.storeLink = storeLink; }

    public SellerDetails getSeller() { return seller; }
    public void setSeller(SellerDetails seller) { this.seller = seller; }

    public StoreAddress getStoreAddress() { return storeAddress; }
    public void setStoreAddress(StoreAddress storeAddress) { this.storeAddress = storeAddress; }

    public BusinessDetails getBusinessDetails() { return businessDetails; }
    public void setBusinessDetails(BusinessDetails businessDetails) { this.businessDetails = businessDetails; }
}
