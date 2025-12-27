package com.smartbiz.sakhistore.modules.auth.sellerauth.service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.smartbiz.sakhistore.modules.auth.sellerauth.model.SellerDetails;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    @Value("${app.jwt.secret:your_very_strong_secret_key_here}")
    private String secret;

    @Value("${app.jwt.expiration:31536000000}")  // 1 year
    private Long expiration;

    public String generateToken(SellerDetails user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("sellerId", user.getSellerId());
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

    public String extractPhone(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Long extractUserId(String token) {
        return extractAllClaims(token).get("sellerId", Long.class);
    }

    public LocalDateTime extractExpiryAsLocalDateTime(String token) {
        Date exp = extractClaim(token, Claims::getExpiration);
        return exp.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        return resolver.apply(extractAllClaims(token));
    }

    private Claims extractAllClaims(String token) {
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        return Jwts.parser().verifyWith(key).build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validateToken(String token, String phone) {
        return phone.equals(extractPhone(token)) && !extractExpiration(token).before(new Date());
    }
}
