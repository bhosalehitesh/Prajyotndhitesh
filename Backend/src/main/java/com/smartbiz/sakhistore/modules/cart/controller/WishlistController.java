package com.smartbiz.sakhistore.modules.cart.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.smartbiz.sakhistore.modules.cart.model.WishlistItem;
import com.smartbiz.sakhistore.modules.cart.service.WishlistService;
import com.smartbiz.sakhistore.modules.customer_user.model.User;

@RestController
@RequestMapping("/wishlist")
@CrossOrigin("*")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    // GET ALL WISHLIST ITEMS
    @GetMapping("/all/{userId}")
    public List<WishlistItem> getAll(@PathVariable Long userId) {
        User user = new User();
        user.setId(userId);
        return wishlistService.getWishlist(user);
    }

    // ADD TO WISHLIST
    @PostMapping("/add/{userId}/{productId}")
    public WishlistItem add(@PathVariable Long userId, @PathVariable Long productId) {
        User user = new User();
        user.setId(userId);
        return wishlistService.addToWishlist(user, productId);
    }

    // REMOVE
    @DeleteMapping("/remove/{userId}/{productId}")
    public String remove(@PathVariable Long userId, @PathVariable Long productId) {
        User user = new User();
        user.setId(userId);
        wishlistService.removeFromWishlist(user, productId);
        return "Removed";
    }

    // MOVE TO CART
    @PostMapping("/move-to-cart/{userId}/{productId}")
    public String move(@PathVariable Long userId, @PathVariable Long productId) {
        User user = new User();
        user.setId(userId);
        wishlistService.moveToCart(user, productId);
        return "Moved to cart";
    }
}
