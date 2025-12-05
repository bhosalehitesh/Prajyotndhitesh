package com.smartbiz.sakhistore.modules.auth.sellerauth.service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.Optional;

import com.smartbiz.sakhistore.modules.auth.sellerauth.model.Token;
import com.smartbiz.sakhistore.modules.auth.sellerauth.repository.TokenRepository;
import com.smartbiz.sakhistore.modules.otp.service.SellerOtpService;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartbiz.sakhistore.modules.auth.sellerauth.model.SellerDetails;
import com.smartbiz.sakhistore.modules.auth.sellerauth.repository.SellerDetailsRepo;

@Transactional
@NoArgsConstructor
@AllArgsConstructor
@Service
public class SellerDetailsService {
        @Autowired
        private SellerDetailsRepo sellerRepo;

        @Autowired
        private PasswordEncoder passwordEncoder;

        @Autowired
        private JwtService jwtService;

        @Autowired
        private TokenRepository tokenRepo;

        @Autowired
        private SellerOtpService otpService;

        // SIGNUP: create seller (disabled) + send OTP
        @Transactional
        public String signup(String fullName, String phone, String password) {
            if (sellerRepo.existsByPhone(phone)) {
                throw new RuntimeException("Seller already exists");
            }
            SellerDetails s = new SellerDetails();
            s.setFullName(fullName);
            s.setPhone(phone);
            s.setPassword(passwordEncoder.encode(password));
            s.setEnabled(false);
            s.setCreatedAt(LocalDateTime.now());
            s.setUpdatedAt(LocalDateTime.now());
            sellerRepo.save(s);
            return otpService.generateAndSendOtp(phone);
        }

        // VERIFY OTP (signup) → create token & save in DB (auto-login)
        @Transactional
        public String verifyOtpAndCreateToken(String phone, String otpCode) {
            boolean ok = otpService.verifyOtp(phone, otpCode);
            if (!ok) return null;

            SellerDetails seller = sellerRepo.findByPhone(phone)
                    .orElseThrow(() -> new RuntimeException("Seller not found"));

            if (!seller.isEnabled()) {
                seller.setEnabled(true);
                seller.setUpdatedAt(LocalDateTime.now());
                sellerRepo.save(seller);
            }

            String token = jwtService.generateToken(seller);
            Date exp = jwtService.extractExpiration(token);
            LocalDateTime expiresAt = exp.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();

            Token tokenEntity = new Token(token, expiresAt, seller);
            tokenRepo.save(tokenEntity);

            return token;
        }

        // LOGIN → validate + create token & save
        @Transactional
        public String login(String phone, String password) {
            SellerDetails seller = sellerRepo.findByPhone(phone)
                    .orElseThrow(() -> new RuntimeException("Seller not found"));

            if (!seller.isEnabled()) throw new RuntimeException("Please verify OTP first.");
            if (!passwordEncoder.matches(password, seller.getPassword()))
                throw new RuntimeException("Invalid password");

            String token = jwtService.generateToken(seller);
            Date exp = jwtService.extractExpiration(token);
            LocalDateTime expiresAt = exp.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();

            tokenRepo.save(new Token(token, expiresAt, seller));
            return token;
        }

        // RESEND signup OTP
        @Transactional
        public String resendOtp(String phone) {
            SellerDetails seller = sellerRepo.findByPhone(phone)
                    .orElseThrow(() -> new RuntimeException("Seller not found"));
            if (seller.isEnabled()) throw new RuntimeException("Seller already verified");
            return otpService.resendOtp(phone);
        }

        // FORGOT: send OTP
        @Transactional
        public String sendForgotPasswordOtp(String phone) {
            sellerRepo.findByPhone(phone).orElseThrow(() -> new RuntimeException("Seller not found"));
            return otpService.generateForgotOtp(phone);
        }

        // VERIFY forgot OTP (only verification)
        public boolean verifyForgotPasswordOtp(String phone, String code) {
            return otpService.verifyForgotOtp(phone, code);
        }

        // RESET password → update + create new token & save
        @Transactional
        public String resetPasswordAndCreateToken(String phone, String newPassword) {
            SellerDetails seller = sellerRepo.findByPhone(phone)
                    .orElseThrow(() -> new RuntimeException("Seller not found"));

            seller.setPassword(passwordEncoder.encode(newPassword));
            seller.setUpdatedAt(LocalDateTime.now());
            sellerRepo.save(seller);

            String newToken = jwtService.generateToken(seller);
            Date exp = jwtService.extractExpiration(newToken);
            LocalDateTime expiresAt = exp.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();

            tokenRepo.save(new Token(newToken, expiresAt, seller));
            return newToken;
        }

        // LOGIN OTP: send OTP for login
        @Transactional
        public String sendLoginOtp(String phone) {
            SellerDetails seller = sellerRepo.findByPhone(phone)
                    .orElseThrow(() -> new RuntimeException("Seller not found"));
            if (!seller.isEnabled()) {
                throw new RuntimeException("Account not verified. Please verify OTP first.");
            }
            return otpService.generateForgotOtp(phone); // Reuse forgot OTP generation
        }

        // LOGIN OTP: verify OTP and create token
        @Transactional
        public String verifyLoginOtpAndCreateToken(String phone, String otpCode) {
            boolean ok = otpService.verifyForgotOtp(phone, otpCode);
            if (!ok) return null;

            SellerDetails seller = sellerRepo.findByPhone(phone)
                    .orElseThrow(() -> new RuntimeException("Seller not found"));

            if (!seller.isEnabled()) {
                throw new RuntimeException("Account not verified");
            }

            String token = jwtService.generateToken(seller);
            Date exp = jwtService.extractExpiration(token);
            LocalDateTime expiresAt = exp.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();

            Token tokenEntity = new Token(token, expiresAt, seller);
            tokenRepo.save(tokenEntity);

            return token;
        }

        // LOGOUT -> mark token revoked and expired
        @Transactional
        public void logout(String tokenStr) {
            Optional<Token> t = tokenRepo.findByToken(tokenStr);
            t.ifPresent(tok -> {
                tok.setRevoked(true);
                tok.setExpired(true);
                tokenRepo.save(tok);
            });
        }

        @Transactional
        public String loginAccount(String phone, String password) {

            SellerDetails seller = sellerRepo.findByPhone(phone)
                    .orElseThrow(() -> new RuntimeException("Seller not found"));

            if (!seller.isEnabled())
                throw new RuntimeException("Account not verified. Please verify OTP");

            if (!passwordEncoder.matches(password, seller.getPassword()))
                throw new RuntimeException("Incorrect password");

            // Generate JWT
            String jwt = jwtService.generateToken(seller);

            // Convert expiration
            Date expDate = jwtService.extractExpiration(jwt);
            LocalDateTime expiresAt = expDate.toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDateTime();

            // Save token to DB
            Token tokenEntity = new Token(jwt, expiresAt, seller);
            tokenRepo.save(tokenEntity);

            return jwt;
        }

    }