package com.smartbiz.sakhistore.modules.category.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO for creating/updating Category
 */
@Data
public class CategoryRequestDTO {

    private Long categoryId; // For updates

    @NotBlank(message = "Category name is required")
    @Size(min = 2, max = 100, message = "Category name must be between 2 and 100 characters")
    private String categoryName;

    private String businessCategory;
    private String description;
    private String categoryImage;

    // SEO fields
    private String seoTitleTag;
    private String seoMetaDescription;
    private String socialSharingImage;

    // Status fields
    private Boolean isActive = true;
    private Boolean isTrending = false;
    private Integer orderIndex = 0;
    private String slug;

    public CategoryRequestDTO() {
    }

    public CategoryRequestDTO(String categoryName, String businessCategory) {
        this.categoryName = categoryName;
        this.businessCategory = businessCategory;
    }

    // Validation helper
    public boolean isValid() {
        return categoryName != null && !categoryName.trim().isEmpty();
    }
}

