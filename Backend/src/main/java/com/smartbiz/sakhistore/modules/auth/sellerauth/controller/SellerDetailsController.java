package com.smartbiz.sakhistore.modules.auth.sellerauth.controller;

import java.util.HashMap;

import java.util.List;
import java.util.Map;

import com.smartbiz.sakhistore.modules.auth.sellerauth.dto.*;
import com.smartbiz.sakhistore.modules.auth.sellerauth.service.SellerDetailsService;
import com.smartbiz.sakhistore.modules.seller.service.SellerDetailsService1;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.smartbiz.sakhistore.modules.auth.sellerauth.model.SellerDetails;
import com.smartbiz.sakhistore.modules.auth.sellerauth.repository.SellerDetailsRepo;
import com.smartbiz.sakhistore.modules.auth.sellerauth.model.SignupRequest;
import com.smartbiz.sakhistore.modules.auth.sellerauth.service.JwtService;

@RestController
@RequestMapping("/api/sellers")
public class SellerDetailsController {

    @Autowired
    private SellerDetailsService1 sellerDetailsService;

    @Autowired
    private SellerDetailsService authService;

    @Autowired
    private SellerDetailsRepo userRepository;

    @Autowired
    private JwtService jwtService;

    // CRUD
    @GetMapping("/allSellers")
    public List<SellerDetails> allSellers() {
        return sellerDetailsService.allSellers();
    }

    @PostMapping("/editSeller")
    public SellerDetails editSeller(@RequestBody SellerDetails seller) {
        return sellerDetailsService.addSeller(seller);
    }

    @GetMapping("/{sellerId}")
    public SellerDetails getSeller(@PathVariable Long sellerId) {
        return sellerDetailsService.findByIdSD(sellerId);
    }

    @DeleteMapping("/deleteSeller/{id}")
    public ResponseEntity<String> deleteSeller(@PathVariable Long id) {
        sellerDetailsService.deleteSeller(id);
        return ResponseEntity.ok("Seller deleted successfully");
    }

