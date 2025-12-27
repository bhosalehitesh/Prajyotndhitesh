package com.smartbiz.sakhistore.modules.category.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * DTO for Category upload with images
 */
@Data
public class CategoryUploadRequest {

    @NotBlank(message = "Category name is required")
    private String categoryName;

    @NotBlank(message = "Business category is required")
    private String businessCategory;

    private String description;
    private String seoTitleTag;
    private String seoMetaDescription;

    // Image files
    private List<MultipartFile> categoryImages;
    private MultipartFile socialSharingImage;

    public CategoryUploadRequest() {
    }

    // Validation helper
    public boolean isValid() {
        return categoryName != null && !categoryName.trim().isEmpty()
            && businessCategory != null && !businessCategory.trim().isEmpty();
    }
}

