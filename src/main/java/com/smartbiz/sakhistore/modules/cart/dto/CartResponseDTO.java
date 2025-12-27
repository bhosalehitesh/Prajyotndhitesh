package com.smartbiz.sakhistore.modules.cart.dto;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;

/**
 * DTO for cart response
 * Represents the complete cart with all items and summary
 */
@Data
public class CartResponseDTO {

    private Long cartId;
    private Long userId;
    private String userName;
    private String userPhone;

    // Cart items
    private List<CartItemResponseDTO> items = new ArrayList<>();

    // Cart summary
    private Integer totalItems; // Total number of items (sum of quantities)
    private Integer uniqueItems; // Number of unique products/variants
    private Double subtotal; // Sum of all item prices
    private Double totalDiscount; // Total discount amount
    private Double totalAmount; // Final amount to pay
    private Double estimatedDeliveryCharge; // Optional: delivery charge
    private Double grandTotal; // subtotal + delivery charge

    // Additional metadata
    private Boolean isEmpty;
    private String message; // Optional: status message

    public CartResponseDTO() {
        this.items = new ArrayList<>();
        this.isEmpty = true;
        this.totalItems = 0;
        this.uniqueItems = 0;
        this.subtotal = 0.0;
        this.totalDiscount = 0.0;
        this.totalAmount = 0.0;
        this.estimatedDeliveryCharge = 0.0;
        this.grandTotal = 0.0;
    }

    // Helper method to calculate cart summary
    public void calculateSummary() {
        if (items == null || items.isEmpty()) {
            this.isEmpty = true;
            this.totalItems = 0;
            this.uniqueItems = 0;
            this.subtotal = 0.0;
            this.totalDiscount = 0.0;
            this.totalAmount = 0.0;
            this.grandTotal = 0.0;
            return;
        }

        this.isEmpty = false;
        this.uniqueItems = items.size();

        // Calculate totals
        int totalQty = 0;
        double subtotalSum = 0.0;
        double discountSum = 0.0;

        for (CartItemResponseDTO item : items) {
            if (item.getQuantity() != null) {
                totalQty += item.getQuantity();
            }
            if (item.getTotalPrice() != null) {
                subtotalSum += item.getTotalPrice();
            }
            if (item.getDiscountAmount() != null && item.getQuantity() != null) {
                discountSum += (item.getDiscountAmount() * item.getQuantity());
            }
        }

        this.totalItems = totalQty;
        this.subtotal = subtotalSum;
        this.totalDiscount = discountSum;
        this.totalAmount = subtotalSum;
        this.grandTotal = subtotalSum + (estimatedDeliveryCharge != null ? estimatedDeliveryCharge : 0.0);
    }
}