    // SIGNUP -> sends OTP
    @PostMapping(value = "/signup-seller", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> signup(@RequestBody SignupRequest req) {
        try {
            if (req == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Request body is required"));
            }
            if (req.getFullName() == null || req.getFullName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Full name is required"));
            }
            if (req.getPhone() == null || req.getPhone().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Phone number is required"));
            }
            if (req.getPassword() == null || req.getPassword().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Password is required"));
            }
            
            String otp = authService.signup(req.getFullName(), req.getPhone(), req.getPassword());
            return ResponseEntity.ok(Map.of("message","OTP sent","otp",otp));
        } catch (RuntimeException ex) {
            String message = ex.getMessage();
            if (message == null || message.isEmpty()) {
                message = "Signup failed";
            }
            // Log the exception for debugging
            System.err.println("Signup error: " + ex.getClass().getName() + " - " + message);
            ex.printStackTrace();
            return ResponseEntity.status(400).body(Map.of("message", message));
        } catch (Exception ex) {
            // Log the exception for debugging
            System.err.println("Signup unexpected error: " + ex.getClass().getName() + " - " + ex.getMessage());
            ex.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Internal server error: " + ex.getMessage()));
        }
    }

    // VERIFY signup OTP -> create token & return
    // VERIFY signup OTP -> create token & return
    @PostMapping(value = "/verify-otp-seller", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest req) {
        String token = authService.verifyOtpAndCreateToken(req.getPhone(), req.getCode());
        if (token == null) return ResponseEntity.badRequest().body("Invalid/Expired OTP");
        var seller = userRepository.findByPhone(req.getPhone()).get();
        Map<String,Object> res = new HashMap<>();
        res.put("message","OTP verified and token created");
        res.put("token", token);
        res.put("sellerId", seller.getSellerId());
        res.put("fullName", seller.getFullName());
        res.put("phone", seller.getPhone());
        return ResponseEntity.ok(res);
    }

    // LOGIN (returns token)
    @PostMapping(value = "/login-seller", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        try {
            if (req == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Request body is required"));
            }
            if (req.getPhone() == null || req.getPhone().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Phone number is required"));
            }
            if (req.getPassword() == null || req.getPassword().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Password is required"));
            }
            
            String token = authService.login(req.getPhone(), req.getPassword());
            var sellerOpt = userRepository.findByPhone(req.getPhone());
            if (!sellerOpt.isPresent()) {
                return ResponseEntity.status(400).body(Map.of("message", "Seller not found"));
            }
            var seller = sellerOpt.get();
            
            return ResponseEntity.ok(new SellerAuthResponse(token, seller.getSellerId(), seller.getFullName(), seller.getPhone()));
        } catch (RuntimeException ex) {
            String message = ex.getMessage();
            if (message == null || message.isEmpty()) {
                message = "Login failed";
            }
            // Log the exception for debugging
            System.err.println("Login error: " + ex.getClass().getName() + " - " + message);
            ex.printStackTrace();
            return ResponseEntity.status(400).body(Map.of("message", message));
        } catch (Exception ex) {
            // Log the exception for debugging
            System.err.println("Login unexpected error: " + ex.getClass().getName() + " - " + ex.getMessage());
            ex.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Internal server error: " + ex.getMessage()));
        }
    }

    // RESEND signup OTP
    @PostMapping("/resend-otp-seller")
    public ResponseEntity<?> resendOtp(@RequestBody PhoneRequest req) {
        String otp = authService.resendOtp(req.getPhone());
        return ResponseEntity.ok(Map.of("message","OTP resent","otp",otp));
    }

    // FORGOT — send OTP
    @PostMapping("/forgot-password-seller")
    public ResponseEntity<?> forgotPassword(@RequestBody PhoneRequest req) {
        String otp = authService.sendForgotPasswordOtp(req.getPhone());
        return ResponseEntity.ok(Map.of("message","Forgot password OTP sent","otp",otp));
    }

    // VERIFY forgot OTP (just verification to allow reset)
    @PostMapping("/verify-forgot-otp-seller")
    public ResponseEntity<?> verifyForgotOtp(@RequestBody VerifyOtpRequest req) {
        boolean ok = authService.verifyForgotPasswordOtp(req.getPhone(), req.getCode());
        if (!ok) return ResponseEntity.badRequest().body("Invalid/Expired OTP");
        return ResponseEntity.ok(Map.of("message","OTP verified. You may reset password."));
    }

    // RESET password -> create token & return
    @PostMapping("/reset-password-seller")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest req) {
        String newToken = authService.resetPasswordAndCreateToken(req.getPhone(), req.getNewPassword());
        var seller = userRepository.findByPhone(req.getPhone()).get();
        return ResponseEntity.ok(new SellerAuthResponse(newToken, seller.getSellerId(), seller.getFullName(), seller.getPhone()));
    }

    // LOGIN OTP: send OTP for login
    @PostMapping("/login-otp-seller")
    public ResponseEntity<?> sendLoginOtp(@RequestBody PhoneRequest req) {
        try {
            String otp = authService.sendLoginOtp(req.getPhone());
            return ResponseEntity.ok(Map.of("message", "Login OTP sent", "otp", otp));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(400).body(Map.of("message", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("message", "Internal server error: " + ex.getMessage()));
        }
    }

    // LOGIN OTP: verify OTP and return token
    @PostMapping("/verify-login-otp-seller")
    public ResponseEntity<?> verifyLoginOtp(@RequestBody VerifyOtpRequest req) {
        try {
            String token = authService.verifyLoginOtpAndCreateToken(req.getPhone(), req.getCode());
            if (token == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid/Expired OTP"));
            }
            var sellerOpt = userRepository.findByPhone(req.getPhone());
            if (!sellerOpt.isPresent()) {
                return ResponseEntity.status(400).body(Map.of("message", "Seller not found"));
            }
            var seller = sellerOpt.get();
            return ResponseEntity.ok(new SellerAuthResponse(token, seller.getSellerId(), seller.getFullName(), seller.getPhone()));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(400).body(Map.of("message", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("message", "Internal server error: " + ex.getMessage()));
        }
    }

    // LOGOUT
    @PostMapping("/logout-seller")
    public ResponseEntity<?> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return ResponseEntity.badRequest().body("Invalid token");
        String token = authHeader.substring(7);
        authService.logout(token);
        return ResponseEntity.ok(Map.of("message","Logout successful"));
    }

}