package com.smartbiz.sakhistore.modules.order.dto;

import lombok.Data;

/**
 * DTO for individual order item response
 */
@Data
public class OrderItemResponseDTO {

    private Long orderItemsId;
    private Integer quantity;
    private Double price;
    private Double unitPrice;

    // Product information
    private Long productId;
    private String productName;
    private String productDescription;
    private java.util.List<String> productImages;
    private Double productMrp;
    private Double productSellingPrice;

    // Variant information (if applicable)
    private Long variantId;
    private String variantColor;
    private String variantSize;
    private Integer variantStock;

    // Calculated fields
    private Double totalPrice;

    public OrderItemResponseDTO() {
    }

    // Calculate total price - use unitPrice first (from database), fallback to price
    public void calculateTotalPrice() {
        if (quantity != null && unitPrice != null) {
            // Use unitPrice from database (preferred)
            this.totalPrice = quantity * unitPrice;
        } else if (quantity != null && price != null) {
            // Fallback to price field (should also be unit price after fix)
            this.totalPrice = quantity * price;
        }
    }
}

