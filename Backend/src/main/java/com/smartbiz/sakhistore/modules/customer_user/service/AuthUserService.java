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

    // ===========================================================
    // ⭐ GET USER BY ID
    // ===========================================================
    public User getUserById(Long id) {
        return userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ===========================================================
    // ⭐ UPDATE USER ADDRESS
    // ===========================================================
    public User updateUserAddress(Long id, java.util.Map<String, Object> addressData) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update full name if provided
        if (addressData.containsKey("fullName")) {
            user.setFullName((String) addressData.get("fullName"));
        }

        // Update phone if provided
        if (addressData.containsKey("phone")) {
            user.setPhone((String) addressData.get("phone"));
        }

        // Update email if provided
        if (addressData.containsKey("email")) {
            user.setEmail((String) addressData.get("email"));
        }

        // Update address fields
        if (addressData.containsKey("pincode")) {
            user.setPincode((String) addressData.get("pincode"));
        }

        if (addressData.containsKey("flatOrHouseNo")) {
            user.setFlatOrHouseNo((String) addressData.get("flatOrHouseNo"));
        }

        if (addressData.containsKey("areaOrStreet")) {
            user.setAreaOrStreet((String) addressData.get("areaOrStreet"));
        }

        if (addressData.containsKey("landmark")) {
            user.setLandmark((String) addressData.get("landmark"));
        }

        if (addressData.containsKey("city")) {
            user.setCity((String) addressData.get("city"));
        }

        if (addressData.containsKey("state")) {
            user.setState((String) addressData.get("state"));
        }

        if (addressData.containsKey("addressType")) {
            user.setAddressType((String) addressData.get("addressType"));
        }

        if (addressData.containsKey("whatsappUpdates")) {
            user.setWhatsappUpdates((Boolean) addressData.get("whatsappUpdates"));
        }

        return userRepo.save(user);
    }

	
}