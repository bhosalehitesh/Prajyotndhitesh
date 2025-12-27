package com.smartbiz.sakhistore.modules.cart.dto;

import lombok.Data;
import java.util.List;

/**
 * DTO for wishlist response
 */
@Data
public class WishlistResponseDTO {

    private Long userId;
    private String userName;
    private List<WishlistItemResponseDTO> items;
    private Integer totalItems;
    private Boolean isEmpty;

    public WishlistResponseDTO() {
    }

    public WishlistResponseDTO(Long userId, List<WishlistItemResponseDTO> items) {
        this.userId = userId;
        this.items = items;
        calculateSummary();
    }

    // Calculate summary
    public void calculateSummary() {
        if (items != null) {
            this.totalItems = items.size();
            this.isEmpty = items.isEmpty();
        } else {
            this.totalItems = 0;
            this.isEmpty = true;
        }
    }
}

