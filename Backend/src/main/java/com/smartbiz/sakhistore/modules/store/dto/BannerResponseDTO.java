package com.smartbiz.sakhistore.modules.store.dto;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * DTO for Banner response
 */
@Data
public class BannerResponseDTO {

    private Long bannerId;
    private String imageUrl;
    private String title;
    private String buttonText;
    private String buttonLink;
    private Integer displayOrder;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Seller information (without full SellerDetails object)
    private Long sellerId;

    public BannerResponseDTO() {
    }

    public BannerResponseDTO(Long bannerId, String imageUrl, String title, 
                             String buttonText, String buttonLink, 
                             Integer displayOrder, Boolean isActive) {
        this.bannerId = bannerId;
        this.imageUrl = imageUrl;
        this.title = title;
        this.buttonText = buttonText;
        this.buttonLink = buttonLink;
        this.displayOrder = displayOrder;
        this.isActive = isActive;
    }
}

