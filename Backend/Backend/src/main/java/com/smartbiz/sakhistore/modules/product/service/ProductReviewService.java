package com.smartbiz.sakhistore.modules.product.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartbiz.sakhistore.modules.customer_user.model.User;
import com.smartbiz.sakhistore.modules.customer_user.repository.UserRepository;
import com.smartbiz.sakhistore.modules.product.dto.ReviewRequestDTO;
import com.smartbiz.sakhistore.modules.product.dto.ReviewResponseDTO;
import com.smartbiz.sakhistore.modules.product.model.Product;
import com.smartbiz.sakhistore.modules.product.model.ProductReview;
import com.smartbiz.sakhistore.modules.product.repository.ProductRepository;
import com.smartbiz.sakhistore.modules.product.repository.ProductReviewRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor   // ← ONLY THIS
public class ProductReviewService {
	
	@Autowired
    private  ProductReviewRepository reviewRepository;
    
	@Autowired
	private ProductRepository productRepository;
    
	@Autowired
	private UserRepository userRepository;

    @Transactional
    public ReviewResponseDTO addOrUpdateReview(Long productId, ReviewRequestDTO request) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + request.getUserId()));

        ProductReview existing = reviewRepository.findByProductAndUser(product, user);

        ProductReview review;
        if (existing != null) {
            review = existing;
            review.setRating(request.getRating());
            review.setComment(request.getComment());
        } else {
            review = new ProductReview(request.getRating(), request.getComment(), product, user);
        }

        ProductReview saved = reviewRepository.save(review);
        return toResponseDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponseDTO> getReviewsForProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        return reviewRepository.findByProduct(product)
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Double getAverageRatingForProduct(Long productId) {
        List<ReviewResponseDTO> reviews = getReviewsForProduct(productId);
        if (reviews.isEmpty()) {
            return 0.0;
        }
        double sum = reviews.stream().mapToInt(ReviewResponseDTO::getRating).sum();
        return sum / reviews.size();
    }

    private ReviewResponseDTO toResponseDTO(ProductReview review) {
        ReviewResponseDTO dto = new ReviewResponseDTO();
        dto.setId(review.getId());
        dto.setProductId(review.getProduct().getProductsId());
        dto.setUserId(review.getUser().getId());
        dto.setUserName(review.getUser().getFullName());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setCreatedAt(review.getCreatedAt());
        return dto;
    }
}
