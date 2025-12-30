package com.smartbiz.sakhistore.modules.admin.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AdminService {

    @Value("${admin.username:admin}")
    private String adminUsername;

    @Value("${admin.password:Thynktech_sakhistore@123}")
    private String adminPassword;

    public boolean validateAdmin(String username, String password) {
        return adminUsername.equals(username) && adminPassword.equals(password);
    }
}