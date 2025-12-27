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

    // Calculate total price
    public void calculateTotalPrice() {
        if (quantity != null && price != null) {
            this.totalPrice = quantity * price;
        } else if (quantity != null && unitPrice != null) {
            this.totalPrice = quantity * unitPrice;
        }
    }
}

