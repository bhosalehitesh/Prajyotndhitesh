package com.smartbiz.sakhistore.modules.customer_user.service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import javax.crypto.SecretKey;

import com.smartbiz.sakhistore.modules.customer_user.model.UserToken;
import com.smartbiz.sakhistore.modules.customer_user.repository.UserTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.smartbiz.sakhistore.modules.customer_user.model.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtServiceUser {

    @Value("${app.jwt.secret:your_very_strong_secret_key_here}")
    private String secret;

    // 1 year = 31,536,000,000 ms
    @Value("${app.jwt.expiration:31536000000}")
    private Long expiration;

    @Autowired
    private UserTokenRepository tokenRepo;


    // 🔹 Generate JWT Token
    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", user.getId());
        claims.put("phone", user.getPhone());
        claims.put("fullName", user.getFullName());
        return createToken(claims, user.getPhone());
    }

    private String createToken(Map<String, Object> claims, String subject) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key)
                .compact();
    }


    // 🔹 Save token to DB (1 year expiry)
    public void saveUserToken(String token, User user) {
        UserToken ut = new UserToken();
        ut.setToken(token);
        ut.setUser(user);
        ut.setExpired(false);
        ut.setRevoked(false);
        ut.setCreatedAt(LocalDateTime.now());
        ut.setExpiresAt(LocalDateTime.now().plusYears(1)); // Save for 1 year
        tokenRepo.save(ut);
    }


    // 🔹 Extract phone from token
    public String extractPhone(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // 🔹 Extract user Id
    public Long extractUserId(String token) {
        return extractAllClaims(token).get("id", Long.class);
    }

    // 🔹 Extract expiration date
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // 🔹 Generic Claim Extractor
    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        Claims claims = extractAllClaims(token);
        return resolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validateToken(String token, String phone) {
        return extractPhone(token).equals(phone) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
}
