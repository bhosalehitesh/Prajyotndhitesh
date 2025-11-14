package com.sakhi.store.repository;

import com.sakhi.store.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

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

