package com.smartbiz.sakhistore.modules.cart.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.smartbiz.sakhistore.modules.cart.model.WishlistItem;
import com.smartbiz.sakhistore.modules.cart.service.WishlistService;

@RestController
@RequestMapping("/api/wishlist")
@CrossOrigin("*")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    // GET ALL WISHLIST ITEMS
    @GetMapping("/all/{userId}")
    public List<WishlistItem> getAll(@PathVariable Long userId) {
        return wishlistService.getWishlist(userId);
    }

    // ADD TO WISHLIST
    @PostMapping("/add/{userId}/{productId}")
    public WishlistItem add(@PathVariable Long userId, @PathVariable Long productId) {
        return wishlistService.addToWishlist(userId, productId);
    }

    // REMOVE
    @DeleteMapping("/remove/{userId}/{productId}")
    public String remove(@PathVariable Long userId, @PathVariable Long productId) {
        wishlistService.removeFromWishlist(userId, productId);
        return "Removed";
    }

    // MOVE TO CART
    @PostMapping("/move-to-cart/{userId}/{productId}")
    public String move(@PathVariable Long userId, @PathVariable Long productId) {
        wishlistService.moveToCart(userId, productId);
        return "Moved to cart";
    }
}
