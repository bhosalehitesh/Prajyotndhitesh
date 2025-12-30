/*package com.smartbiz.sakhistore.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowCredentials(true);
        config.setAllowedOrigins(List.of(
                "http://localhost:3000",
                "http://localhost:5173",
                "http://127.0.0.1:3000",
                "http://localhost:8081",      // React Native Android
                "http://192.168.1.14:8080",   // Network IP for React Native (previous)
                "http://192.168.1.14:8081",   // Metro bundler on network IP (previous)
                "http://192.168.1.19:8080",   // Network IP for React Native (previous)
                "http://192.168.1.19:8081",   // Metro bundler on network IP (previous)
                "http://192.168.1.84:8080",   // Network IP for React Native (previous)
                "http://192.168.1.84:8081",   // Metro bundler on network IP (previous)
                "http://192.168.1.38:8080",   // Network IP for React Native (previous)
                "http://192.168.1.38:8081",   // Metro bundler on network IP (previous)
                "http://192.168.1.38:3000",   // Frontend on network IP (previous)
                "http://192.168.1.16:8080",   // Network IP for React Native (current)
                "http://192.168.1.16:8081",   // Metro bundler on network IP (current)
                "http://192.168.1.16:3000",   // Frontend on network IP (current)
                "http://10.222.34.174:8080",  // Network IP for React Native (previous)
                "http://10.222.34.174:8081"   // Metro bundler on network IP (previous)
        ));

        config.setAllowedHeaders(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
} */

package com.smartbiz.sakhistore.config;

import org.springframework.context.annotation.Configuration;

@Configuration
public class CorsConfig {
    // CORS configuration is handled in SecurityConfig to avoid conflicts
    // This class is kept for reference but disabled
}

