package com.smartbiz.sakhistore.modules.store.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.smartbiz.sakhistore.modules.auth.sellerauth.model.SellerDetails;

import java.time.LocalDateTime;

@Entity
@Table(name = "store_logos")
public class StoreLogo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long logoId;

    @ManyToOne
    @JoinColumn(name = "store_id", nullable = false)
    @JsonIgnore
    private StoreDetails store;

    @ManyToOne
    @JoinColumn(name = "seller_id", nullable = false)
    @JsonIgnore
    private SellerDetails seller;

    private String logoUrl; // URL to logo image (stored in Cloudinary)

    @Column(name = "is_active")
    private Boolean isActive = true; // Current active logo

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;

    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getLogoId() {
        return logoId;
    }

    public void setLogoId(Long logoId) {
        this.logoId = logoId;
    }

    public StoreDetails getStore() {
        return store;
    }

    public void setStore(StoreDetails store) {
        this.store = store;
    }

    public SellerDetails getSeller() {
        return seller;
    }

    public void setSeller(SellerDetails seller) {
        this.seller = seller;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
}

