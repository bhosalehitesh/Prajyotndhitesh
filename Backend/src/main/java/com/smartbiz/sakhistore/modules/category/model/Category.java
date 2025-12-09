package com.smartbiz.sakhistore.modules.category.model;


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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "Category")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long category_id;

    private String categoryImage;
    private String categoryName;
    private String businessCategory;
    private String description;

    // SEO
    private String seoTitleTag;
    private String seoMetaDescription;
    private String socialSharingImage;

    // ============================
    // 🔗 CATEGORY → SELLER
    // ============================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id")
    @JsonIgnore
    private SellerDetails seller;

    // ============================
    // ✅ CORRECT MAPPING
    // One Category -> Many Products
    // ============================
    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY)
    private List<Product> products;

    // ============================
    // Getters & Setters
    // ============================
    public Long getCategory_id() {
        return category_id;
    }

    public void setCategory_id(Long category_id) {
        this.category_id = category_id;
    }

    public String getCategoryImage() {
        return categoryImage;
    }

    public void setCategoryImage(String categoryImage) {
        this.categoryImage = categoryImage;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getBusinessCategory() {
        return businessCategory;
    }

    public void setBusinessCategory(String businessCategory) {
        this.businessCategory = businessCategory;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public Category() {}
}