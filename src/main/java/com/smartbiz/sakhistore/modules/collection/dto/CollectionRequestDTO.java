package com.smartbiz.sakhistore.modules.collection.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO for creating/updating Collection
 */
@Data
public class CollectionRequestDTO {

    private Long collectionId; // For updates

    @NotBlank(message = "Collection name is required")
    @Size(min = 2, max = 100, message = "Collection name must be between 2 and 100 characters")
    private String collectionName;

    private String description;
    private String collectionImage;

    // SEO fields
    private String seoTitleTag;
    private String seoMetaDescription;
    private String socialSharingImage;

    // Status fields
    private Boolean isActive = true;
    private Integer orderIndex = 0;
    private String slug;

    // Legacy field (for backward compatibility)
    private Boolean hideFromWebsite = false;

    public CollectionRequestDTO() {
    }

    public CollectionRequestDTO(String collectionName) {
        this.collectionName = collectionName;
    }

    // Validation helper
    public boolean isValid() {
        return collectionName != null && !collectionName.trim().isEmpty();
    }
}

