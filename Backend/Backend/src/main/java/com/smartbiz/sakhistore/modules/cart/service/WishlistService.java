package com.smartbiz.sakhistore.modules.cart.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smartbiz.sakhistore.modules.cart.model.Cart;
import com.smartbiz.sakhistore.modules.cart.model.WishlistItem;
import com.smartbiz.sakhistore.modules.cart.repository.CartRepository;
import com.smartbiz.sakhistore.modules.cart.repository.WishlistRepository;
import com.smartbiz.sakhistore.modules.customer_user.model.User;
import com.smartbiz.sakhistore.modules.customer_user.repository.UserRepository;
import com.smartbiz.sakhistore.modules.order.model.OrderItems;
import com.smartbiz.sakhistore.modules.order.repository.OrderItemsRepository;
import com.smartbiz.sakhistore.modules.product.model.Product;
import com.smartbiz.sakhistore.modules.product.repository.ProductRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class WishlistService {

    @Autowired
    private WishlistRepository wishlistRepo;

    @Autowired
    private ProductRepository productRepo;

    @Autowired
    private CartRepository cartRepo;

    @Autowired
    private OrderItemsRepository orderItemsRepo;

    @Autowired
    private UserRepository userRepo;

    // -----------------------------------------------------
    // GET ALL WISHLIST ITEMS
    // -----------------------------------------------------
    public List<WishlistItem> getWishlist(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return wishlistRepo.findByUser(user);
    }

    // -----------------------------------------------------
    // ADD PRODUCT TO WISHLIST
    // -----------------------------------------------------
    public WishlistItem addToWishlist(Long userId, Long productId) {
        // Fetch User entity from database
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (wishlistRepo.existsByUserAndProduct(user, product)) {
            throw new RuntimeException("Already in wishlist");
        }

        WishlistItem item = new WishlistItem();
        item.setUser(user);
        item.setProduct(product);

        return wishlistRepo.save(item);
    }

    // -----------------------------------------------------
    // REMOVE PRODUCT FROM WISHLIST
    // -----------------------------------------------------
    public void removeFromWishlist(Long userId, Long productId) {
        // Fetch User entity from database
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        wishlistRepo.deleteByUserAndProduct(user, product);
    }

    // -----------------------------------------------------
    // MOVE PRODUCT FROM WISHLIST → CART
    // -----------------------------------------------------
    public void moveToCart(Long userId, Long productId) {
        // Fetch User entity from database
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // 1. Remove from wishlist
        wishlistRepo.deleteByUserAndProduct(user, product);

        // 2. Get or create user cart
        Cart cart = cartRepo.findByUser(user).orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setUser(user);
            return cartRepo.save(newCart);
        });

        // 3. Check if item already exists in cart
        OrderItems existingItem = orderItemsRepo.findByCartAndProduct(cart, product);

        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + 1);
            existingItem.setPrice(product.getSellingPrice() * existingItem.getQuantity());
            orderItemsRepo.save(existingItem);
            return;
        }
        
        // 4. Add new product to cart
        OrderItems newItem = new OrderItems();
        newItem.setProduct(product);
        newItem.setQuantity(1);
        newItem.setPrice(product.getSellingPrice());
        newItem.setCart(cart);

        orderItemsRepo.save(newItem);
    }
}
