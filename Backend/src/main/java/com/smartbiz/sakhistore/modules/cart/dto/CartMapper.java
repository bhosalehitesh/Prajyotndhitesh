package com.smartbiz.sakhistore.modules.cart.dto;

import com.smartbiz.sakhistore.modules.cart.model.Cart;
import com.smartbiz.sakhistore.modules.order.model.OrderItems;
import com.smartbiz.sakhistore.modules.product.model.Product;
import com.smartbiz.sakhistore.modules.product.model.ProductVariant;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Mapper utility to convert Cart entities to DTOs
 */
@Component
public class CartMapper {

    /**
     * Convert Cart entity to CartResponseDTO
     */
    public CartResponseDTO toCartResponseDTO(Cart cart) {
        if (cart == null) {
            return null;
        }

        CartResponseDTO dto = new CartResponseDTO();
        dto.setCartId(cart.getCartId());
        
        // User information
        if (cart.getUser() != null) {
            dto.setUserId(cart.getUser().getId());
            dto.setUserName(cart.getUser().getFullName());
            dto.setUserPhone(cart.getUser().getPhone());
        }

        // Convert cart items
        List<CartItemResponseDTO> itemDTOs = new ArrayList<>();
        if (cart.getItems() != null) {
            for (OrderItems item : cart.getItems()) {
                CartItemResponseDTO itemDTO = toCartItemResponseDTO(item);
                if (itemDTO != null) {
                    itemDTOs.add(itemDTO);
                }
            }
        }
        dto.setItems(itemDTOs);

        // Calculate summary
        dto.calculateSummary();

        return dto;
    }

    /**
     * Convert OrderItems entity to CartItemResponseDTO
     */
    public CartItemResponseDTO toCartItemResponseDTO(OrderItems item) {
        if (item == null) {
            return null;
        }

        CartItemResponseDTO dto = new CartItemResponseDTO();
        
        // Basic item information
        dto.setOrderItemsId(item.getOrderItemsId());
        dto.setQuantity(item.getQuantity());
        dto.setPrice(item.getPrice());
        
        // Calculate unit price
        if (item.getQuantity() != null && item.getQuantity() > 0 && item.getPrice() != null) {
            dto.setUnitPrice(item.getPrice() / item.getQuantity());
        }

        // ✅ PRIORITIZE VARIANT (SmartBiz: cart uses variants)
        // If variant exists, get product info from variant's product
        Product product = null;
        ProductVariant variant = null;
        
        if (item.getVariant() != null) {
            variant = item.getVariant();
            dto.setVariantId(variant.getVariantId());
            
            // Extract color and size from attributes JSON
            java.util.Map<String, String> attributes = variant.getAttributes();
            if (attributes != null) {
                dto.setVariantColor(attributes.get("color"));
                dto.setVariantSize(attributes.get("size"));
            }
            
            dto.setVariantStock(variant.getStock());
            dto.setVariantSellingPrice(variant.getSellingPrice());
            
            // Use variant price if available
            if (variant.getSellingPrice() != null) {
                dto.setUnitPrice(variant.getSellingPrice());
            }
            
            // ✅ Get product info from variant's product (preferred)
            product = variant.getProduct();
        } 
        // Fallback: Use direct product reference (for backward compatibility)
        else if (item.getProduct() != null) {
            product = item.getProduct();
        }
        
        // Set flattened product fields
        if (product != null) {
            dto.setProductId(product.getProductsId());
            dto.setProductName(product.getProductName());
            dto.setProductDescription(product.getDescription());
            dto.setProductImages(product.getProductImages());
            dto.setProductMrp(product.getMrp());
            dto.setProductSellingPrice(product.getSellingPrice());
            
            // ✅ Create nested product object for frontend backward compatibility
            CartItemResponseDTO.ProductInfo productInfo = new CartItemResponseDTO.ProductInfo();
            productInfo.setProductsId(product.getProductsId());
            productInfo.setProductName(product.getProductName());
            productInfo.setDescription(product.getDescription());
            productInfo.setProductImages(product.getProductImages());
            productInfo.setMrp(product.getMrp());
            productInfo.setSellingPrice(product.getSellingPrice());
            productInfo.setBrand("Store"); // Default brand for frontend compatibility
            dto.setProduct(productInfo);
        }
        
        // ✅ Create nested variant object for frontend backward compatibility
        if (variant != null) {
            CartItemResponseDTO.VariantInfo variantInfo = new CartItemResponseDTO.VariantInfo();
            variantInfo.setVariantId(variant.getVariantId());
            java.util.Map<String, String> attributes = variant.getAttributes();
            if (attributes != null) {
                variantInfo.setColor(attributes.get("color"));
                variantInfo.setSize(attributes.get("size"));
            }
            variantInfo.setStock(variant.getStock());
            variantInfo.setSellingPrice(variant.getSellingPrice());
            variantInfo.setMrp(variant.getMrp());
            dto.setVariant(variantInfo);
        }

        // Calculate totals and discounts
        dto.calculateTotalPrice();
        dto.calculateDiscount();

        return dto;
    }
}

