package com.smartbiz.sakhistore.modules.product.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class ProductResponseDTO {

    private Long productsId;
    private String productName;
    private String description;
    private Double mrp;
    private Double sellingPrice;

    private String businessCategory;
    private String productCategory;

    private Integer inventoryQuantity;
    private String customSku;
    private String color;
    private String size;
    private String variant;
    private String hsnCode;

    private String seoTitleTag;
    private String seoMetaDescription;
    private String socialSharingImage;

    private LocalDateTime createdAt;
    private List<String> productImages;

    public ProductResponseDTO() {}

    public ProductResponseDTO(
            Long productsId,
            String productName,
            String description,
            Double mrp,
            Double sellingPrice,
            String businessCategory,
            String productCategory,
            Integer inventoryQuantity,
            String customSku,
            String color,
            String size,
            String variant,
            String hsnCode,
            String seoTitleTag,
            String seoMetaDescription,
            String socialSharingImage,
            LocalDateTime createdAt,
            List<String> productImages
    ) {
        this.productsId = productsId;
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
        this.socialSharingImage = socialSharingImage;
        this.createdAt = createdAt;
        this.productImages = productImages;
    }

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

	public String getSocialSharingImage() {
		return socialSharingImage;
	}

	public void setSocialSharingImage(String socialSharingImage) {
		this.socialSharingImage = socialSharingImage;
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
    
    
}
