package com.smartbiz.sakhistore.modules.cart.controller;

import com.smartbiz.sakhistore.modules.cart.model.Cart;
import com.smartbiz.sakhistore.modules.cart.service.CartService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    // ============================
    // GET CART BY USER
    // ============================
    @GetMapping("/{userId}")
    public Cart getCart(@PathVariable Long userId) {
        return cartService.getOrCreateCart(userId);
    }

    // ============================
    // ADD PRODUCT TO CART
    // ============================
    @PostMapping("/add")
    public Cart addToCart(@RequestParam Long userId,
                          @RequestParam Long productId,
                          @RequestParam Integer quantity) {

        return cartService.addToCart(userId, productId, quantity);
    }

    // ============================
    // UPDATE QUANTITY
    // ============================
    @PutMapping("/update")
    public Cart updateQuantity(@RequestParam Long userId,
                               @RequestParam Long productId,
                               @RequestParam Integer quantity) {

        return cartService.updateQuantity(userId, productId, quantity);
    }

    // ============================
    // REMOVE ITEM
    // ============================
    @DeleteMapping("/remove")
    public Cart removeFromCart(@RequestParam Long userId,
                               @RequestParam Long productId) {

        return cartService.removeFromCart(userId, productId);
    }

    // ============================
    // CLEAR CART
    // ============================
    @DeleteMapping("/clear/{userId}")
    public String clearCart(@PathVariable Long userId) {
        cartService.clearCart(userId);
        return "Cart cleared successfully!";
    }
}
