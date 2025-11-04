//package com.sakhi.store.service;
//
//import io.jsonwebtoken.Jwts;
//import io.jsonwebtoken.SignatureAlgorithm;
//import io.jsonwebtoken.security.Keys;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Service;
//
//import java.util.Date;
//import java.util.Map;
//import java.util.HashMap;
//import javax.crypto.SecretKey;
//
//@Service
//public class JwtService {
//
//    private final SecretKey secretKey;
//    private final long expirationMs;
//
//    public JwtService(
//            @Value("${app.jwt.secret}") String secret,
//            @Value("${app.jwt.expiration-ms}") long expirationMs) {
//        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes());
//        this.expirationMs = expirationMs;
//    }
//
//    public String generateToken(String phone, Long userId, String role) {
//        Map<String, Object> claims = new HashMap<>();
//        claims.put("role", role);
//        claims.put("uid", userId);
//
//        long now = System.currentTimeMillis();
//        Date issuedAt = new Date(now);
//        Date expiry = new Date(now + expirationMs);
//
//        return Jwts.builder()
//                .setClaims(claims)
//                .setSubject(phone)
//                .setIssuedAt(issuedAt)
//                .setExpiration(expiry)
//                .signWith(secretKey, SignatureAlgorithm.HS256)
//                .compact();
//    }
//}
package com.sakhi.store.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Map;
import java.util.HashMap;
import javax.crypto.SecretKey;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long expirationMs;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration}") long expirationMs) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes());
        this.expirationMs = expirationMs;
    }


    public String generateToken(String phone, Long userId, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        claims.put("uid", userId);

        long now = System.currentTimeMillis();
        Date issuedAt = new Date(now);
        Date expiry = new Date(now + expirationMs);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(phone)
                .setIssuedAt(issuedAt)
                .setExpiration(expiry)
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }
}