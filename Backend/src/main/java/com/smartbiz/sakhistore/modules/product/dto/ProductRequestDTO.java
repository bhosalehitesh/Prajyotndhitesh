package com.smartbiz.sakhistore.modules.product.dto;

import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProductRequestDTO {

    @NotBlank
    private String productName;

    @NotBlank
    private String description;

    @NotNull
    private Double mrp;

    @NotNull
    private Double sellingPrice;

    @NotBlank
    private String businessCategory;

    @NotBlank
    private String productCategory;

    @NotNull
    private Integer inventoryQuantity;

    private String customSku;
    private String color;
    private String size;
    private String variant;
    private String hsnCode;

    private String seoTitleTag;
    private String seoMetaDescription;

    private List<String> productImages;  // URLs after upload
    private String socialSharingImage;   // URL
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @NotNull
    private Long sellerId; // If needed later

    private Long categoryId;

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

	public List<String> getProductImages() {
		return productImages;
	}

	public void setProductImages(List<String> productImages) {
		this.productImages = productImages;
	}

	public String getSocialSharingImage() {
		return socialSharingImage;
	}

	public void setSocialSharingImage(String socialSharingImage) {
		this.socialSharingImage = socialSharingImage;
	}

	public Long getSellerId() {
		return sellerId;
	}

	public void setSellerId(Long sellerId) {
		this.sellerId = sellerId;
	}

	public Long getCategoryId() {
		return categoryId;
	}

	public void setCategoryId(Long categoryId) {
		this.categoryId = categoryId;
	}

	public ProductRequestDTO() {
		super();
	}

	public ProductRequestDTO(@NotBlank String productName, @NotBlank String description, @NotNull Double mrp,
			@NotNull Double sellingPrice, @NotBlank String businessCategory, @NotBlank String productCategory,
			@NotNull Integer inventoryQuantity, String customSku, String color, String size, String variant,
			String hsnCode, String seoTitleTag, String seoMetaDescription, List<String> productImages,
			String socialSharingImage, @NotNull Long sellerId, Long categoryId) {
		super();
		this.productName = productName;
		this.description = description;
		this.mrp = mrp;
		this.sellingPrice = sellingPrice;
		this.businessCategory = businessCategory;
		this.productCategory = productCategory;
		this.inventoryQuantity = inventoryQuantity;
		this.customSku = customSku;
		this.color = color;
		this.size = size;
		this.variant = variant;
		this.hsnCode = hsnCode;
		this.seoTitleTag = seoTitleTag;
		this.seoMetaDescription = seoMetaDescription;
		this.productImages = productImages;
		this.socialSharingImage = socialSharingImage;
		this.sellerId = sellerId;
		this.categoryId = categoryId;
	}
    
    
    
}
