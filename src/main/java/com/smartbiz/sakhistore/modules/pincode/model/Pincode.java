package com.smartbiz.sakhistore.modules.pincode.model;

import jakarta.persistence.*; 
import lombok.*;

@Entity
@Data
@Builder
public class Pincode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String pincode;

    private String state;
    private String district;
    private String city;

    private String region; // West, South, East, North, Central, Northeast

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

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

	public Pincode(Long id, String pincode, String state, String district, String city, String region) {
		super();
		this.id = id;
		this.pincode = pincode;
		this.state = state;
		this.district = district;
		this.city = city;
		this.region = region;
	}

	public Pincode() {
		super();
	}
    
    
}
