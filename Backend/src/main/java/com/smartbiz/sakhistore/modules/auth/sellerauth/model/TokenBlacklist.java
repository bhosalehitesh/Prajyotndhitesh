package com.smartbiz.sakhistore.modules.auth.sellerauth.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class TokenBlacklist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long TokenBlacklistId;

    @Column(nullable = false, unique = true, length = 600)
    private String token;

    private LocalDateTime blacklistedAt = LocalDateTime.now();

    public TokenBlacklist() {}

    public TokenBlacklist(String token) {
        this.token = token;
    }
    public Long getTokenBlacklistId() {
        return TokenBlacklistId;
    }
    public void setTokenBlacklistId(Long tokenBlacklistId) {
        TokenBlacklistId = tokenBlacklistId;
    }
    public String getToken() {
        return token;
    }
    public void setToken(String token) {
        this.token = token;
    }
    public LocalDateTime getBlacklistedAt() {
        return blacklistedAt;
    }
    public void setBlacklistedAt(LocalDateTime blacklistedAt) {
        this.blacklistedAt = blacklistedAt;
    }



    // getters + setters
}
