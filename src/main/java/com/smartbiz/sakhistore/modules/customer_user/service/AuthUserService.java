package com.smartbiz.sakhistore.modules.customer_user.service;

import com.smartbiz.sakhistore.modules.customer_user.dto.UserAuthResponse;
import com.smartbiz.sakhistore.modules.customer_user.model.User;
import com.smartbiz.sakhistore.modules.customer_user.repository.UserRepository;
import com.smartbiz.sakhistore.modules.customer_user.repository.UserTokenRepository;
import com.smartbiz.sakhistore.modules.otp.model.Otp;
import com.smartbiz.sakhistore.modules.otp.model.OtpGenerator;
import com.smartbiz.sakhistore.modules.otp.repository.SellerOtpRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthUserService {

    private static final Logger logger = LoggerFactory.getLogger(AuthUserService.class);

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

        logger.info("OTP sent to user with phone: {}", phone);

        return otpCode;
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
                logger.warn("Failed to send welcome email to user {}: {}", user.getEmail(), e.getMessage());
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
    // ⭐ UPDATE USER EMAIL
    // ===========================================================
    public User updateUserEmail(Long id, String email) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Validate email format
        if (email != null && !email.trim().isEmpty()) {
            // ✅ UPDATED: More lenient email validation - allows:
            // 1. Standard emails: user@domain.com
            // 2. UPI IDs: phone@bank (e.g., 7820866099@ybl)
            // 3. Emails without TLD: user@domain (for internal systems)
            boolean isValidEmail = email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+(\\.[A-Za-z]{2,})?$");
            if (!isValidEmail) {
                throw new RuntimeException("Invalid email format: " + email);
            }
            user.setEmail(email.trim());
        } else {
            // Allow clearing email
            user.setEmail(null);
        }
        
        // Use saveAndFlush to ensure email is immediately persisted to database
        User savedUser = userRepo.saveAndFlush(user);
        logger.info("Email updated for user ID: {} to: {}", id, savedUser.getEmail());
        return savedUser;
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
            String newEmail = (String) addressData.get("email");
            String oldEmail = user.getEmail();
            
            // Handle null/empty email
            if (newEmail != null && !newEmail.trim().isEmpty()) {
                newEmail = newEmail.trim();
                // ✅ UPDATED: More lenient email validation - allows:
                // 1. Standard emails: user@domain.com
                // 2. UPI IDs: phone@bank (e.g., 7820866099@ybl)
                // 3. Emails without TLD: user@domain (for internal systems)
                boolean isValidEmail = newEmail.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+(\\.[A-Za-z]{2,})?$");
                if (!isValidEmail) {
                    logger.warn("Invalid email format: {}", newEmail);
                    throw new RuntimeException("Invalid email format: " + newEmail);
                }
                user.setEmail(newEmail);
                logger.info("Email updated for user ID: {}, old: {}, new: {}", user.getId(), oldEmail, newEmail);
            } else {
                // Allow clearing email (set to null)
                user.setEmail(null);
                logger.info("Email cleared for user ID: {}, old: {}", user.getId(), oldEmail);
            }
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

        User savedUser = userRepo.save(user);
        
        if (addressData.containsKey("email")) {
            logger.info("User saved to database - ID: {}, Phone: {}, Email: {}", 
                savedUser.getId(), savedUser.getPhone(), savedUser.getEmail());
        }
        
        return savedUser;
    }

    // ===========================================================
    // ⭐ GET USER BY PHONE NUMBER
    // ===========================================================
    public User getUserByPhone(String phone) {
        return userRepo.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("User not found with phone: " + phone));
    }

    // ===========================================================
    // ⭐ UPDATE USER ADDRESS BY PHONE NUMBER
    // ===========================================================
    public User updateUserAddressByPhone(String phone, java.util.Map<String, Object> addressData) {
        User user = userRepo.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("User not found with phone: " + phone));

        // Update full name if provided
        if (addressData.containsKey("fullName")) {
            user.setFullName((String) addressData.get("fullName"));
        }

        // Update phone if provided (validate it matches)
        if (addressData.containsKey("phone")) {
            String newPhone = (String) addressData.get("phone");
            if (!phone.equals(newPhone)) {
                // If phone is being changed, check if new phone already exists
                if (userRepo.existsByPhone(newPhone)) {
                    throw new RuntimeException("Phone number already exists: " + newPhone);
                }
                user.setPhone(newPhone);
            }
        }

        // Update email if provided
        if (addressData.containsKey("email")) {
            String newEmail = (String) addressData.get("email");
            String oldEmail = user.getEmail();
            
            // Handle null/empty email
            if (newEmail != null && !newEmail.trim().isEmpty()) {
                newEmail = newEmail.trim();
                // ✅ UPDATED: More lenient email validation - allows:
                // 1. Standard emails: user@domain.com
                // 2. UPI IDs: phone@bank (e.g., 7820866099@ybl)
                // 3. Emails without TLD: user@domain (for internal systems)
                boolean isValidEmail = newEmail.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+(\\.[A-Za-z]{2,})?$");
                if (!isValidEmail) {
                    logger.warn("Invalid email format: {}", newEmail);
                    throw new RuntimeException("Invalid email format: " + newEmail);
                }
                user.setEmail(newEmail);
                logger.info("Email updated for user phone: {}, ID: {}, old: {}, new: {}", 
                    phone, user.getId(), oldEmail, newEmail);
            } else {
                // Allow clearing email (set to null)
                user.setEmail(null);
                logger.info("Email cleared for user phone: {}, ID: {}, old: {}", 
                    phone, user.getId(), oldEmail);
            }
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

        // Use saveAndFlush to ensure email is immediately persisted to database
        User savedUser = userRepo.saveAndFlush(user);
        
        if (addressData.containsKey("email")) {
            logger.info("User saved to database - ID: {}, Phone: {}, Email: {}", 
                savedUser.getId(), savedUser.getPhone(), savedUser.getEmail());
        }
        
        return savedUser;
    }

	
}