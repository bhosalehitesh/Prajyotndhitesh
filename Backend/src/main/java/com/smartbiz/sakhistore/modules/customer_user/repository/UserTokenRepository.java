package com.smartbiz.sakhistore.modules.customer_user.repository;

import com.smartbiz.sakhistore.modules.customer_user.model.User;
import com.smartbiz.sakhistore.modules.customer_user.model.UserToken;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserTokenRepository extends JpaRepository<UserToken, Long> {

    List<UserToken> findByUser(User user);

    @Transactional
    @Modifying
    @Query("UPDATE UserToken t SET t.expired = true, t.revoked = true WHERE t.user = :user")
    void revokeAllTokensByUser(User user);

    UserToken findByToken(String token);
}