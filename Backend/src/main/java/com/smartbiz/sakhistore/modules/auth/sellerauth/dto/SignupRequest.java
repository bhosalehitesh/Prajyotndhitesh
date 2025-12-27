package com.smartbiz.sakhistore.modules.auth.sellerauth.dto;

public class SignupRequest {
    private String fullName;
    private String phone;
    private String password;

    // Constructors
    public SignupRequest() {
    }

    public SignupRequest(String fullName, String phone, String password) {
        this.fullName = fullName;
        this.phone = phone;
        this.password = password;
    }

    // Getters and Setters
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
}