package com.smartbiz.sakhistore.modules.pincode.DTOs;


import lombok.*;

@Data
public class CityValidationDTO {
    private boolean valid;
    private String state;
    private String district;
    private String city;
    private String message;
	public boolean isValid() {
		return valid;
	}
	public void setValid(boolean valid) {
		this.valid = valid;
	}
	public String getState() {
		return state;
	}
	public void setState(String state) {
		this.state = state;
	}
	public String getDistrict() {
		return district;
	}
	public void setDistrict(String district) {
		this.district = district;
	}
	public String getCity() {
		return city;
	}
	public void setCity(String city) {
		this.city = city;
	}
	public String getMessage() {
		return message;
	}
	public void setMessage(String message) {
		this.message = message;
	}
	public CityValidationDTO(boolean valid, String state, String district, String city, String message) {
		super();
		this.valid = valid;
		this.state = state;
		this.district = district;
		this.city = city;
		this.message = message;
	}
	public CityValidationDTO() {
		super();
		// TODO Auto-generated constructor stub
	}
    
    
    
}
