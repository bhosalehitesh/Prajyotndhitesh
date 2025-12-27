package com.smartbiz.sakhistore.modules.category.dto;

import lombok.Data;

/**
 * DTO for Category response
 */
@Data
public class CategoryResponseDTO {

    private Long categoryId;
    private String categoryName;
    private String businessCategory;
    private String description;
    private String categoryImage;

    // SEO fields
    private String seoTitleTag;
    private String seoMetaDescription;
    private String socialSharingImage;

    // Status fields
    private Boolean isActive;
    private Boolean isTrending;
    private Integer orderIndex;
    private String slug;

    // Seller information
    private Long sellerId;

    // Product count (optional)
    private Long productCount;

    public CategoryResponseDTO() {
    }

    public CategoryResponseDTO(Long categoryId, String categoryName, String businessCategory) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.businessCategory = businessCategory;
    }
}

