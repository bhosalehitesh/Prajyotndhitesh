package com.smartbiz.sakhistore.modules.product.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.smartbiz.sakhistore.modules.product.dto.ReviewRequestDTO;
import com.smartbiz.sakhistore.modules.product.dto.ReviewResponseDTO;
import com.smartbiz.sakhistore.modules.product.service.ProductReviewService;

@RestController
@RequestMapping("/api/reviews")
public class ProductReviewController {

    @Autowired
    private ProductReviewService reviewService;   // ✔ FIXED — Service will NOT be null

    // ⭐ Add / Update review
    @PostMapping("/{productId}")
    public ReviewResponseDTO addReview(
            @PathVariable Long productId,
            @RequestBody ReviewRequestDTO dto) {

        return reviewService.addOrUpdateReview(productId, dto);
    }

    // ⭐ Get all reviews for a product
    @GetMapping("/{productId}")
    public List<ReviewResponseDTO> getReviews(@PathVariable Long productId) {
        return reviewService.getReviewsForProduct(productId);
    }

    // ⭐ Get average rating
    @GetMapping("/{productId}/avg")
    public Double getAverageRating(@PathVariable Long productId) {
        return reviewService.getAverageRatingForProduct(productId);
    }
}
