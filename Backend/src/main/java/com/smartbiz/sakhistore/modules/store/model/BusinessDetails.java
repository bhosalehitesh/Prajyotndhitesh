package com.smartbiz.sakhistore.modules.store.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "business_details")
public class BusinessDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long businessId;

    private String businessDescription;
    private String ownBusiness;
    private String businessSize;
    private String platform;

    @OneToOne
    @JoinColumn(name = "store_id")
    @JsonIgnore // prevent infinite JSON recursion via StoreDetails -> BusinessDetails -> StoreDetails -> ...
    private StoreDetails storeDetails;

    // Getters and Setters
    public Long getBusinessId() { return businessId; }
    public void setBusinessId(Long businessId) { this.businessId = businessId; }

    public String getBusinessDescription() { return businessDescription; }
    public void setBusinessDescription(String businessDescription) { this.businessDescription = businessDescription; }

    public String getOwnBusiness() {
        return ownBusiness;
    }
    public void setOwnBusiness(String ownBusiness) {
        this.ownBusiness = ownBusiness;
    }

    public String getBusinessSize() { return businessSize; }
    public void setBusinessSize(String businessSize) { this.businessSize = businessSize; }

    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }

    public StoreDetails getStoreDetails() { return storeDetails; }
    public void setStoreDetails(StoreDetails storeDetails) { this.storeDetails = storeDetails; }
}
