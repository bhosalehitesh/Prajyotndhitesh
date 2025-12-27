package com.smartbiz.sakhistore.modules.pincode.DTOs;

import lombok.*;

@Data
public class PincodeResponseDTO {
    private String pincode;
    private String state;
    private String district;
    private String city;
    private String region;
	public String getPincode() {
		return pincode;
	}
	public void setPincode(String pincode) {
		this.pincode = pincode;
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
	public String getRegion() {
		return region;
	}
	public void setRegion(String region) {
		this.region = region;
	}
	public PincodeResponseDTO(String pincode, String state, String district, String city, String region) {
		super();
		this.pincode = pincode;
		this.state = state;
		this.district = district;
		this.city = city;
		this.region = region;
	}
	public PincodeResponseDTO() {
		super();
	}
    
    
}
