package com.smartbiz.sakhistore.modules.pincode.DTOs;

import java.util.List;

import lombok.Data;

@Data
public class FallbackPincodeResponse {

    private String Status;
    public String getStatus() {
		return Status;
	}




	public void setStatus(String status) {
		Status = status;
	}




	public List<PostOfficeData> getPostOffice() {
		return PostOffice;
	}




	public void setPostOffice(List<PostOfficeData> postOffice) {
		PostOffice = postOffice;
	}




	private List<PostOfficeData> PostOffice;
    
    
    

    @Data
    public static class PostOfficeData {
        private String Name;
        private String BranchType;
        private String DeliveryStatus;
        private String Circle;
        private String District;
        private String Division;
        private String Region;
        private String State;
        private String Country;
        private String Taluk;
        private String Block;
		public String getName() {
			return Name;
		}
		public void setName(String name) {
			Name = name;
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
		public PostOfficeData(String name, String branchType, String deliveryStatus, String circle, String district,
				String division, String region, String state, String country, String taluk, String block) {
			super();
			Name = name;
			BranchType = branchType;
			DeliveryStatus = deliveryStatus;
			Circle = circle;
			District = district;
			Division = division;
			Region = region;
			State = state;
			Country = country;
			Taluk = taluk;
			Block = block;
		}
		public PostOfficeData() {
			super();
		}
        
        
    }
}
