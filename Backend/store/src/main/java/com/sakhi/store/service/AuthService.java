package com.sakhi.store.service;

import com.sakhi.store.model.User;
import com.sakhi.store.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AuthService {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private OtpService otpService;
    
    @Autowired
    private JwtService jwtService;
    
    /**
     * Sign up a new user
     * Creates user account and sends OTP for verification
     * @param fullName User's full name
     * @param phone Phone number (10 digits)
     * @param password Password (will be encoded)
     * @return OTP code (for dev mode)
     */
    @Transactional
    public String signup(String fullName, String phone, String password) {
        // Check if user already exists
        if (userRepository.existsByPhone(phone)) {
            throw new RuntimeException("User with this phone number already exists");
        }
        
        // Encode password
        String encodedPassword = passwordEncoder.encode(password);
        
        // Create user (disabled until OTP verified)
        User user = new User(fullName, phone, encodedPassword);
        user.setEnabled(false);
        userRepository.save(user);
        
        // Generate and send OTP
        String otpCode = otpService.generateAndSendOtp(phone);
        
        logger.info("User signed up: {} ({})", fullName, phone);
        
        return otpCode;
    }
    
    /**
     * Verify OTP and enable user account
     * @param phone Phone number
     * @param otpCode OTP code
     * @return true if verified successfully
     */
    @Transactional
    public boolean verifyOtp(String phone, String otpCode) {
        // Verify OTP
        boolean verified = otpService.verifyOtp(phone, otpCode);
        
        if (verified) {
            // Enable user account
            Optional<User> userOptional = userRepository.findByPhone(phone);
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                user.setEnabled(true);
                userRepository.save(user);
                logger.info("User account enabled: {}", phone);
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Login user with phone and password
     * @param phone Phone number
     * @param password Plain text password
     * @return JWT token if login successful
     */
    public String login(String phone, String password) {
        Optional<User> userOptional = userRepository.findByPhone(phone);
        
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOptional.get();
        
        // Check if account is enabled (OTP verified)
        if (!user.isEnabled()) {
            throw new RuntimeException("Account not verified. Please verify OTP first.");
        }
        
        // Verify password
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
        
        // Generate JWT token
        String token = jwtService.generateToken(user);
        
        logger.info("User logged in: {}", phone);
        
        return token;
    }
    
    /**
     * Resend OTP for signup
     * @param phone Phone number
     * @return OTP code
     */
    @Transactional
    public String resendOtp(String phone) {
        // Check if user exists
        Optional<User> userOptional = userRepository.findByPhone(phone);
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOptional.get();
        
        // If user is already enabled, don't resend OTP
        if (user.isEnabled()) {
            throw new RuntimeException("User already verified");
        }
        
        // Resend OTP
        return otpService.resendOtp(phone);
    }
    
    /**
     * Send OTP for login (allows verified users)
     * @param phone Phone number
     * @return OTP code
     */
    @Transactional
    public String sendLoginOtp(String phone) {
        // Check if user exists
        Optional<User> userOptional = userRepository.findByPhone(phone);
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOptional.get();
        
        // Check if account is enabled (required for login)
        if (!user.isEnabled()) {
            throw new RuntimeException("Account not verified. Please verify OTP first.");
        }
        
        // Generate and send OTP for login (even if user is already verified)
        return otpService.generateAndSendOtp(phone);
    }
    
    /**
     * Login user with OTP
     * Verifies OTP and returns JWT token
     * @param phone Phone number
     * @param otpCode OTP code
     * @return JWT token if login successful
     */
    @Transactional
    public String loginWithOtp(String phone, String otpCode) {
        // Check if user exists
        Optional<User> userOptional = userRepository.findByPhone(phone);
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOptional.get();
        
        // Check if account is enabled
        if (!user.isEnabled()) {
            throw new RuntimeException("Account not verified. Please verify OTP first.");
        }
        
        // Verify OTP (without enabling account since it's already enabled)
        boolean verified = otpService.verifyOtp(phone, otpCode);
        
        if (!verified) {
            throw new RuntimeException("Invalid or expired OTP");
        }
        
        // Generate JWT token
        String token = jwtService.generateToken(user);
        
        logger.info("User logged in with OTP: {}", phone);
        
        return token;
    }
}

