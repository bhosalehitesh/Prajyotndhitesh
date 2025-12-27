package com.smartbiz.sakhistore.modules.customer_user.service;


import com.smartbiz.sakhistore.modules.auth.sellerauth.dto.SellerAuthResponse;
import com.smartbiz.sakhistore.modules.customer_user.model.User;
import com.smartbiz.sakhistore.modules.customer_user.repository.UserRepository;
import com.smartbiz.sakhistore.modules.customer_user.repository.UserTokenRepository;
import com.smartbiz.sakhistore.modules.otp.model.Otp;
import com.smartbiz.sakhistore.modules.otp.model.OtpGenerator;
import com.smartbiz.sakhistore.modules.otp.repository.SellerOtpRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserOtpService {

    @Autowired
    private SellerOtpRepository otpRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private UserTokenRepository tokenRepo;

    @Autowired
    private JwtServiceUser jwtService;

    // ⭐ SEND OTP FOR LOGIN
    public String sendOtp(String phone) {

        String code = OtpGenerator.generateOtp(); // 6-digit OTP

        Otp otp = new Otp(phone, code);
        otpRepo.save(otp);

        System.out.println("OTP for USER " + phone + ": " + code);

        return "OTP sent successfully!";
    }

    // ⭐ VERIFY OTP + AUTO LOGIN + RETURN JWT
    public SellerAuthResponse verifyOtp(String phone, String code) {

        Otp otp = otpRepo.findTopByPhoneOrderByIdDesc(phone);

        if (otp == null)
            throw new RuntimeException("OTP not found");

        if (otp.isExpired())
            throw new RuntimeException("OTP expired");

        if (!otp.getCode().equals(code)) {
            otp.incrementAttempts();
            otpRepo.save(otp);
            throw new RuntimeException("Invalid OTP");
        }

        otp.setVerified(true);
        otpRepo.save(otp);

        // 🔥 Fetch or create user
        User user = userRepo.findByPhone(phone).orElse(null);

        if (user == null) {
            user = new User();
            user.setPhone(phone);
            user.setFullName("New User");
            user.setEnabled(true);
            userRepo.save(user);
        }

        // 🔥 Revoke all previous tokens
        tokenRepo.revokeAllTokensByUser(user);

        // 🔥 Generate JWT token
        String token = jwtService.generateToken(user);

        // 🔥 Save token in DB
        jwtService.saveUserToken(token, user);

        // 🔥 Return final response
        return new SellerAuthResponse(
                token,
                user.getId(),
                user.getFullName(),
                user.getPhone()
        );
    }
}
