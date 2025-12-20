package com.smartbiz.sakhistore.modules.customer_user.controller;

import com.smartbiz.sakhistore.modules.customer_user.dto.UserAuthResponse;
import com.smartbiz.sakhistore.modules.customer_user.dto.UserSendOtpRequest;
import com.smartbiz.sakhistore.modules.customer_user.dto.UserVerifyOtpRequest;
import com.smartbiz.sakhistore.modules.customer_user.model.User;
import com.smartbiz.sakhistore.modules.customer_user.model.UserToken;
import com.smartbiz.sakhistore.modules.customer_user.repository.UserTokenRepository;
import com.smartbiz.sakhistore.modules.customer_user.service.AuthUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin("*")
public class UserController {

    @Autowired
    private AuthUserService authService;

    @Autowired
    private UserTokenRepository tokenRepo;

    @Autowired
    private AuthUserService authUserService;


    // ======================================================
    // ⭐ SEND OTP
    // ======================================================
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody UserSendOtpRequest request) {

        String otp = authService.sendOtp(request.getPhone());

        return ResponseEntity.ok(Map.of(
                "message", "OTP sent successfully",
                "otp", otp   // keep for testing
        ));
    }


    // ======================================================
    // ⭐ VERIFY OTP → Login/Register + Generate JWT
    // ======================================================
    @PostMapping("/verify-otp")
    public ResponseEntity<UserAuthResponse> verifyOtp(@RequestBody UserVerifyOtpRequest request) {

        // ⭐ Pass fullName to service using ThreadLocal
        AuthUserService.USER_FULLNAME.set(request.getFullName());

        UserAuthResponse res = authService.verifyOtp(
                request.getPhone(),
                request.getCode()
        );

        // ⭐ Clear after use
        AuthUserService.USER_FULLNAME.remove();

        return ResponseEntity.ok(res);
    }


    // ======================================================
    // ⭐ VERIFY OTP (Alternate Version)
    // ======================================================
    @PostMapping("/verify-otp1")
    public ResponseEntity<UserAuthResponse> verifyOtp1(@RequestBody UserVerifyOtpRequest request) {

        // ⭐ Pass fullName to service for verifyOtp1 as well
        AuthUserService.USER_FULLNAME.set(request.getFullName());

        UserAuthResponse res = authService.verifyOtp(
                request.getPhone(),
                request.getCode()
        );

        // ⭐ Clear after use
        AuthUserService.USER_FULLNAME.remove();

        return ResponseEntity.ok(res);
    }


    // ======================================================
    // ⭐ LOGOUT (Revoke JWT Token)
    // ======================================================
    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestHeader("Authorization") String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body("Invalid token format");
        }

        String token = authHeader.substring(7);

        UserToken dbToken = tokenRepo.findByToken(token);
        if (dbToken == null) {
            return ResponseEntity.badRequest().body("Token not found");
        }

        dbToken.setExpired(true);
        dbToken.setRevoked(true);
        tokenRepo.save(dbToken);

        return ResponseEntity.ok("Logged out successfully");
    }


    // ======================================================
    // ⭐ UPDATE USER NAME
    // ======================================================
    @PutMapping("/update-username/{id}")
    public ResponseEntity<?> updateUserName(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String fullName = body.get("fullName");

        if (fullName == null || fullName.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Full name is required");
        }

        User updated = authUserService.updateUserName(id, fullName);

        return ResponseEntity.ok(updated);
    }

    // ======================================================
    // ⭐ UPDATE USER EMAIL
    // ======================================================
    @PutMapping("/update-email/{id}")
    public ResponseEntity<?> updateUserEmail(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        try {
            String email = body.get("email");
            
            System.out.println("\n" + "=".repeat(60));
            System.out.println("📧 UPDATE USER EMAIL REQUEST");
            System.out.println("=".repeat(60));
            System.out.println("User ID: " + id);
            System.out.println("New Email: " + (email != null ? email : "NULL"));
            System.out.println("=".repeat(60) + "\n");

            User updated = authUserService.updateUserEmail(id, email);
            
            System.out.println("✅ Email updated successfully!");
            System.out.println("   User ID: " + updated.getId());
            System.out.println("   New Email: " + updated.getEmail());
            System.out.println("=".repeat(60) + "\n");

            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            System.err.println("❌ Error updating email: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ======================================================
    // ⭐ GET USER BY ID
    // ======================================================
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            User user = authUserService.getUserById(id);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ======================================================
    // ⭐ GET USER BY PHONE NUMBER
    // ======================================================
    @GetMapping("/phone/{phone}")
    public ResponseEntity<?> getUserByPhone(@PathVariable String phone) {
        try {
            User user = authUserService.getUserByPhone(phone);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ======================================================
    // ⭐ UPDATE USER ADDRESS
    // ======================================================
    @PutMapping("/update-address/{id}")
    public ResponseEntity<?> updateUserAddress(
            @PathVariable Long id,
            @RequestBody Map<String, Object> addressData) {

        try {
            User updated = authUserService.updateUserAddress(id, addressData);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ======================================================
    // ⭐ UPDATE USER ADDRESS BY PHONE NUMBER
    // ======================================================
    @PutMapping("/update-address-by-phone/{phone}")
    public ResponseEntity<?> updateUserAddressByPhone(
            @PathVariable String phone,
            @RequestBody Map<String, Object> addressData) {

        System.out.println("\n" + "=".repeat(60));
        System.out.println("📝 UPDATE USER ADDRESS BY PHONE REQUEST");
        System.out.println("=".repeat(60));
        System.out.println("Phone: " + phone);
        System.out.println("Address Data Keys: " + addressData.keySet());
        if (addressData.containsKey("email")) {
            Object emailObj = addressData.get("email");
            String emailStr = emailObj != null ? emailObj.toString() : null;
            System.out.println("📧 Email in request: " + (emailStr != null ? emailStr : "NULL"));
            System.out.println("📧 Email type: " + (emailObj != null ? emailObj.getClass().getSimpleName() : "NULL"));
        } else {
            System.out.println("⚠️ No email field in request!");
        }
        System.out.println("=".repeat(60) + "\n");

        try {
            User updated = authUserService.updateUserAddressByPhone(phone, addressData);
            
            // Verify email was actually saved by fetching fresh from database
            System.out.println("\n" + "=".repeat(60));
            System.out.println("🔍 VERIFYING EMAIL SAVE IN DATABASE");
            System.out.println("=".repeat(60));
            try {
                User verifiedUser = authUserService.getUserById(updated.getId());
                System.out.println("   User ID: " + verifiedUser.getId());
                System.out.println("   Email in response object: " + (updated.getEmail() != null ? updated.getEmail() : "NULL"));
                System.out.println("   Email in database (verified): " + (verifiedUser.getEmail() != null ? verifiedUser.getEmail() : "NULL"));
                
                if (verifiedUser.getEmail() != null && !verifiedUser.getEmail().trim().isEmpty()) {
                    System.out.println("   ✅ Email successfully saved and verified in database!");
                } else {
                    System.out.println("   ⚠️ Email is NULL in database - may need to check save operation");
                }
            } catch (Exception verifyError) {
                System.err.println("   ⚠️ Could not verify email in database: " + verifyError.getMessage());
            }
            System.out.println("=".repeat(60) + "\n");
            
            System.out.println("✅ [UserController] User updated successfully");
            System.out.println("   User ID: " + updated.getId());
            System.out.println("   Phone: " + updated.getPhone());
            System.out.println("   Email in response: " + (updated.getEmail() != null ? updated.getEmail() : "NULL"));
            System.out.println("=".repeat(60) + "\n");
            
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            System.err.println("❌ [UserController] Error updating user: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ======================================================
    // ⭐ VERIFY USER EMAIL IN DATABASE (DEBUG ENDPOINT)
    // ======================================================
    @GetMapping("/verify-email/{id}")
    public ResponseEntity<?> verifyUserEmail(@PathVariable Long id) {
        try {
            User user = authUserService.getUserById(id);
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("userId", id);
            response.put("email", user.getEmail());
            response.put("emailExists", user.getEmail() != null && !user.getEmail().trim().isEmpty());
            response.put("phone", user.getPhone());
            response.put("fullName", user.getFullName());
            
            System.out.println("\n" + "=".repeat(60));
            System.out.println("🔍 EMAIL VERIFICATION FOR USER");
            System.out.println("=".repeat(60));
            System.out.println("User ID: " + id);
            System.out.println("Email in DB: " + (user.getEmail() != null ? user.getEmail() : "NULL"));
            System.out.println("Email exists: " + (user.getEmail() != null && !user.getEmail().trim().isEmpty()));
            System.out.println("=".repeat(60) + "\n");
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}