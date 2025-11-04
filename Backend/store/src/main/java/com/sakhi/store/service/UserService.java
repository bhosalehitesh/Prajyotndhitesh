package com.sakhi.store.service;

import com.sakhi.store.model.User;
import com.sakhi.store.repository.UserRepository;
import com.sakhi.store.exception.ConflictException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Create a pending user. Throws ConflictException if phone already exists.
     */
    @Transactional
    public User createPendingUser(String fullName, String phone, String plainPassword) {
        if (userRepository.existsByPhone(phone)) {
            throw new ConflictException("Phone already registered");
        }
        String hashed = passwordEncoder.encode(plainPassword);
        User user = new User(fullName, phone, hashed);
        user.setStatus("PENDING");
        return userRepository.save(user);
    }

    public Optional<User> findByPhone(String phone) {
        return userRepository.findByPhone(phone);
    }

    @Transactional
    public User activateUser(User user) {
        user.setStatus("ACTIVE");
        user.setVerifiedAt(java.time.Instant.now());
        return userRepository.save(user);
    }
}
