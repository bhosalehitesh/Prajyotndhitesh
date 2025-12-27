package com.smartbiz.sakhistore.modules.pincode.model;

import java.util.List;

import lombok.Data;

@Data
public class PostOfficeResponse {
    private String Status;
    private List<PostOffice> PostOffice;

    @Data
    public static class PostOffice {
        private String Name;
        private String Description;
        private String BranchType;
        private String DeliveryStatus;
        private String Circle;
        private String District;
        private String Division;
        private String Region;
        private String State;
        private String Country;
        private String Pincode;
        private String Taluk;
        private String Block;
		public String getName() {
			return Name;
		}
		public void setName(String name) {
			Name = name;
		}
		public String getDescription() {
			return Description;
		}
		public void setDescription(String description) {
			Description = description;
		}
		public String getBranchType() {
			return BranchType;
		}
		public void setBranchType(String branchType) {
			BranchType = branchType;
		}
		public String getDeliveryStatus() {
			return DeliveryStatus;
		}
		public void setDeliveryStatus(String deliveryStatus) {
			DeliveryStatus = deliveryStatus;
		}
		public String getCircle() {
			return Circle;
		}
		public void setCircle(String circle) {
			Circle = circle;
		}
		public String getDistrict() {
			return District;
		}
		public void setDistrict(String district) {
			District = district;
		}
		public String getDivision() {
			return Division;
		}
		public void setDivision(String division) {
			Division = division;
		}
		public String getRegion() {
			return Region;
		}
		public void setRegion(String region) {
			Region = region;
		}
		public String getState() {
			return State;
		}
		public void setState(String state) {
			State = state;
		}
		public String getCountry() {
			return Country;
		}
		public void setCountry(String country) {
			Country = country;
		}
		public String getPincode() {
			return Pincode;
		}
		public void setPincode(String pincode) {
			Pincode = pincode;
		}
		public String getTaluk() {
			return Taluk;
		}
		public void setTaluk(String taluk) {
			Taluk = taluk;
		}
		public String getBlock() {
			return Block;
		}
		public void setBlock(String block) {
			Block = block;
		}
		public PostOffice(String name, String description, String branchType, String deliveryStatus, String circle,
				String district, String division, String region, String state, String country, String pincode,
				String taluk, String block) {
			super();
			Name = name;
			Description = description;
			BranchType = branchType;
			DeliveryStatus = deliveryStatus;
			Circle = circle;
			District = district;
			Division = division;
			Region = region;
			State = state;
			Country = country;
			Pincode = pincode;
			Taluk = taluk;
			Block = block;
		}
		public PostOffice() {
			super();
			// TODO Auto-generated constructor stub
		}
        
        
    }

	public String getStatus() {
		// TODO Auto-generated method stub
		return null;
	}

	public Object getPostOffice() {
		// TODO Auto-generated method stub
		return null;
	}
}

