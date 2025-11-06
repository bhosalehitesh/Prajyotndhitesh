//package com.sakhi.store.controller;
//
//import com.sakhi.store.dto.SignupRequest;
//import com.sakhi.store.dto.VerifyOtpRequest;
//import com.sakhi.store.dto.AuthResponse;
//import com.sakhi.store.service.UserService;
//import com.sakhi.store.service.OtpService;
//import com.sakhi.store.service.JwtService;
//import com.sakhi.store.service.SmsClient;
//import com.sakhi.store.model.User;
//import com.sakhi.store.model.Otp;
//import com.sakhi.store.exception.BadRequestException;
//
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//import jakarta.validation.Valid;
//
//@RestController
//@RequestMapping("/auth")
//public class AuthController {
//
//    private final UserService userService;
//    private final OtpService otpService;
//    private final JwtService jwtService;
//    private final SmsClient smsClient;
//
//    public AuthController(UserService userService, OtpService otpService, JwtService jwtService, SmsClient smsClient) {
//        this.userService = userService;
//        this.otpService = otpService;
//        this.jwtService = jwtService;
//        this.smsClient = smsClient;
//    }
//
//    // 1️⃣ SIGNUP
//    @PostMapping("/signup")
//    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
//        User user = userService.createPendingUser(request.getFullName(), request.getPhone(), request.getPassword());
//        Otp otp = otpService.createOtpForPhone(request.getPhone());
//
//        // Send OTP via SMS (mock)
//        smsClient.sendOtp(request.getPhone(), otp.getCode());
//
//        return ResponseEntity.ok().body(
//                "OTP sent successfully to " + maskPhone(request.getPhone())
//        );
//    }
//
//    // 2️⃣ VERIFY OTP
//    @PostMapping("/verify-otp")
//    public ResponseEntity<AuthResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
//        Otp verifiedOtp = otpService.verifyOtp(request.getPhone(), request.getCode());
//
//        User user = userService.findByPhone(request.getPhone())
//                .orElseThrow(() -> new BadRequestException("User not found"));
//
//        userService.activateUser(user);
//
//        String token = jwtService.generateToken(user.getPhone(), user.getId(), user.getRoles());
//
//        AuthResponse response = new AuthResponse(token, user.getId(), user.getFullName(), user.getPhone());
//        return ResponseEntity.ok(response);
//    }
//
//    private String maskPhone(String phone) {
//        if (phone.length() <= 4) return "****";
//        return "******" + phone.substring(phone.length() - 4);
//    }
//}
package com.sakhi.store.controller;

import com.sakhi.store.dto.AuthResponse;
import com.sakhi.store.dto.LoginRequest;
import com.sakhi.store.dto.SignupRequest;
import com.sakhi.store.dto.VerifyOtpRequest;
import com.sakhi.store.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest req) {
        String otp = authService.signupAndSendOtp(req);
        return ResponseEntity.ok().body(
                String.format("OTP sent successfully to %s (for testing: %s)", req.getPhone(), otp)
        );
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest req) {
        authService.verifyOtp(req);
        return ResponseEntity.ok("OTP verified successfully. User enabled!");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        AuthResponse response = authService.login(req);
        return ResponseEntity.ok(response);
    }
}
