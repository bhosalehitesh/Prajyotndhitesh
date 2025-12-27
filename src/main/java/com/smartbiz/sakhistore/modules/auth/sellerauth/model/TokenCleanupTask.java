package com.smartbiz.sakhistore.modules.auth.sellerauth.model;

import java.time.LocalDateTime;

import com.smartbiz.sakhistore.modules.auth.sellerauth.repository.TokenRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;

@Component
public class TokenCleanupTask {

    @Autowired
    private TokenRepository tokenRepository;

    @Scheduled(cron = "0 0 */6 * * ?") // every 6 hours
    public void markExpired() {
        LocalDateTime now = LocalDateTime.now();
        tokenRepository.findAll().stream()
                .filter(t -> t.getExpiresAt() != null && t.getExpiresAt().isBefore(now) && !t.isExpired())
                .forEach(t -> {
                    t.setExpired(true);
                    tokenRepository.save(t);
                });
    }
}

