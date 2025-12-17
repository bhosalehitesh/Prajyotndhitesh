package com.smartbiz.sakhistore.modules.cart.service;

import com.smartbiz.sakhistore.modules.cart.model.Cart;
import com.smartbiz.sakhistore.modules.order.model.OrderItems;
import com.smartbiz.sakhistore.modules.customer_user.model.User;


import com.smartbiz.sakhistore.modules.cart.repository.CartRepository;
import com.smartbiz.sakhistore.modules.order.repository.OrderItemsRepository;
import com.smartbiz.sakhistore.modules.customer_user.repository.UserRepository;
import com.smartbiz.sakhistore.modules.product.model.Product;
import com.smartbiz.sakhistore.modules.product.model.ProductVariant;
import com.smartbiz.sakhistore.modules.product.repository.ProductRepository;
import com.smartbiz.sakhistore.modules.product.repository.ProductVariantRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;



@Service
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;
    private final OrderItemsRepository orderItemsRepository;

    public CartService(CartRepository cartRepository, ProductRepository productRepository,
                       ProductVariantRepository productVariantRepository,
                       UserRepository userRepository, OrderItemsRepository orderItemsRepository) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.productVariantRepository = productVariantRepository;
        this.userRepository = userRepository;
        this.orderItemsRepository = orderItemsRepository;
    }

    // ===============================
    // GET/CREATE CART FOR USER
    // ===============================
    public Cart getOrCreateCart(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User Not Found"));

        return cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });
    }

    // ===============================
    // ADD PRODUCT TO CART (LEGACY - uses productId, auto-selects first variant)
    // ===============================
    public Cart addToCart(Long userId, Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product Not Found"));
        
        // Find first active variant for backward compatibility
        List<ProductVariant> variants = productVariantRepository.findByProduct_ProductsIdAndIsActiveTrue(productId);
        if (variants.isEmpty()) {
            throw new RuntimeException("Product has no active variants available");
        }
        
        // Use first variant (SmartBiz: prefer explicit variant selection)
        ProductVariant variant = variants.get(0);
        return addVariantToCart(userId, variant.getVariantId(), quantity);
    }

    // ===============================
    // ADD VARIANT TO CART (SmartBiz: cart uses variants, not products)
    // ===============================
    public Cart addVariantToCart(Long userId, Long variantId, Integer quantity) {
        Cart cart = getOrCreateCart(userId);
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant Not Found"));

        // Check stock availability
        if (variant.getStock() < quantity) {
            throw new RuntimeException("Insufficient stock. Available: " + variant.getStock());
        }

        // Check if variant already exists in cart
        List<OrderItems> items = cart.getItems();
        for (OrderItems item : items) {
            if (item.getVariant() != null && item.getVariant().getVariantId().equals(variantId)) {
                int newQuantity = item.getQuantity() + quantity;
                if (newQuantity > variant.getStock()) {
                    throw new RuntimeException("Insufficient stock. Available: " + variant.getStock());
                }
                item.setQuantity(newQuantity);
                item.setPrice(newQuantity * variant.getSellingPrice());
                return cartRepository.save(cart);
            }
        }

        // Create new cart item with variant
        OrderItems orderItem = new OrderItems();
        orderItem.setVariant(variant);
        orderItem.setProduct(variant.getProduct()); // Keep product reference for backward compatibility
        orderItem.setQuantity(quantity);
        orderItem.setPrice(variant.getSellingPrice() * quantity);
        orderItem.setCart(cart);

        items.add(orderItem);
        cart.setItems(items);

        return cartRepository.save(cart);
    }

    // ===============================
    // GET CART ITEMS
    // ===============================
    public Cart getCartByUser(Long userId) {
        return getOrCreateCart(userId);
    }

    // ===============================
    // REMOVE VARIANT FROM CART (SmartBiz: remove by variantId)
    // ===============================
    public Cart removeVariantFromCart(Long userId, Long variantId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().removeIf(item ->
                item.getVariant() != null && item.getVariant().getVariantId().equals(variantId));
        return cartRepository.save(cart);
    }

    // ===============================
    // REMOVE PRODUCT FROM CART (LEGACY - removes all variants of product)
    // ===============================
    public Cart removeFromCart(Long userId, Long productId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().removeIf(item ->
                item.getProduct() != null && item.getProduct().getProductsId().equals(productId));
        return cartRepository.save(cart);
    }

    // ===============================
    // UPDATE VARIANT QUANTITY (SmartBiz: update by variantId)
    // ===============================
    public Cart updateVariantQuantity(Long userId, Long variantId, Integer quantity) {
        Cart cart = getOrCreateCart(userId);

        for (OrderItems item : cart.getItems()) {
            if (item.getVariant() != null && item.getVariant().getVariantId().equals(variantId)) {
                if (quantity <= 0) {
                    cart.getItems().remove(item);
                    break;
                }

                // Check stock availability
                ProductVariant variant = item.getVariant();
                if (quantity > variant.getStock()) {
                    throw new RuntimeException("Insufficient stock. Available: " + variant.getStock());
                }

                item.setQuantity(quantity);
                item.setPrice(quantity * variant.getSellingPrice());
                break;
            }
        }

        return cartRepository.save(cart);
    }

    // ===============================
    // UPDATE ITEM QUANTITY (LEGACY - updates first variant of product)
    // ===============================
    public Cart updateQuantity(Long userId, Long productId, Integer quantity) {
        Cart cart = getOrCreateCart(userId);

        for (OrderItems item : cart.getItems()) {
            if (item.getProduct() != null && item.getProduct().getProductsId().equals(productId)) {
                if (quantity <= 0) {
                    cart.getItems().remove(item);
                    break;
                }

                // Use variant price if available, otherwise fallback to product price
                if (item.getVariant() != null) {
                    ProductVariant variant = item.getVariant();
                    if (quantity > variant.getStock()) {
                        throw new RuntimeException("Insufficient stock. Available: " + variant.getStock());
                    }
                    item.setQuantity(quantity);
                    item.setPrice(quantity * variant.getSellingPrice());
                } else {
                    item.setQuantity(quantity);
                    item.setPrice(quantity * item.getProduct().getSellingPrice());
                }
                break;
            }
        }

        return cartRepository.save(cart);
    }

    // ===============================
    // CLEAR CART
    // ===============================
    public void clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().clear();
        cartRepository.save(cart);
    }
}
