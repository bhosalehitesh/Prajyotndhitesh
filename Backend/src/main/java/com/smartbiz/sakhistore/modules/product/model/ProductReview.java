package com.smartbiz.sakhistore.modules.product.model;

import java.time.LocalDateTime; 

import org.hibernate.annotations.CreationTimestamp;

import com.smartbiz.sakhistore.modules.product.model.Product;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.smartbiz.sakhistore.modules.customer_user.model.User;

import jakarta.persistence.*;

@Entity
@Table(name = "product_reviews")
public class ProductReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ⭐ rating between 1 and 5
    @Column(nullable = false)
    private Integer rating;

    @Column(length = 1000)
    private String comment;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    // Many reviews → One product
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id")
    @JsonIgnore
    private Product product;

    // Many reviews → One user
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    // ===== Constructors =====
    public ProductReview() {}

    public ProductReview(Integer rating, String comment, Product product, User user) {
        this.rating = rating;
        this.comment = comment;
        this.product = product;
        this.user = user;
    }

    // ===== Getters & Setters =====

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}