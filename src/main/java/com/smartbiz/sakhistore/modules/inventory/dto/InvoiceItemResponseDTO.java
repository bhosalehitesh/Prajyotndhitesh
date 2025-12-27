package com.smartbiz.sakhistore.modules.inventory.dto;

import lombok.Data;

/**
 * DTO for invoice item response
 */
@Data
public class InvoiceItemResponseDTO {

    private Long itemId;
    private Long productId;
    private String productName;
    private String productDescription;
    private Integer quantity;
    private Double unitPrice;
    private Double totalPrice;
    private Double taxAmount;
    private Double discountAmount;

    // Variant information (if applicable)
    private Long variantId;
    private String variantColor;
    private String variantSize;

    public InvoiceItemResponseDTO() {
    }

    // Calculate total price
    public void calculateTotalPrice() {
        if (quantity != null && unitPrice != null) {
            this.totalPrice = quantity * unitPrice;
            if (discountAmount != null) {
                this.totalPrice -= discountAmount;
            }
        }
    }
}

