//package com.sakhi.store.dto;
//
//import jakarta.validation.constraints.NotBlank;
//import jakarta.validation.constraints.Pattern;
//import jakarta.validation.constraints.Size;
//
//public class SignupRequest {
//    @NotBlank
//    @Size(max = 200)
//    private String fullName;
//
//    @NotBlank
//    @Size(max = 20)
//    private String phone;
//
//    @NotBlank
//    @Size(min = 8, max = 128)
//    private String password;
//
//    // getters/setters
//    public String getFullName() { return fullName; }
//    public void setFullName(String fullName) { this.fullName = fullName; }
//
//    public String getPhone() { return phone; }
//    public void setPhone(String phone) { this.phone = phone; }
//
//    public String getPassword() { return password; }
//    public void setPassword(String password) { this.password = password; }
//}

package com.sakhi.store.dto;

public class SignupRequest {
    private String fullName;
    private String phone;
    private String password;

    // getters & setters
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
