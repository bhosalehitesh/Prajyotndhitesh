package com.smartbiz.sakhistore.modules.customer_user.dto;

public class UserLoginRequest {
    private String phone;
    private String password;

    // Constructors
    public UserLoginRequest() {
    }

    public UserLoginRequest(String phone, String password) {
        this.phone = phone;
        this.password = password;
    }

    // Getters and Setters
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
}