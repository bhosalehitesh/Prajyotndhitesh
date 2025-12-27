package com.smartbiz.sakhistore.modules.cart.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.smartbiz.sakhistore.modules.cart.dto.*;
import com.smartbiz.sakhistore.modules.cart.model.WishlistItem;
import com.smartbiz.sakhistore.modules.cart.service.WishlistService;
import com.smartbiz.sakhistore.modules.customer_user.repository.UserRepository;

@RestController
@RequestMapping("/api/wishlist")
@CrossOrigin("*")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;
    
    @Autowired
    private WishlistMapper wishlistMapper;
    
    @Autowired
    private UserRepository userRepository;

    // GET ALL WISHLIST ITEMS (Using DTO)
    @GetMapping("/all/{userId}")
    public ResponseEntity<WishlistResponseDTO> getAll(@PathVariable Long userId) {
        List<WishlistItem> items = wishlistService.getWishlist(userId);
        String userName = userRepository.findById(userId)
                .map(user -> user.getFullName())
                .orElse(null);
        WishlistResponseDTO responseDTO = wishlistMapper.toWishlistResponseDTO(userId, userName, items);
        return ResponseEntity.ok(responseDTO);
    }

    // ADD TO WISHLIST (Using DTO)
    @PostMapping("/add/{userId}/{productId}")
    public ResponseEntity<WishlistItemResponseDTO> add(@PathVariable Long userId, @PathVariable Long productId) {
        WishlistItem item = wishlistService.addToWishlist(userId, productId);
        WishlistItemResponseDTO responseDTO = wishlistMapper.toWishlistItemResponseDTO(item);
        return ResponseEntity.ok(responseDTO);
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
