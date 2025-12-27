package com.smartbiz.sakhistore.modules.cart.dto;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * DTO for individual wishlist item response
 */
@Data
public class WishlistItemResponseDTO {

    private Long wishlistItemId;
    private LocalDateTime createdAt;

    // Product information
    private Long productId;
    private String productName;
    private String productDescription;
    private java.util.List<String> productImages;
    private Double productMrp;
    private Double productSellingPrice;
    private Boolean productInStock;

    // User information (optional)
    private Long userId;

    public WishlistItemResponseDTO() {
    }

    public WishlistItemResponseDTO(Long wishlistItemId, Long productId, String productName) {
        this.wishlistItemId = wishlistItemId;
        this.productId = productId;
        this.productName = productName;
    }
}

