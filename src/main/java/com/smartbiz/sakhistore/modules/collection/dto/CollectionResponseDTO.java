package com.smartbiz.sakhistore.modules.collection.dto;

import lombok.Data;

/**
 * DTO for Collection response
 */
@Data
public class CollectionResponseDTO {

    private Long collectionId;
    private String collectionName;
    private String description;
    private String collectionImage;

    // SEO fields
    private String seoTitleTag;
    private String seoMetaDescription;
    private String socialSharingImage;

    // Status fields
    private Boolean isActive;
    private Integer orderIndex;
    private String slug;

    // Legacy field (for backward compatibility)
    private Boolean hideFromWebsite;

    // Seller information
    private Long sellerId;

    // Product count (optional)
    private Long productCount;

    public CollectionResponseDTO() {
    }

    public CollectionResponseDTO(Long collectionId, String collectionName) {
        this.collectionId = collectionId;
        this.collectionName = collectionName;
    }
}

