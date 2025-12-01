package com.smartbiz.sakhistore.modules.cart.service;

import com.smartbiz.sakhistore.modules.cart.model.Cart;
import com.smartbiz.sakhistore.modules.order.model.OrderItems;
import com.smartbiz.sakhistore.modules.customer_user.model.User;


import com.smartbiz.sakhistore.modules.cart.repository.CartRepository;
import com.smartbiz.sakhistore.modules.order.repository.OrderItemsRepository;
import com.smartbiz.sakhistore.modules.customer_user.repository.UserRepository;
import com.smartbiz.sakhistore.modules.product.model.Product;
import com.smartbiz.sakhistore.modules.product.repository.ProductRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;



@Service
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderItemsRepository orderItemsRepository;

    public CartService(CartRepository cartRepository, ProductRepository productRepository,
                       UserRepository userRepository, OrderItemsRepository orderItemsRepository) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
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
    // ADD PRODUCT TO CART
    // ===============================
    public Cart addToCart(Long userId, Long productId, Integer quantity) {

        Cart cart = getOrCreateCart(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product Not Found"));

        // Check if product already exists in cart
        List<OrderItems> items = cart.getItems();
        for (OrderItems item : items) {
            if (item.getProduct().getProductsId().equals(productId)) {
                item.setQuantity(item.getQuantity() + quantity);
                item.setPrice(item.getQuantity() * product.getSellingPrice());  // updated
                return cartRepository.save(cart);
            }
        }

        // Create new cart item
        OrderItems orderItem = new OrderItems();
        orderItem.setProduct(product);
        orderItem.setQuantity(quantity);
        orderItem.setPrice(product.getSellingPrice() * quantity); // updated
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
    // REMOVE PRODUCT FROM CART
    // ===============================
    public Cart removeFromCart(Long userId, Long productId) {

        Cart cart = getOrCreateCart(userId);

        cart.getItems().removeIf(item ->
                item.getProduct().getProductsId().equals(productId));

        return cartRepository.save(cart);
    }

    // ===============================
    // UPDATE ITEM QUANTITY
    // ===============================
    public Cart updateQuantity(Long userId, Long productId, Integer quantity) {

        Cart cart = getOrCreateCart(userId);

        for (OrderItems item : cart.getItems()) {
            if (item.getProduct().getProductsId().equals(productId)) {

                if (quantity <= 0) {
                    cart.getItems().remove(item);
                    break;
                }

                item.setQuantity(quantity);
                item.setPrice(quantity * item.getProduct().getSellingPrice()); // updated
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
