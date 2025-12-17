package com.smartbiz.sakhistore.modules.product.model;

import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.smartbiz.sakhistore.modules.auth.sellerauth.model.SellerDetails;
import com.smartbiz.sakhistore.modules.category.model.Category;
import com.smartbiz.sakhistore.modules.collection.model.collection;

import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import jakarta.validation.constraints.NotNull;

/**
 * Product - Parent container (matches SmartBiz architecture)
 * 
 * Rules:
 * - Product alone cannot be sold unless it has at least one ACTIVE variant
 * - Product must belong to exactly one primary category (MANDATORY)
 * - Price/Stock stored on Variant, NOT on Product
 * - Product type: SINGLE (1 implicit variant) or MULTI_VARIANT (many variants)
 */
@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productsId;

    // =======================
    // BASIC PRODUCT INFO
    // =======================
    @Column(name = "product_name", nullable = false)
    private String productName;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    // =======================
    // PRODUCT SLUG (SmartBiz: SEO slug for URL)
    // Generated from productName, used for website routing
    // =======================
    @Column(name = "slug", unique = false) // Unique per seller, not globally
    private String slug;

    // =======================
    // CATEGORY FIELDS (legacy, kept for compatibility)
    // =======================
    private String businessCategory;
    private String productCategory;

    // =======================
    // LEGACY PRICING / INVENTORY FIELDS
    // (kept for backward compatibility with existing services)
    // SmartBiz-style code should use ProductVariant instead.
    // =======================
    private Double mrp;
    private Double sellingPrice;
    private Integer inventoryQuantity;
    private String customSku;
    private String color;
    private String size;
    private String variant;
    private String hsnCode;

    // =======================
    // PRODUCT TYPE (SmartBiz: single vs multi-variant)
    // SINGLE = 1 implicit variant (auto-created)
    // MULTI_VARIANT = many variants (seller defines)
    // =======================
    @Column(name = "product_type", nullable = false, columnDefinition = "VARCHAR(20) DEFAULT 'SINGLE'")
    private String productType = "SINGLE"; // SINGLE or MULTI_VARIANT

    // =======================
    // SIZE CHART (for products with size variants)
    // =======================
    private String sizeChartImage;

    // =======================
    // SEO FIELDS
    // =======================
    private String seoTitleTag;
    private String seoMetaDescription;
    private String socialSharingImage;
    
    // =======================
    // PRODUCT STATUS
    // =======================
    @Column(name = "is_bestseller", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean isBestseller = false;

    @Column(name = "is_active", nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean isActive = true;

    // =======================
    // TIMESTAMPS
    // =======================
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // =======================
    // PRODUCT IMAGES (base images, variant-specific images stored separately)
    // =======================
    @ElementCollection
    @Column(name = "product_images")
    private List<String> productImages;

    // =======================
    // 🔗 PRODUCT → CATEGORY (MANDATORY - SmartBiz rule)
    // =======================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    @NotNull(message = "Category is required")
    @JsonIgnore
    private Category category;

    // =======================
    // TRANSIENT: categoryId from JSON (for deserialization)
    // Used when frontend sends categoryId directly instead of nested category object
    // =======================
    @Transient
    private Long categoryId;

    // =======================
    // 🔗 PRODUCT → VARIANTS (One Product → Many Variants)
    // =======================
    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY, cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<ProductVariant> variants;

    // =======================
    // 🔗 PRODUCT → COLLECTION
    // =======================
    @ManyToMany
    @JoinTable(
            name = "collection_products",
            joinColumns = @JoinColumn(name = "product_id"),
            inverseJoinColumns = @JoinColumn(name = "collection_id")
    )
    @JsonIgnore
    private List<collection> collections;

    // =======================
    // 🔗 PRODUCT → SELLER
    // =======================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id")
    @JsonIgnore
    private SellerDetails seller;

    public Long getProductsId() {
        return productsId;
    }

    public void setProductsId(Long productsId) {
        this.productsId = productsId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    // ========= Slug / ProductType (SmartBiz) =========
    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getProductType() {
        return productType != null ? productType : "SINGLE";
    }

    public void setProductType(String productType) {
        this.productType = productType != null ? productType : "SINGLE";
    }

    // ========= Legacy pricing / inventory accessors (for older code paths) =========

    public Double getMrp() {
        return mrp;
    }

    public void setMrp(Double mrp) {
        this.mrp = mrp;
    }

    public Double getSellingPrice() {
        return sellingPrice;
    }

    public void setSellingPrice(Double sellingPrice) {
        this.sellingPrice = sellingPrice;
    }

    public Integer getInventoryQuantity() {
        return inventoryQuantity;
    }

    public void setInventoryQuantity(Integer inventoryQuantity) {
        this.inventoryQuantity = inventoryQuantity;
    }

    public String getCustomSku() {
        return customSku;
    }

    public void setCustomSku(String customSku) {
        this.customSku = customSku;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public String getVariant() {
        return variant;
    }

    public void setVariant(String variant) {
        this.variant = variant;
    }

    public String getHsnCode() {
        return hsnCode;
    }

    public void setHsnCode(String hsnCode) {
        this.hsnCode = hsnCode;
    }

    public String getBusinessCategory() {
        return businessCategory;
    }

    public void setBusinessCategory(String businessCategory) {
        this.businessCategory = businessCategory;
    }

    public String getProductCategory() {
        return productCategory;
    }

    public void setProductCategory(String productCategory) {
        this.productCategory = productCategory;
    }

    public String getSizeChartImage() {
        return sizeChartImage;
    }

    public void setSizeChartImage(String sizeChartImage) {
        this.sizeChartImage = sizeChartImage;
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

    public Boolean getIsBestseller() {
        return isBestseller != null ? isBestseller : false;
    }

    public void setIsBestseller(Boolean isBestseller) {
        this.isBestseller = isBestseller != null ? isBestseller : false;
    }

    public Boolean getIsActive() {
        return isActive != null ? isActive : true;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive != null ? isActive : true;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<String> getProductImages() {
        return productImages;
    }

    public void setProductImages(List<String> productImages) {
        this.productImages = productImages;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public List<collection> getCollections() {
        return collections;
    }

    public void setCollections(List<collection> collections) {
        this.collections = collections;
    }

    public SellerDetails getSeller() {
        return seller;
    }

    public void setSeller(SellerDetails seller) {
        this.seller = seller;
    }

    // =======================
    // VARIANT RELATIONSHIP
    // =======================
    public List<ProductVariant> getVariants() {
        return variants;
    }

    public void setVariants(List<ProductVariant> variants) {
        this.variants = variants;
    }

    // =======================
    // HELPER METHODS
    // =======================
    
    /**
     * Getter for sellerId to include in JSON response (for filtering wishlist/cart by store)
     */
    public Long getSellerId() {
        return seller != null ? seller.getSellerId() : null;
    }

    /**
     * Get category ID for JSON response (avoid lazy loading issues)
     * Checks transient field first (from JSON deserialization), then category relationship
     * Always returns a value if category exists (even if lazy-loaded)
     */
    @JsonProperty("categoryId")
    public Long getCategoryId() {
        // First check transient field (set during JSON deserialization)
        if (this.categoryId != null) {
            return this.categoryId;
        }
        // Fallback to category relationship (for existing entities)
        // Try to access category safely to trigger lazy loading if needed
        try {
            if (category != null) {
                Long catId = category.getCategory_id();
                // If we successfully got the ID, cache it in transient field for next access
                if (catId != null) {
                    this.categoryId = catId;
                }
                return catId;
            }
        } catch (Exception e) {
            // If lazy loading fails (e.g., session closed), return null
            // This shouldn't happen with JOIN FETCH, but handle gracefully
            System.err.println("Warning: Could not access category for product " + productsId + ": " + e.getMessage());
        }
        return null;
    }

    /**
     * Set category ID from JSON (for deserialization)
     * This allows frontend to send categoryId directly instead of nested category object
     */
    @com.fasterxml.jackson.annotation.JsonSetter("categoryId")
    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    /**
     * Check if product has any active variants
     */
    public boolean hasActiveVariants() {
        if (variants == null || variants.isEmpty()) {
            return false;
        }
        return variants.stream().anyMatch(v -> v.getIsActive() && v.getStock() > 0);
    }

    /**
     * Get lowest price from variants (for display)
     */
    public Double getLowestPrice() {
        if (variants == null || variants.isEmpty()) {
            return null;
        }
        return variants.stream()
            .filter(v -> v.getIsActive() && v.getStock() > 0)
            .map(ProductVariant::getSellingPrice)
            .min(Double::compareTo)
            .orElse(null);
    }

    /**
     * Get lowest MRP from variants (for display)
     */
    public Double getLowestMrp() {
        if (variants == null || variants.isEmpty()) {
            return null;
        }
        return variants.stream()
            .filter(v -> v.getIsActive() && v.getStock() > 0)
            .map(ProductVariant::getMrp)
            .min(Double::compareTo)
            .orElse(null);
    }

    /**
     * Get total stock across all variants
     */
    public Integer getTotalStock() {
        if (variants == null || variants.isEmpty()) {
            return 0;
        }
        return variants.stream()
            .filter(v -> v.getIsActive())
            .mapToInt(ProductVariant::getStock)
            .sum();
    }

    public Product() {}
}