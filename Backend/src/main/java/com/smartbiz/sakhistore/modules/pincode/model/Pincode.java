package com.smartbiz.sakhistore.modules.pincode.model;

import jakarta.persistence.*;

@Entity
@Table(name = "pincodes", indexes = {
    @Index(name = "idx_pincode", columnList = "pincode"),
    @Index(name = "idx_state", columnList = "state"),
    @Index(name = "idx_district", columnList = "district"),
    @Index(name = "idx_city", columnList = "city")
})
public class Pincode {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = false)
    private String pincode;
    
    @Column(nullable = false)
    private String state;
    
    @Column(nullable = false)
    private String district;
    
    @Column(nullable = false)
    private String city;
    
    @Column(name = "taluka")
    private String taluka;
    
    @Column(name = "division")
    private String division;
    
    @Column(name = "region")
    private String region;
    
    // Getters and Setters
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
    
    public String getTaluka() {
        return taluka;
    }
    
    public void setTaluka(String taluka) {
        this.taluka = taluka;
    }
    
    public String getDivision() {
        return division;
    }
    
    public void setDivision(String division) {
        this.division = division;
    }
    
    public String getRegion() {
        return region;
    }
    
    public void setRegion(String region) {
        this.region = region;
    }
}


