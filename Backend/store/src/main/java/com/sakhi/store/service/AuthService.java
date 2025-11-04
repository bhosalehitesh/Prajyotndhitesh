//package com.sakhi.store.service;
//
//import com.sakhi.store.dto.SignupRequest;
//import com.sakhi.store.dto.VerifyOtpRequest;
//import com.sakhi.store.model.Otp;
//import com.sakhi.store.model.User;
//import com.sakhi.store.repository.OtpRepository;
//import com.sakhi.store.repository.UserRepository;
//import com.sakhi.store.util.OtpGenerator;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.time.Instant;
//import java.time.temporal.ChronoUnit;
//import java.util.Optional;
//
//@Service
//public class AuthService {
//    private final UserRepository userRepo;
//    private final OtpRepository otpRepo;
//    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
//
//    // configurable values
//    private final int otpLength = 6;
//    private final int otpTtlSeconds = 300; // 5 minutes
//    private final int resendCooldownSeconds = 60;
//    private final int maxOtpAttempts = 5;
//
//    public AuthService(UserRepository userRepo, OtpRepository otpRepo) {
//        this.userRepo = userRepo;
//        this.otpRepo = otpRepo;
//    }
//
//    @Transactional
//    public String signupAndSendOtp(SignupRequest req) {
//        String phone = req.getPhone();
//
//        if (userRepo.existsByPhone(phone)) {
//            throw new IllegalStateException("User with this phone already exists");
//        }
//
//        // Save user with enabled=false
//        User user = new User();
//        user.setPhone(phone);
//        user.setFullName(req.getFullName());
//        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
//        user.setEnabled(false);
//        userRepo.save(user);
//
//        // Rate-limit: check last OTP created
//        Optional<Otp> lastOtpOpt = otpRepo.findFirstByPhoneAndUsedFalseOrderByCreatedAtDesc(phone);
//        if (lastOtpOpt.isPresent()) {
//            Otp lastOtp = lastOtpOpt.get();
//            if (Instant.now().isBefore(lastOtp.getCreatedAt().plusSeconds(resendCooldownSeconds))) {
//                throw new IllegalStateException("Please wait before requesting another OTP");
//            }
//        }
//
//        // Generate OTP
//        String code = OtpGenerator.generateNumericOtp(otpLength);
//        Otp otp = new Otp();
//        otp.setPhone(phone);
//        otp.setCode(code);
//        otp.setCreatedAt(Instant.now());
//        otp.setExpiresAt(Instant.now().plus(otpTtlSeconds, ChronoUnit.SECONDS));
//        otp.setUsed(false);
//        otp.setAttempts(0);
//        otpRepo.save(otp);
//
//        // TODO: call SMS provider here (sms.kutility.com). For dev, return the OTP
//        return code;
//    }
//
//    @Transactional
//    public void verifyOtp(VerifyOtpRequest req) {
//        String phone = req.getPhone();
//        String code = req.getCode();
//
//        Optional<Otp> otpOpt = otpRepo.findFirstByPhoneAndUsedFalseOrderByCreatedAtDesc(phone);
//        if (otpOpt.isEmpty()) throw new IllegalArgumentException("No OTP found; request a new one");
//
//        Otp otp = otpOpt.get();
//        if (otp.getAttempts() >= maxOtpAttempts) {
//            throw new IllegalStateException("Max attempts exceeded; request a new OTP");
//        }
//
//        if (otp.getExpiresAt() != null && Instant.now().isAfter(otp.getExpiresAt())) {
//            throw new IllegalStateException("OTP expired; request a new OTP");
//        }
//
//        if (!otp.getCode().equals(code)) {
//            otp.setAttempts(otp.getAttempts() + 1);
//            otpRepo.save(otp);
//            throw new IllegalArgumentException("Invalid OTP code");
//        }
//
//        // success
//        otp.setUsed(true);
//        otpRepo.save(otp);
//
//        // enable the user
//        User user = userRepo.findByPhone(phone)
//                .orElseThrow(() -> new IllegalStateException("User not found"));
//        user.setEnabled(true);
//        userRepo.save(user);
//    }
//}
package com.sakhi.store.service;

