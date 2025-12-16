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

        try {
            User updated = authUserService.updateUserAddressByPhone(phone, addressData);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}