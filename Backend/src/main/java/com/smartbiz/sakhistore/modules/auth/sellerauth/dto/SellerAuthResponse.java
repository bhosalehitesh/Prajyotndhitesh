package com.smartbiz.sakhistore.modules.auth.sellerauth.dto;

public class SellerAuthResponse {
    private String token;
    private Long userId;
    private String fullName;
    private String phone;
    private String email;
    private String storeCategory;

    // Constructors
    public SellerAuthResponse() {
    }

    public SellerAuthResponse(String token, Long userId, String fullName, String phone) {
        this.token = token;
        this.userId = userId;
        this.fullName = fullName;
        this.phone = phone;
    }

    public SellerAuthResponse(String token, Long userId, String fullName, String phone, String email,
            String storeCategory) {
        this.token = token;
        this.userId = userId;
        this.fullName = fullName;
        this.phone = phone;
        this.email = email;
        this.storeCategory = storeCategory;
    }

    // Getters and Setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
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
}
