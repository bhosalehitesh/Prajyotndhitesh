package com.smartbiz.sakhistore.modules.otp.service;


import com.smartbiz.sakhistore.modules.auth.sellerauth.repository.SellerDetailsRepo;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smartbiz.sakhistore.modules.otp.model.Otp;
import com.smartbiz.sakhistore.modules.otp.model.OtpGenerator;
import com.smartbiz.sakhistore.modules.otp.repository.SellerOtpRepository;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class SellerOtpService {
        private static final Logger logger = LoggerFactory.getLogger(SellerOtpService.class);

        @Autowired
        private SellerOtpRepository sellerOtpRepository;

        @Autowired
        private SellerDetailsRepo userRepository;

        @Autowired
        private SmsClient smsClient;


        // ============================================================
        // 1️⃣ GENERATE OTP (Used by Signup + Resend)
        // ============================================================
        @Transactional
        public String generateAndSendOtp(String phone) {

            // DELETE ONLY NON-VERIFIED OTPs — FIX
            sellerOtpRepository.deleteByPhoneAndVerifiedFalse(phone);

            String otpCode = OtpGenerator.generateOtp();

            Otp otp = new Otp(phone, otpCode);
            sellerOtpRepository.save(otp);

            smsClient.sendOtp(phone, otpCode);

            return otpCode;
        }


        // ============================================================
        // 2️⃣ VERIFY OTP (Common for login/signup)
        // ============================================================
        @Transactional
        public boolean verifyOtp(String phone, String code) {

            Optional<Otp> otpOptional =
                    sellerOtpRepository.findFirstByPhoneAndVerifiedFalseOrderByCreatedAtDesc(phone);

            if (otpOptional.isEmpty()) {
                return false;
            }

            Otp otp = otpOptional.get();

            if (otp.isExpired()) {
                otp.incrementAttempts();
                sellerOtpRepository.save(otp);
                return false;
            }

            if (otp.hasExceededMaxAttempts()) {
                return false;
            }

            if (!otp.getCode().equals(code)) {
                otp.incrementAttempts();
                sellerOtpRepository.save(otp);
                return false;
            }

            // MARK AS VERIFIED
            otp.setVerified(true);
            sellerOtpRepository.save(otp);

            return true;
        }


        // ============================================================
        // 3️⃣ RESEND OTP
        // ============================================================
        @Transactional
        public String resendOtp(String phone) {
            return generateAndSendOtp(phone);
        }


        // ============================================================
        // 4️⃣ FORGOT PASSWORD OTP
        // ============================================================
        @Transactional
        public String generateForgotOtp(String phone) {

            if (!userRepository.existsByPhone(phone)) {
                throw new RuntimeException("Seller not found");
            }

            // FIX: delete only unverified OTP
            sellerOtpRepository.deleteByPhoneAndVerifiedFalse(phone);

            String otpCode = OtpGenerator.generateOtp();
            Otp otp = new Otp(phone, otpCode);
            sellerOtpRepository.save(otp);

            smsClient.sendOtp(phone, otpCode);

            return otpCode;
        }


        @Transactional
        public boolean verifyForgotOtp(String phone, String code) {

            Optional<Otp> otpOptional =
                    sellerOtpRepository.findFirstByPhoneAndVerifiedFalseOrderByCreatedAtDesc(phone);

            if (otpOptional.isEmpty()) return false;

            Otp otp = otpOptional.get();

            if (otp.isExpired()) return false;
            if (otp.hasExceededMaxAttempts()) return false;
            if (!otp.getCode().equals(code)) return false;

            otp.setVerified(true);
            sellerOtpRepository.save(otp);

            return true;
        }


        // ============================================================
        // CLEANUP JOB
        // ============================================================
        @Transactional
        public void cleanupExpiredOtps() {
            sellerOtpRepository.deleteByExpiresAtBefore(LocalDateTime.now());
        }
    }