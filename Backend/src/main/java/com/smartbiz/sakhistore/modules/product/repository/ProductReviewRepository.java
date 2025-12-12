package com.smartbiz.sakhistore.modules.product.repository;

import java.util.List; 

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smartbiz.sakhistore.modules.customer_user.model.User;
import com.smartbiz.sakhistore.modules.product.model.Product;
import com.smartbiz.sakhistore.modules.product.model.ProductReview;

@Repository
public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {

    // All reviews for a product
    List<ProductReview> findByProduct(Product product);

    // All reviews by a user
    List<ProductReview> findByUser(User user);

    // Optional: one review per product per user
    ProductReview findByProductAndUser(Product product, User user);
}