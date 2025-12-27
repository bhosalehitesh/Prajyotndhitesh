package com.smartbiz.sakhistore.modules.auth.sellerauth.dto;

public class VerifyOtpRequest {
    private String phone;
    private String code;

    // Constructors
    public VerifyOtpRequest() {
    }

    public VerifyOtpRequest(String phone, String code) {
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
