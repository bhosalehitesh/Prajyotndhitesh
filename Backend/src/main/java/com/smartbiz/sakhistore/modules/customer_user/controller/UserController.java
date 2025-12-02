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

        UserAuthResponse res = authService.verifyOtp(
                request.getPhone(),
                request.getCode()
        );

        return ResponseEntity.ok(res);
    }


    // ======================================================
    // ⭐ VERIFY OTP (Alternate Version)
    // ======================================================
    @PostMapping("/verify-otp1")
    public ResponseEntity<UserAuthResponse> verifyOtp1(@RequestBody UserVerifyOtpRequest request) {

        UserAuthResponse res = authService.verifyOtp1(
                request.getPhone(),
                request.getCode()
        );

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
}