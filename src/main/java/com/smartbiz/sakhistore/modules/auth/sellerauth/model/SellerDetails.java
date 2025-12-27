package com.smartbiz.sakhistore.modules.auth.sellerauth.model;

import java.time.LocalDateTime;
import java.util.List;

import com.smartbiz.sakhistore.modules.product.model.Product;
import com.smartbiz.sakhistore.modules.store.model.StoreDetails;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "seller_details")
public class SellerDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long sellerId;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, unique = true, length = 10)
    private String phone;

    @Column(nullable = false)
    private String password;

    private String email;

    private String storeCategory;

    @Column(nullable = false)
    private boolean enabled = false;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public SellerDetails() {
    }

    public SellerDetails(Long sellerId, String fullName, String phone, String password, boolean enabled,
            LocalDateTime createdAt, LocalDateTime updatedAt, StoreDetails storeDetails,
            List<Product> products) {
        this.sellerId = sellerId;
        this.fullName = fullName;
        this.phone = phone;
        this.password = password;
        this.enabled = enabled;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.storeDetails = storeDetails;
        this.products = products;
    }

    public SellerDetails(Long sellerId, String fullName, String phone, String password, boolean enabled,
            LocalDateTime createdAt, LocalDateTime updatedAt, String email, String storeCategory) {
        this.sellerId = sellerId;
        this.fullName = fullName;
        this.phone = phone;
        this.password = password;
        this.enabled = enabled;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.email = email;
        this.storeCategory = storeCategory;
    }

    // ===========================
    // RELATIONSHIPS
    // ===========================

    // Inverse side of One-to-One
    @OneToOne(mappedBy = "seller", cascade = CascadeType.ALL)
    private StoreDetails storeDetails;

    // One Seller → Many Products
    @OneToMany(mappedBy = "seller", cascade = CascadeType.ALL)
    private List<Product> products;

    // ===========================
    // GETTERS & SETTERS
    // ===========================

    public Long getSellerId() {
        return sellerId;
    }

    public void setSellerId(Long sellerId) {
        this.sellerId = sellerId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getStoreCategory() {
        return storeCategory;
    }

    public void setStoreCategory(String storeCategory) {
        this.storeCategory = storeCategory;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public StoreDetails getStoreDetails() {
        return storeDetails;
    }

    // 🔥 IMPORTANT FIX
    public void setStoreDetails(StoreDetails storeDetails) {
        this.storeDetails = storeDetails;

        if (storeDetails != null) {
            storeDetails.setSeller(this); // SYNC BOTH SIDES
        }
    }

    public List<Product> getProducts() {
        return products;
    }

    public void setProducts(List<Product> products) {
        this.products = products;
    }
}