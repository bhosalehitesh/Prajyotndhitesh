package com.smartbiz.sakhistore.modules.store.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO for creating/updating Banner
 */
@Data
public class BannerRequest {

    private Long bannerId; // For updates

    @NotNull(message = "Seller ID is required")
    private Long sellerId;

    @Size(max = 500, message = "Image URL must be less than 500 characters")
    private String imageUrl;

    @Size(max = 200, message = "Title must be less than 200 characters")
    private String title;

    @Size(max = 50, message = "Button text must be less than 50 characters")
    private String buttonText;

    @Size(max = 500, message = "Button link must be less than 500 characters")
    private String buttonLink;

    private Integer displayOrder = 0;

    private Boolean isActive = true;

    public BannerRequest() {
    }

    public BannerRequest(Long sellerId, String imageUrl, String title, 
                         String buttonText, String buttonLink, Integer displayOrder) {
        this.sellerId = sellerId;
        this.imageUrl = imageUrl;
        this.title = title;
        this.buttonText = buttonText;
        this.buttonLink = buttonLink;
        this.displayOrder = displayOrder;
    }

    // Validation helper
    public boolean isValid() {
        return sellerId != null && sellerId > 0 && imageUrl != null && !imageUrl.trim().isEmpty();
    }
}

