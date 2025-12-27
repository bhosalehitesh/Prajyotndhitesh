package com.smartbiz.sakhistore.modules.admin.service;

import org.springframework.stereotype.Service;

    @Service
    public class AdminService {

        private final String ADMIN_USERNAME = "admin";
        private final String ADMIN_PASSWORD = "Thynktech_sakhistore@123";

        public boolean validateAdmin(String username, String password) {
            return ADMIN_USERNAME.equals(username) && ADMIN_PASSWORD.equals(password);
        }
    }