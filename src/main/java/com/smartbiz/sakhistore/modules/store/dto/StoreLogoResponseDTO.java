package com.smartbiz.sakhistore.modules.store.dto;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * DTO for StoreLogo response
 */
@Data
public class StoreLogoResponseDTO {

    private Long logoId;
    private String logoUrl;
    private Boolean isActive;
    private LocalDateTime uploadedAt;
    private Long storeId;
    private Long sellerId;

    public StoreLogoResponseDTO() {
    }

    public StoreLogoResponseDTO(Long logoId, String logoUrl, Boolean isActive, LocalDateTime uploadedAt) {
        this.logoId = logoId;
        this.logoUrl = logoUrl;
        this.isActive = isActive;
        this.uploadedAt = uploadedAt;
    }
}

