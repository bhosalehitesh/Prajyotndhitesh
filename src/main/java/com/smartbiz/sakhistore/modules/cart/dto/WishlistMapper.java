package com.smartbiz.sakhistore.modules.cart.dto;

import com.smartbiz.sakhistore.modules.cart.model.WishlistItem;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper utility to convert Wishlist entities to DTOs
 */
@Component
public class WishlistMapper {

    /**
     * Convert WishlistItem entity to WishlistItemResponseDTO
     */
    public WishlistItemResponseDTO toWishlistItemResponseDTO(WishlistItem item) {
        if (item == null) {
            return null;
        }

        WishlistItemResponseDTO dto = new WishlistItemResponseDTO();
        dto.setWishlistItemId(item.getId());
        dto.setCreatedAt(item.getCreatedAt());

        // User information
        if (item.getUser() != null) {
            dto.setUserId(item.getUser().getId());
        }

        // Product information
        if (item.getProduct() != null) {
            dto.setProductId(item.getProduct().getProductsId());
            dto.setProductName(item.getProduct().getProductName());
            dto.setProductDescription(item.getProduct().getDescription());
            dto.setProductImages(item.getProduct().getProductImages());
            dto.setProductMrp(item.getProduct().getMrp());
            dto.setProductSellingPrice(item.getProduct().getSellingPrice());

            // Check if product is in stock (has active variants with stock > 0)
            // This is a simplified check - you might want to enhance this
            dto.setProductInStock(item.getProduct().getInventoryQuantity() != null 
                && item.getProduct().getInventoryQuantity() > 0);
        }

        return dto;
    }

    /**
     * Convert list of WishlistItems to WishlistResponseDTO
     */
    public WishlistResponseDTO toWishlistResponseDTO(Long userId, String userName, List<WishlistItem> items) {
        WishlistResponseDTO dto = new WishlistResponseDTO();
        dto.setUserId(userId);
        dto.setUserName(userName);

        if (items != null) {
            List<WishlistItemResponseDTO> itemDTOs = items.stream()
                    .map(this::toWishlistItemResponseDTO)
                    .collect(Collectors.toList());
            dto.setItems(itemDTOs);
        }

        dto.calculateSummary();
        return dto;
    }
}

