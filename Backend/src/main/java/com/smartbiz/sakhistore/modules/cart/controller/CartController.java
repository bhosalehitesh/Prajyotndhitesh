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
    // ADD VARIANT TO CART (SmartBiz: preferred method)
    // ============================
    @PostMapping("/add-variant")
    public Cart addVariantToCart(@RequestParam Long userId,
                                  @RequestParam Long variantId,
                                  @RequestParam Integer quantity) {
        return cartService.addVariantToCart(userId, variantId, quantity);
    }

    // ============================
    // ADD PRODUCT TO CART (LEGACY - auto-selects first variant)
    // ============================
    @PostMapping("/add")
    public Cart addToCart(@RequestParam Long userId,
                          @RequestParam Long productId,
                          @RequestParam Integer quantity) {
        return cartService.addToCart(userId, productId, quantity);
    }

    // ============================
    // UPDATE VARIANT QUANTITY (SmartBiz: preferred method)
    // ============================
    @PutMapping("/update-variant")
    public Cart updateVariantQuantity(@RequestParam Long userId,
                                      @RequestParam Long variantId,
                                      @RequestParam Integer quantity) {
        return cartService.updateVariantQuantity(userId, variantId, quantity);
    }

    // ============================
    // UPDATE QUANTITY (LEGACY - updates first variant of product)
    // ============================
    @PutMapping("/update")
    public Cart updateQuantity(@RequestParam Long userId,
                               @RequestParam Long productId,
                               @RequestParam Integer quantity) {
        return cartService.updateQuantity(userId, productId, quantity);
    }

    // ============================
    // REMOVE VARIANT FROM CART (SmartBiz: preferred method)
    // ============================
    @DeleteMapping("/remove-variant")
    public Cart removeVariantFromCart(@RequestParam Long userId,
                                      @RequestParam Long variantId) {
        return cartService.removeVariantFromCart(userId, variantId);
    }

    // ============================
    // REMOVE ITEM (LEGACY - removes all variants of product)
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
