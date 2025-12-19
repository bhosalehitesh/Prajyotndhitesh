package com.smartbiz.sakhistore.modules.category.model;


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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "Category")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long category_id;

    @JsonProperty("categoryImage")
    private String categoryImage;
    
    @JsonProperty("categoryName")
    private String categoryName;
    private String businessCategory;
    private String description;

    // =======================
    // CATEGORY STATUS (SmartBiz: ACTIVE / HIDDEN)
    // Used to control website navigation visibility
    // =======================
    @Column(name = "is_active", nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean isActive = true;

    // =======================
    // CATEGORY ORDER (SmartBiz: order index for sorting)
    // =======================
    @Column(name = "order_index", nullable = false, columnDefinition = "INTEGER DEFAULT 0")
    private Integer orderIndex = 0;

    // =======================
    // CATEGORY SLUG (SmartBiz: URL-friendly identifier)
    // =======================
    @Column(name = "slug")
    private String slug;

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
    @JsonProperty("categoryId")
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

    public Boolean getIsActive() {
        return isActive != null ? isActive : true;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive != null ? isActive : true;
    }

    public Integer getOrderIndex() {
        return orderIndex != null ? orderIndex : 0;
    }

    public void setOrderIndex(Integer orderIndex) {
        this.orderIndex = orderIndex != null ? orderIndex : 0;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
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