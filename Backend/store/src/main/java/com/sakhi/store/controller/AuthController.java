package com.sakhi.store.controller;

import com.sakhi.store.dto.*;
import com.sakhi.store.model.User;
import com.sakhi.store.repository.UserRepository;
import com.sakhi.store.service.AuthService;
import com.sakhi.store.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtService jwtService;
    
    /**
     * Sign up endpoint
     * POST /api/auth/signup
     */
    @PostMapping(value = "/signup", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        try {
            // Validate input
            if (request.getFullName() == null || request.getFullName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Full name is required");
            }
            if (request.getPhone() == null || !request.getPhone().matches("\\d{10}")) {
                return ResponseEntity.badRequest().body("Valid 10-digit phone number is required");
            }
            if (request.getPassword() == null || request.getPassword().length() < 6) {
                return ResponseEntity.badRequest().body("Password must be at least 6 characters");
            }
            
            // Sign up user
            String otpCode = authService.signup(
                request.getFullName().trim(),
                request.getPhone(),
                request.getPassword()
            );
            
            // Return success message (OTP code included for dev mode)
            Map<String, String> response = new HashMap<>();
            response.put("message", "OTP sent successfully to " + request.getPhone() + 
                (otpCode != null ? " (for testing: " + otpCode + ")" : ""));
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An error occurred: " + e.getMessage());
        }
    }
    
    /**
     * Verify OTP endpoint
     * POST /api/auth/verify-otp
     */
    @PostMapping(value = "/verify-otp", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest request) {
        try {
            // Validate input
            if (request.getPhone() == null || !request.getPhone().matches("\\d{10}")) {
                return ResponseEntity.badRequest().body("Valid 10-digit phone number is required");
            }
            if (request.getCode() == null || !request.getCode().matches("\\d{6}")) {
                return ResponseEntity.badRequest().body("Valid 6-digit OTP code is required");
            }
            
            // Verify OTP
            boolean verified = authService.verifyOtp(request.getPhone(), request.getCode());
            
            if (verified) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "OTP verified successfully. User enabled!");
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body("Invalid or expired OTP");
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An error occurred: " + e.getMessage());
        }
    }
    
    /**
     * Login endpoint
     * POST /api/auth/login
     */
    @PostMapping(value = "/login", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        try {
            // Validate input
            if (request.getPhone() == null || !request.getPhone().matches("\\d{10}")) {
                return ResponseEntity.badRequest().build();
            }
            if (request.getPassword() == null || request.getPassword().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            // Login user
            String token = authService.login(request.getPhone(), request.getPassword());
            
            // Get user details
            Optional<User> userOptional = userRepository.findByPhone(request.getPhone());
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }
            
            User user = userOptional.get();
            
            // Return auth response
            AuthResponse response = new AuthResponse(
                token,
                user.getId(),
                user.getFullName(),
                user.getPhone()
            );
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Resend OTP endpoint
     * POST /api/auth/resend-otp
     */
    @PostMapping(value = "/resend-otp", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> resendOtp(@RequestBody Map<String, String> request) {
        try {
            String phone = request.get("phone");
            
            if (phone == null || !phone.matches("\\d{10}")) {
                return ResponseEntity.badRequest().body("Valid 10-digit phone number is required");
            }
            
            String otpCode = authService.resendOtp(phone);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "OTP resent successfully to " + phone + 
                (otpCode != null ? " (for testing: " + otpCode + ")" : ""));
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An error occurred: " + e.getMessage());
        }
    }
}

