package com.smartbiz.sakhistore.modules.customer_user.dto;

public class UserAuthResponse {
    private String token;
    private Long userId;
    private String fullName;
    private String phone;

    // Constructors
    public UserAuthResponse() {
    }

    public UserAuthResponse(String token, Long userId, String fullName, String phone) {
        this.token = token;
        this.userId = userId;
        this.fullName = fullName;
        this.phone = phone;
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
}
