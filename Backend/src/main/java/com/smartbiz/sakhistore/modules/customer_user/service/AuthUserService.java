package com.smartbiz.sakhistore.modules.customer_user.service;

import com.smartbiz.sakhistore.modules.customer_user.dto.UserAuthResponse;
import com.smartbiz.sakhistore.modules.customer_user.model.User;
import com.smartbiz.sakhistore.modules.customer_user.repository.UserRepository;
import com.smartbiz.sakhistore.modules.customer_user.repository.UserTokenRepository;
import com.smartbiz.sakhistore.modules.otp.model.Otp;
import com.smartbiz.sakhistore.modules.otp.model.OtpGenerator;
import com.smartbiz.sakhistore.modules.otp.repository.SellerOtpRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthUserService {

    // ⭐ ThreadLocal to capture fullName from controller
    public static ThreadLocal<String> USER_FULLNAME = new ThreadLocal<>();

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private SellerOtpRepository otpRepo;

    @Autowired
    private UserTokenRepository tokenRepo;

    @Autowired
    private JwtServiceUser userJwtService;

    @Autowired
    private EmailService emailService;

    // ===========================================================
    // ⭐ SEND OTP — User Login (No Password)
    // ===========================================================
    public String sendOtp(String phone) {

        String otpCode = OtpGenerator.generateOtp();

        otpRepo.save(new Otp(phone, otpCode));

        System.out.println("OTP Sent to USER: " + phone + " OTP: " + otpCode);

        return otpCode; // for testing (remove in production)
    }

    // ===========================================================
    // ⭐ VERIFY OTP — Login / Auto Signup
    // ===========================================================
    public UserAuthResponse verifyOtp(String phone, String otpInput) {

        Otp otp = otpRepo.findTopByPhoneOrderByIdDesc(phone);

        if (otp == null)
            throw new RuntimeException("OTP not found");

        if (otp.isExpired())
            throw new RuntimeException("OTP expired");

        if (!otp.getCode().equals(otpInput))
            throw new RuntimeException("Invalid OTP");

        otp.setVerified(true);
        otpRepo.save(otp);

        // find existing user
        User user = userRepo.findByPhone(phone).orElse(null);
        boolean isNewUser = false;

        if (user == null) {

            // ⭐ retrieve frontend fullName
            String fullName = USER_FULLNAME.get();

            if (fullName == null || fullName.trim().isEmpty()) {
                throw new RuntimeException("Full name is required for new user registration");
            }

            user = new User();
            user.setPhone(phone);
            user.setFullName(fullName); // ⭐ name from frontend
            user.setEnabled(true);
            user.setCreatedAt(LocalDateTime.now());

            userRepo.save(user);
            isNewUser = true;
        }

        // Send welcome email (optional)
        if (isNewUser && user.getEmail() != null) {
            try {
                emailService.sendWelcomeEmail(
                        user.getEmail(),
                        user.getFullName(),
                        user.getPhone()
                );
            } catch (Exception e) {
                System.out.println("Welcome Email Failed: " + e.getMessage());
            }
        }

        // Revoke old tokens
        tokenRepo.revokeAllTokensByUser(user);

        // Generate JWT token
        String token = userJwtService.generateToken(user);
        userJwtService.saveUserToken(token, user);

        return new UserAuthResponse(
                token,
                user.getId(),
                user.getFullName(),
                user.getPhone()
        );
    }

    
    public User updateUserName(Long id, String fullName) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFullName(fullName);
        return userRepo.save(user);
    }

	
}