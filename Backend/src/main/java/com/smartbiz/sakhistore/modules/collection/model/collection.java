package com.smartbiz.sakhistore.modules.collection.model;

import java.util.List;


import com.smartbiz.sakhistore.modules.product.model.Product;
import com.smartbiz.sakhistore.modules.auth.sellerauth.model.SellerDetails;
import com.fasterxml.jackson.annotation.JsonIgnore;
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

    // Whether this collection should be hidden on the customer website
    private boolean hideFromWebsite = false;

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


    public Long getCollectionId() {
        return collectionId;
    }


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

    public boolean isHideFromWebsite() {
        return hideFromWebsite;
    }

    public void setHideFromWebsite(boolean hideFromWebsite) {
        this.hideFromWebsite = hideFromWebsite;
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