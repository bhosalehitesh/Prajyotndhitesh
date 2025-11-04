package com.sakhi.store.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/api/health")
    public Map<String, Object> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP ✅");
        response.put("message", "Sakhi-Store backend is running smoothly 🚀");
        response.put("timestamp", LocalDateTime.now().toString());
        return response;
    }
}
