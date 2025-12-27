package com.smartbiz.sakhistore.modules.pincode.DTOs;

import java.util.List;

public class PostOfficeResponse {

    private String Status;
    private String Message;
    private List<PostOffice> PostOffice;

    // ===========================
    //       GETTERS / SETTERS
    // ===========================

    public String getStatus() {
        return Status;
    }

    public void setStatus(String status) {
        Status = status;
    }

    public String getMessage() {
        return Message;
    }

    public void setMessage(String message) {
        Message = message;
    }

    public List<PostOffice> getPostOffice() {
        return PostOffice;
    }

    public void setPostOffice(List<PostOffice> postOffice) {
        PostOffice = postOffice;
    }

    // ===========================
    //       CONSTRUCTORS
    // ===========================

    public PostOfficeResponse() {}

    public PostOfficeResponse(String status, String message, List<PostOffice> postOffice) {
        this.Status = status;
        this.Message = message;
        this.PostOffice = postOffice;
    }

    // ===========================
    //       INNER CLASS
    // ===========================

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

        // ===========================
        //       GETTERS / SETTERS
        // ===========================

        public String getName() { return Name; }
        public void setName(String name) { Name = name; }

        public String getDescription() { return Description; }
        public void setDescription(String description) { Description = description; }

        public String getBranchType() { return BranchType; }
        public void setBranchType(String branchType) { BranchType = branchType; }

        public String getDeliveryStatus() { return DeliveryStatus; }
        public void setDeliveryStatus(String deliveryStatus) { DeliveryStatus = deliveryStatus; }

        public String getCircle() { return Circle; }
        public void setCircle(String circle) { Circle = circle; }

        public String getDistrict() { return District; }
        public void setDistrict(String district) { District = district; }

        public String getDivision() { return Division; }
        public void setDivision(String division) { Division = division; }

        public String getRegion() { return Region; }
        public void setRegion(String region) { Region = region; }

        public String getState() { return State; }
        public void setState(String state) { State = state; }

        public String getCountry() { return Country; }
        public void setCountry(String country) { Country = country; }

        public String getPincode() { return Pincode; }
        public void setPincode(String pincode) { Pincode = pincode; }

        public String getTaluk() { return Taluk; }
        public void setTaluk(String taluk) { Taluk = taluk; }

        public String getBlock() { return Block; }
        public void setBlock(String block) { Block = block; }

        // ===========================
        //       CONSTRUCTORS
        // ===========================

        public PostOffice() {}

        public PostOffice(String name, String description, String branchType, String deliveryStatus,
                          String circle, String district, String division, String region, String state,
                          String country, String pincode, String taluk, String block) {

            this.Name = name;
            this.Description = description;
            this.BranchType = branchType;
            this.DeliveryStatus = deliveryStatus;
            this.Circle = circle;
            this.District = district;
            this.Division = division;
            this.Region = region;
            this.State = state;
            this.Country = country;
            this.Pincode = pincode;
            this.Taluk = taluk;
            this.Block = block;
        }
    }
}
