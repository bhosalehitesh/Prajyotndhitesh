package com.sakhi.store.service;

import com.sakhi.store.model.Otp;
import com.sakhi.store.model.User;
import com.sakhi.store.repository.OtpRepository;
import com.sakhi.store.repository.UserRepository;
import com.sakhi.store.util.OtpGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class OtpService {
    
    private static final Logger logger = LoggerFactory.getLogger(OtpService.class);
    
    @Autowired
    private OtpRepository otpRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private SmsClient smsClient;
    
    /**
     * Generates and sends OTP to phone number
     * @param phone Phone number (10 digits)
     * @return Generated OTP code (for dev mode)
     */
    @Transactional
    public String generateAndSendOtp(String phone) {
        // Generate OTP
        String otpCode = OtpGenerator.generateOtp();
        
        // Save OTP to database
        Otp otp = new Otp(phone, otpCode);
        otpRepository.save(otp);
        
        // Send OTP via SMS (or console in dev mode)
        smsClient.sendOtp(phone, otpCode);
        
        logger.info("OTP generated and sent for phone: {}", phone);
        
        // Return OTP code (useful for dev mode/testing)
        return otpCode;
    }
    
    /**
     * Verifies OTP code for a phone number
     * @param phone Phone number
     * @param code OTP code
     * @return true if OTP is valid and verified, false otherwise
     */
    @Transactional
    public boolean verifyOtp(String phone, String code) {
        // Find the latest unverified OTP for this phone
        Optional<Otp> otpOptional = otpRepository.findFirstByPhoneAndVerifiedFalseOrderByCreatedAtDesc(phone);
        
        if (otpOptional.isEmpty()) {
            logger.warn("No OTP found for phone: {}", phone);
            return false;
        }
        
        Otp otp = otpOptional.get();
        
        // Check if OTP is expired
        if (otp.isExpired()) {
            logger.warn("OTP expired for phone: {}", phone);
            otp.incrementAttempts();
            otpRepository.save(otp);
            return false;
        }
        
        // Check if max attempts exceeded
        if (otp.hasExceededMaxAttempts()) {
            logger.warn("Max attempts exceeded for phone: {}", phone);
            return false;
        }
        
        // Verify OTP code
        if (!otp.getCode().equals(code)) {
            logger.warn("Invalid OTP code for phone: {}", phone);
            otp.incrementAttempts();
            otpRepository.save(otp);
            return false;
        }
        
        // Mark OTP as verified
        otp.setVerified(true);
        otpRepository.save(otp);
        
        logger.info("OTP verified successfully for phone: {}", phone);
        return true;
    }
    
    /**
     * Resends OTP for a phone number
     * Invalidates previous OTP and generates new one
     * @param phone Phone number
     * @return New OTP code
     */
    @Transactional
    public String resendOtp(String phone) {
        // Invalidate previous OTPs (optional - you can keep them)
        // For now, we'll just generate a new one
        
        return generateAndSendOtp(phone);
    }
    
    /**
     * Clean up expired OTPs (can be called periodically)
     */
    @Transactional
    public void cleanupExpiredOtps() {
        otpRepository.deleteByExpiresAtBefore(LocalDateTime.now());
        logger.info("Cleaned up expired OTPs");
    }
}

