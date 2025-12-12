package com.smartbiz.sakhistore.modules.customer_user.dto;


public class UserVerifyOtpRequest {
    private String phone;
    private String code;
    private String fullName;

    // Constructors
   
    public UserVerifyOtpRequest(String phone, String code, String fullName) {
		super();
		this.phone = phone;
		this.code = code;
		this.fullName = fullName;
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

	public String getFullName() {
		return fullName;
	}

	public void setFullName(String fullName) {
		this.fullName = fullName;
	}
    
    
}