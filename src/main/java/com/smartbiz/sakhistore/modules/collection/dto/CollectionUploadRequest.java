package com.smartbiz.sakhistore.modules.collection.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * DTO for Collection upload with images
 */
@Data
public class CollectionUploadRequest {

    @NotBlank(message = "Collection name is required")
    private String collectionName;

    private String description;
    private String seoTitleTag;
    private String seoMetaDescription;

    // Image files
    private List<MultipartFile> collectionImages;
    private MultipartFile socialSharingImage;

    public CollectionUploadRequest() {
    }

    // Validation helper
    public boolean isValid() {
        return collectionName != null && !collectionName.trim().isEmpty();
    }
}

