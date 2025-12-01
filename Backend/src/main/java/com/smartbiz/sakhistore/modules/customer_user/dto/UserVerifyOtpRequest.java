package com.smartbiz.sakhistore.modules.customer_user.dto;


public class UserVerifyOtpRequest {
    private String phone;
    private String code;

    // Constructors
    public UserVerifyOtpRequest() {
    }

    public UserVerifyOtpRequest(String phone, String code) {
        this.phone = phone;
        this.code = code;
    }

    // Getters and Setters
    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}