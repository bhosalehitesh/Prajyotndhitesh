package com.smartbiz.sakhistore.modules.cart.controller;

import com.smartbiz.sakhistore.modules.cart.dto.*;
import com.smartbiz.sakhistore.modules.cart.model.Cart;
import com.smartbiz.sakhistore.modules.cart.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin
public class CartController {

    private final CartService cartService;
    
    @Autowired
    private CartMapper cartMapper;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    // ============================
    // GET CART BY USER (Using DTO)
    // ============================
    @GetMapping("/{userId}")
    public ResponseEntity<CartResponseDTO> getCart(@PathVariable Long userId) {
        Cart cart = cartService.getOrCreateCart(userId);
        CartResponseDTO responseDTO = cartMapper.toCartResponseDTO(cart);
        return ResponseEntity.ok(responseDTO);
    }

    // ============================
    // ADD ITEM TO CART (Supports both @RequestBody DTO and @RequestParam for backward compatibility)
    // ============================
    @PostMapping("/add")
    public ResponseEntity<CartResponseDTO> addToCart(
            @RequestBody(required = false) AddToCartRequest request,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Long variantId,
            @RequestParam(required = false) Integer quantity) {
        
        // Support both DTO (new way) and RequestParam (old way)
        Long finalUserId;
        Long finalProductId = null;
        Long finalVariantId = null;
        Integer finalQuantity;
        
        if (request != null) {
            // New way: Using DTO
            if (!request.isValid()) {
                return ResponseEntity.badRequest().build();
            }
            finalUserId = request.getUserId();
            finalProductId = request.getProductId();
            finalVariantId = request.getVariantId();
            finalQuantity = request.getQuantity();
        } else {
            // Old way: Using RequestParam (backward compatibility)
            if (userId == null || quantity == null || (productId == null && variantId == null)) {
                return ResponseEntity.badRequest().build();
            }
            finalUserId = userId;
            finalProductId = productId;
            finalVariantId = variantId;
            finalQuantity = quantity;
        }

        Cart cart;
        if (finalVariantId != null) {
            cart = cartService.addVariantToCart(finalUserId, finalVariantId, finalQuantity);
        } else if (finalProductId != null) {
            cart = cartService.addToCart(finalUserId, finalProductId, finalQuantity);
        } else {
            return ResponseEntity.badRequest().build();
        }

        CartResponseDTO responseDTO = cartMapper.toCartResponseDTO(cart);
        return ResponseEntity.ok(responseDTO);
    }

    // ============================
    // ADD VARIANT TO CART (SmartBiz: preferred method - Backward compatibility)
    // ============================
    @PostMapping("/add-variant")
    public ResponseEntity<CartResponseDTO> addVariantToCart(@RequestParam Long userId,
                                                              @RequestParam Long variantId,
                                                              @RequestParam Integer quantity) {
        Cart cart = cartService.addVariantToCart(userId, variantId, quantity);
        CartResponseDTO responseDTO = cartMapper.toCartResponseDTO(cart);
        return ResponseEntity.ok(responseDTO);
    }

    // ============================
    // UPDATE CART ITEM QUANTITY (Supports both @RequestBody DTO and @RequestParam for backward compatibility)
    // ============================
    @PutMapping("/update")
    public ResponseEntity<CartResponseDTO> updateCart(
            @RequestBody(required = false) UpdateCartRequest request,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Long variantId,
            @RequestParam(required = false) Integer quantity) {
        
        // Support both DTO (new way) and RequestParam (old way)
        Long finalUserId;
        Long finalProductId = null;
        Long finalVariantId = null;
        Integer finalQuantity;
        
        if (request != null) {
            // New way: Using DTO
            if (!request.isValid()) {
                return ResponseEntity.badRequest().build();
            }
            finalUserId = request.getUserId();
            finalProductId = request.getProductId();
            finalVariantId = request.getVariantId();
            finalQuantity = request.getQuantity();
        } else {
            // Old way: Using RequestParam (backward compatibility)
            if (userId == null || quantity == null || (productId == null && variantId == null)) {
                return ResponseEntity.badRequest().build();
            }
            finalUserId = userId;
            finalProductId = productId;
            finalVariantId = variantId;
            finalQuantity = quantity;
        }

        Cart cart;
        if (finalVariantId != null) {
            cart = cartService.updateVariantQuantity(finalUserId, finalVariantId, finalQuantity);
        } else if (finalProductId != null) {
            cart = cartService.updateQuantity(finalUserId, finalProductId, finalQuantity);
        } else {
            return ResponseEntity.badRequest().build();
        }

        CartResponseDTO responseDTO = cartMapper.toCartResponseDTO(cart);
        return ResponseEntity.ok(responseDTO);
    }

    // ============================
    // UPDATE VARIANT QUANTITY (SmartBiz: preferred method - Backward compatibility)
    // ============================
    @PutMapping("/update-variant")
    public ResponseEntity<CartResponseDTO> updateVariantQuantity(@RequestParam Long userId,
                                                                  @RequestParam Long variantId,
                                                                  @RequestParam Integer quantity) {
        Cart cart = cartService.updateVariantQuantity(userId, variantId, quantity);
        CartResponseDTO responseDTO = cartMapper.toCartResponseDTO(cart);
        return ResponseEntity.ok(responseDTO);
    }

    // ============================
    // REMOVE ITEM FROM CART (Supports both @RequestBody DTO and @RequestParam for backward compatibility)
    // ============================
    @DeleteMapping("/remove")
    public ResponseEntity<CartResponseDTO> removeFromCart(
            @RequestBody(required = false) RemoveFromCartRequest request,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Long variantId) {
        
        // Support both DTO (new way) and RequestParam (old way)
        Long finalUserId;
        Long finalProductId = null;
        Long finalVariantId = null;
        
        if (request != null) {
            // New way: Using DTO
            if (!request.isValid()) {
                return ResponseEntity.badRequest().build();
            }
            finalUserId = request.getUserId();
            finalProductId = request.getProductId();
            finalVariantId = request.getVariantId();
        } else {
            // Old way: Using RequestParam (backward compatibility)
            if (userId == null || (productId == null && variantId == null)) {
                return ResponseEntity.badRequest().build();
            }
            finalUserId = userId;
            finalProductId = productId;
            finalVariantId = variantId;
        }

        Cart cart;
        if (finalVariantId != null) {
            cart = cartService.removeVariantFromCart(finalUserId, finalVariantId);
        } else if (finalProductId != null) {
            cart = cartService.removeFromCart(finalUserId, finalProductId);
        } else {
            return ResponseEntity.badRequest().build();
        }

        CartResponseDTO responseDTO = cartMapper.toCartResponseDTO(cart);
        return ResponseEntity.ok(responseDTO);
    }

    // ============================
    // REMOVE VARIANT FROM CART (SmartBiz: preferred method - Backward compatibility)
    // ============================
    @DeleteMapping("/remove-variant")
    public ResponseEntity<CartResponseDTO> removeVariantFromCart(@RequestParam Long userId,
                                                                   @RequestParam Long variantId) {
        Cart cart = cartService.removeVariantFromCart(userId, variantId);
        CartResponseDTO responseDTO = cartMapper.toCartResponseDTO(cart);
        return ResponseEntity.ok(responseDTO);
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
