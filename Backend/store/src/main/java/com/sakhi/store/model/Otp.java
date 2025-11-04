package com.sakhi.store.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "otps", indexes = {
        @Index(name = "idx_otps_phone", columnList = "phone")
})
public class Otp {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="phone", nullable = false, length = 20)
    private String phone;

    @Column(name="code", nullable = false, length = 20)
    private String code;

    @Column(name="created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name="expires_at")
    private Instant expiresAt;

    @Column(name="used", nullable = false)
    private boolean used = false;

    @Column(name="attempts", nullable = false)
    private int attempts = 0;

    // Constructors
    public Otp() {}

    public Otp(String phone, String code, Instant expiresAt) {
        this.phone = phone;
        this.code = code;
        this.expiresAt = expiresAt;
        this.createdAt = Instant.now();
        this.used = false;
        this.attempts = 0;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }

    public boolean isUsed() { return used; }
    public void setUsed(boolean used) { this.used = used; }

    public int getAttempts() { return attempts; }
    public void setAttempts(int attempts) { this.attempts = attempts; }
}
