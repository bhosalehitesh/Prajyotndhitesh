package com.smartbiz.sakhistore.modules.auth.sellerauth.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import com.smartbiz.sakhistore.modules.auth.sellerauth.model.TokenBlacklist;
import java.util.Optional;

public interface TokenBlacklistRepository extends JpaRepository<TokenBlacklist, Long> {
    Optional<TokenBlacklist> findByToken(String token);
}