import com.sakhi.store.dto.SignupRequest;
import com.sakhi.store.dto.VerifyOtpRequest;
import com.sakhi.store.dto.LoginRequest;
import com.sakhi.store.dto.AuthResponse;
import com.sakhi.store.model.Otp;
import com.sakhi.store.model.User;
import com.sakhi.store.repository.OtpRepository;
import com.sakhi.store.repository.UserRepository;
import com.sakhi.store.util.JwtUtil;
import com.sakhi.store.util.OtpGenerator;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepo;
    private final OtpRepository otpRepo;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // Configurable values (could be externalized later)
    private static final int OTP_LENGTH = 6;
    private static final int OTP_TTL_SECONDS = 300; // 5 min
    private static final int RESEND_COOLDOWN_SECONDS = 60;
    private static final int MAX_OTP_ATTEMPTS = 5;

    public AuthService(UserRepository userRepo, OtpRepository otpRepo, JwtUtil jwtUtil) {
        this.userRepo = userRepo;
        this.otpRepo = otpRepo;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public String signupAndSendOtp(SignupRequest req) {
        String phone = req.getPhone();

        if (userRepo.existsByPhone(phone)) {
            throw new IllegalStateException("User with this phone already exists");
        }

        // Create unverified user
        User user = new User();
        user.setPhone(phone);
        user.setFullName(req.getFullName());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setEnabled(false);
        userRepo.save(user);

        // OTP resend check
        Optional<Otp> lastOtpOpt = otpRepo.findFirstByPhoneAndUsedFalseOrderByCreatedAtDesc(phone);
        if (lastOtpOpt.isPresent()) {
            Otp lastOtp = lastOtpOpt.get();
            if (Instant.now().isBefore(lastOtp.getCreatedAt().plusSeconds(RESEND_COOLDOWN_SECONDS))) {
                throw new IllegalStateException("Please wait before requesting another OTP");
            }
        }

        // Generate and save OTP
        String code = OtpGenerator.generateNumericOtp(OTP_LENGTH);
        Otp otp = new Otp();
        otp.setPhone(phone);
        otp.setCode(code);
        otp.setCreatedAt(Instant.now());
        otp.setExpiresAt(Instant.now().plus(OTP_TTL_SECONDS, ChronoUnit.SECONDS));
        otp.setUsed(false);
        otp.setAttempts(0);
        otpRepo.save(otp);

        // TODO: integrate Kutility SMS API here
        return code;
    }

    @Transactional
    public void verifyOtp(VerifyOtpRequest req) {
        String phone = req.getPhone();
        String code = req.getCode();

        Otp otp = otpRepo.findFirstByPhoneAndUsedFalseOrderByCreatedAtDesc(phone)
                .orElseThrow(() -> new IllegalArgumentException("No OTP found; request a new one"));

        if (otp.getAttempts() >= MAX_OTP_ATTEMPTS)
            throw new IllegalStateException("Max attempts exceeded; request a new OTP");

        if (Instant.now().isAfter(otp.getExpiresAt()))
            throw new IllegalStateException("OTP expired; request a new one");

        if (!otp.getCode().equals(code)) {
            otp.setAttempts(otp.getAttempts() + 1);
            otpRepo.save(otp);
            throw new IllegalArgumentException("Invalid OTP code");
        }

        otp.setUsed(true);
        otpRepo.save(otp);

        User user = userRepo.findByPhone(phone)
                .orElseThrow(() -> new IllegalStateException("User not found"));
        user.setEnabled(true);
        userRepo.save(user);
    }

    // ==============================
    // LOGIN METHOD (JWT)
    // ==============================
    public AuthResponse login(LoginRequest req) {
        User user = userRepo.findByPhone(req.getPhone())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!user.isEnabled()) {
            throw new IllegalStateException("User not verified. Please verify OTP first.");
        }

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid password");
        }

        String token = jwtUtil.generateToken(user.getPhone());

        return new AuthResponse(
                token,
                user.getId(),
                user.getFullName(),
                user.getPhone()
        );
    }
}
