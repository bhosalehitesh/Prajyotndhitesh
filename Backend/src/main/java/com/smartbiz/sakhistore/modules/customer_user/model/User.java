package com.smartbiz.sakhistore.modules.customer_user.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.smartbiz.sakhistore.modules.cart.model.WishlistItem;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, unique = true, length = 10)
    private String phone;

    private String email;

    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<WishlistItem> wishlistItems = new ArrayList<>();
    
    
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public boolean isWhatsappUpdates() {
        return whatsappUpdates;
    }

    public void setWhatsappUpdates(boolean whatsappUpdates) {
        this.whatsappUpdates = whatsappUpdates;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public String getFlatOrHouseNo() {
        return flatOrHouseNo;
    }

    public void setFlatOrHouseNo(String flatOrHouseNo) {
        this.flatOrHouseNo = flatOrHouseNo;
    }

    public String getAreaOrStreet() {
        return areaOrStreet;
    }

    public void setAreaOrStreet(String areaOrStreet) {
        this.areaOrStreet = areaOrStreet;
    }

    public String getLandmark() {
        return landmark;
    }

    public void setLandmark(String landmark) {
        this.landmark = landmark;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getAddressType() {
        return addressType;
    }

    public void setAddressType(String addressType) {
        this.addressType = addressType;
    }


    private boolean enabled = false; // User must verify OTP to enable account


    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;


    // Communication preferences
    private boolean whatsappUpdates = true;

    // Address details

    private String pincode;


    private String flatOrHouseNo; // Flat, House no, Building, Company, Apartment


    private String areaOrStreet; // Area, Street, Sector, Village

    private String landmark; // Optional

    private String city; // Town / City


    private String state; // State

    private String addressType; // e.g., Home, Work, Other


    // Constructors
    public User() {
    }



    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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



    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public User(Long id, String fullName, String phone, String email, List<WishlistItem> wishlistItems, boolean enabled,
			LocalDateTime createdAt, LocalDateTime updatedAt, boolean whatsappUpdates, String pincode,
			String flatOrHouseNo, String areaOrStreet, String landmark, String city, String state, String addressType) {
		super();
		this.id = id;
		this.fullName = fullName;
		this.phone = phone;
		this.email = email;
		this.wishlistItems = wishlistItems;
		this.enabled = enabled;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.whatsappUpdates = whatsappUpdates;
		this.pincode = pincode;
		this.flatOrHouseNo = flatOrHouseNo;
		this.areaOrStreet = areaOrStreet;
		this.landmark = landmark;
		this.city = city;
		this.state = state;
		this.addressType = addressType;
	}

	public List<WishlistItem> getWishlistItems() {
		return wishlistItems;
	}

	public void setWishlistItems(List<WishlistItem> wishlistItems) {
		this.wishlistItems = wishlistItems;
	}

	@PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}