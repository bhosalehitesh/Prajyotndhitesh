package com.smartbiz.sakhistore.modules.collection.model;

import java.util.List;

import com.smartbiz.sakhistore.modules.product.model.Product;
import com.smartbiz.sakhistore.modules.auth.sellerauth.model.SellerDetails;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "collections")
public class collection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long collectionId;

    private String collectionName;
    private String description;
    private String collectionImage;
    private String seoTitleTag;
    private String seoMetaDescription;
    private String socialSharingImage;

    // =======================
    // COLLECTION STATUS (SmartBiz: ACTIVE / HIDDEN - same as Category)
    // =======================
    @Column(name = "is_active", nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean isActive = true;

    // Legacy field (kept for backward compatibility, maps to !isActive)
    // Whether this collection should be hidden on the customer website
    private boolean hideFromWebsite = false;

    // =======================
    // COLLECTION ORDER (SmartBiz: order index for sorting - same as Category)
    // =======================
    @Column(name = "order_index", nullable = false, columnDefinition = "INTEGER DEFAULT 0")
    private Integer orderIndex = 0;

    // =======================
    // COLLECTION SLUG (SmartBiz: URL-friendly identifier - same as Category)
    // =======================
    @Column(name = "slug")
    private String slug;

    // =======================
    // 🔗 COLLECTION → SELLER
    // =======================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id")
    @JsonIgnore
    private SellerDetails seller;

    // =======================
    // 🔗 COLLECTION → PRODUCTS
    // =======================
    @ManyToMany(mappedBy = "collections")
    private List<Product> products;

    // =======================
    // BASIC GETTERS/SETTERS
    // =======================
    public void setCollectionId(Long collectionId) {
        this.collectionId = collectionId;
    }


    public String getCollectionName() {
        return collectionName;
    }


    public void setCollectionName(String collectionName) {
        this.collectionName = collectionName;
    }


    public String getDescription() {
        return description;
    }


    public void setDescription(String description) {
        this.description = description;
    }


    public String getCollectionImage() {
        return collectionImage;
    }


    public void setCollectionImage(String collectionImage) {
        this.collectionImage = collectionImage;
    }


    public String getSeoTitleTag() {
        return seoTitleTag;
    }


    public void setSeoTitleTag(String seoTitleTag) {
        this.seoTitleTag = seoTitleTag;
    }


    public String getSeoMetaDescription() {
        return seoMetaDescription;
    }


    public void setSeoMetaDescription(String seoMetaDescription) {
        this.seoMetaDescription = seoMetaDescription;
    }


    public String getSocialSharingImage() {
        return socialSharingImage;
    }


    public void setSocialSharingImage(String socialSharingImage) {
        this.socialSharingImage = socialSharingImage;
    }

    // =======================
    // STATUS GETTERS/SETTERS (SmartBiz: isActive preferred, hideFromWebsite for backward compatibility)
    // =======================
    public Boolean getIsActive() {
        // Sync with hideFromWebsite for backward compatibility
        if (isActive == null) {
            isActive = !hideFromWebsite;
        }
        return isActive != null ? isActive : true;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive != null ? isActive : true;
        // Sync hideFromWebsite for backward compatibility
        this.hideFromWebsite = !this.isActive;
    }

    // Legacy method (kept for backward compatibility)
    public boolean isHideFromWebsite() {
        // Sync with isActive
        if (isActive != null) {
            return !isActive;
        }
        return hideFromWebsite;
    }

    public void setHideFromWebsite(boolean hideFromWebsite) {
        this.hideFromWebsite = hideFromWebsite;
        // Sync isActive for backward compatibility
        this.isActive = !hideFromWebsite;
    }

    // =======================
    // ORDER INDEX GETTERS/SETTERS (SmartBiz: same as Category)
    // =======================
    public Integer getOrderIndex() {
        return orderIndex != null ? orderIndex : 0;
    }

    public void setOrderIndex(Integer orderIndex) {
        this.orderIndex = orderIndex != null ? orderIndex : 0;
    }

    // =======================
    // SLUG GETTERS/SETTERS (SmartBiz: same as Category)
    // =======================
    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    // =======================
    // JSON HELPER METHODS (SmartBiz: same as Category)
    // =======================
    /**
     * Get collection ID for JSON response (consistent naming)
     */
    @JsonProperty("collectionId")
    public Long getCollectionId() {
        return collectionId;
    }

    /**
     * Get seller ID for JSON response (avoid lazy loading issues)
     */
    @JsonProperty("sellerId")
    public Long getSellerId() {
        return seller != null ? seller.getSellerId() : null;
    }


    public List<Product> getProducts() {
        return products;
    }


    public void setProducts(List<Product> products) {
        this.products = products;
    }

    public SellerDetails getSeller() {
        return seller;
    }

    public void setSeller(SellerDetails seller) {
        this.seller = seller;
    }

    public collection() {}
}