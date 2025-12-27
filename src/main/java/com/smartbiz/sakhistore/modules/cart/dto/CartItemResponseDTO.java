package com.smartbiz.sakhistore.modules.cart.dto;

import lombok.Data;
import java.util.List;

/**
 * DTO for cart item response
 * Represents a single item in the cart (OrderItems)
 */
@Data
public class CartItemResponseDTO {

    private Long orderItemsId;
    private Integer quantity;
    private Double price;
    private Double unitPrice; // Price per unit

    // Product information (flattened for convenience)
    private Long productId;
    private String productName;
    private String productDescription;
    private List<String> productImages;
    private Double productMrp;
    private Double productSellingPrice;

    // Variant information (if applicable)
    private Long variantId;
    private String variantColor;
    private String variantSize;
    private Integer variantStock;
    private Double variantSellingPrice;

    // Calculated fields
    private Double totalPrice; // quantity * unitPrice
    private Double discountAmount; // MRP - Selling Price
    private Double discountPercentage; // (discountAmount / MRP) * 100

    // ✅ Nested product object for frontend backward compatibility
    private ProductInfo product;
    private VariantInfo variant;

    // Inner class for nested product structure
    @Data
    public static class ProductInfo {
        private Long productsId;
        private String productName;
        private String description;
        private List<String> productImages;
        private Double mrp;
        private Double sellingPrice;
        private String brand; // For frontend compatibility
    }

    // Inner class for nested variant structure
    @Data
    public static class VariantInfo {
        private Long variantId;
        private String color;
        private String size;
        private Integer stock;
        private Double sellingPrice;
        private Double mrp;
    }

    public CartItemResponseDTO() {
    }

    // Helper method to calculate total price
    public void calculateTotalPrice() {
        if (quantity != null && unitPrice != null) {
            this.totalPrice = quantity * unitPrice;
        }
    }

    // Helper method to calculate discount
    public void calculateDiscount() {
        if (productMrp != null && productSellingPrice != null && productMrp > 0) {
            this.discountAmount = productMrp - productSellingPrice;
            this.discountPercentage = (discountAmount / productMrp) * 100;
        }
    }
}

