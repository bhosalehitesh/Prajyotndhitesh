package com.smartbiz.sakhistore.modules.customer_user.service;

import com.smartbiz.sakhistore.modules.auth.sellerauth.model.SellerDetails;
import com.smartbiz.sakhistore.modules.auth.sellerauth.repository.SellerDetailsRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
    public class CustomSellerDetailsService implements UserDetailsService {

        @Autowired
        private SellerDetailsRepo userRepo;

        @Override
        public UserDetails loadUserByUsername(String phone) throws UsernameNotFoundException {
            SellerDetails user = userRepo.findByPhone(phone)
                    .orElseThrow(() -> new UsernameNotFoundException("Seller not found: " + phone));

            // adapt SellerDetails to UserDetails
            return User.builder()
                    .username(user.getPhone())
                    .password(user.getPassword())
                    .authorities(Collections.emptyList())
                    .accountExpired(false)
                    .accountLocked(false)
                    .credentialsExpired(false)
                    .disabled(!user.isEnabled())
                    .build();
        }
    }
