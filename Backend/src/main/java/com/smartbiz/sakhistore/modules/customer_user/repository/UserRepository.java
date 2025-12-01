package com.smartbiz.sakhistore.modules.customer_user.repository;

import com.smartbiz.sakhistore.modules.customer_user.model.User;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {




    /**
     * Find user by phone number
     */
    Optional<User> findByPhone(String phone);

    /**
     * Check if user exists by phone number
     */
    boolean existsByPhone(String phone);
}
