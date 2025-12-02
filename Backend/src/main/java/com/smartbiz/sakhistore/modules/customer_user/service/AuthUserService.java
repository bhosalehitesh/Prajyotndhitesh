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

        // find user OR auto-register
        User user = userRepo.findByPhone(phone).orElse(null);

        boolean isNewUser = false;

        if (user == null) {
            user = new User();
            user.setPhone(phone);
            user.setFullName("New User");
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

        // Generate new JWT
        String token = userJwtService.generateToken(user);
        userJwtService.saveUserToken(token, user);

        return new UserAuthResponse(
                token,
                user.getId(),
                user.getFullName(),
                user.getPhone()
        );
    }

    // ===========================================================
    // ⭐ ALTERNATE VERIFY OTP METHOD (if needed)
    // ===========================================================
    public UserAuthResponse verifyOtp1(String phone, String otpInput) {

        Otp otp = otpRepo.findTopByPhoneOrderByIdDesc(phone);

        if (otp == null)
            throw new RuntimeException("OTP not found");

        if (otp.isExpired())
            throw new RuntimeException("OTP expired");

        if (!otp.getCode().equals(otpInput)) {
            otp.incrementAttempts();
            otpRepo.save(otp);
            throw new RuntimeException("Invalid OTP");
        }

        otp.setVerified(true);
        otpRepo.save(otp);

        User user = userRepo.findByPhone(phone).orElse(null);
        boolean isNewUser = false;

        if (user == null) {
            user = new User();
            user.setPhone(phone);
            user.setFullName("New User");
            user.setEnabled(true);
            userRepo.save(user);
            isNewUser = true;
        }

        if (isNewUser && user.getEmail() != null) {
            try {
                emailService.sendWelcomeEmail(user.getEmail(), user.getFullName(), user.getPhone());
            } catch (Exception e) {
                System.out.println("Welcome email failed: " + e.getMessage());
            }
        }

        tokenRepo.revokeAllTokensByUser(user);

        String token = userJwtService.generateToken(user);
        userJwtService.saveUserToken(token, user);

        return new UserAuthResponse(
                token,
                user.getId(),
                user.getFullName(),
                user.getPhone()
        );
    }
    // ➤ Update Username by ID
    public User updateUserName(Long id, String fullName) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFullName(fullName);
        return userRepo.save(user);
    }
}

