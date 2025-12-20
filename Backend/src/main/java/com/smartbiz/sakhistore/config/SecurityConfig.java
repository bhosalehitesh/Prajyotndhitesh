package com.smartbiz.sakhistore.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }




    private static final String[] PUBLIC_ENDPOINTS = {
            // Auth and Seller APIs that should be public
            "/api/**",
            "/api/auth/**",
            "/api/**",
            "/orders/**",  // Allow all order endpoints (including test-email)
            "/orders/update-status/**",
            "/api/sellers/**",
            "/api/products/**",
            "/api/auth/signup",
            "/api/auth/login",
            "/api/auth/verifyOtp",
            "/api/auth/resendOtp",
            "/api/categories",
            // Payment endpoints
            "/payment/**",
            // Swagger + docs
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/swagger-resources/**",
            "api/sellers/signup seller",
            "/webjars/**",
            "/api/health",
            // Test email endpoints
            "/orders/test-email-simple",
            "/orders/test-email/**",
            // User email verification
            "/api/user/verify-email/**"
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF for APIs
                .csrf(csrf -> csrf.disable())
                
                // Enable CORS - MUST be before authorization
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Authorization rules - Swagger endpoints FIRST (highest priority)
                .authorizeHttpRequests(auth -> auth
                                // Swagger/OpenAPI endpoints - NO AUTHENTICATION REQUIRED
                                .requestMatchers(
                                    "/v3/api-docs/**",
                                    "/swagger-ui/**",
                                    "/swagger-ui.html",
                                    "/swagger-resources/**",
                                    "/webjars/**",
                                    "/swagger-ui/index.html",
                                    "/swagger-ui/swagger-ui.css",
                                    "/swagger-ui/swagger-ui-bundle.js",
                                    "/swagger-ui/swagger-ui-standalone-preset.js"
                                ).permitAll()
                                // All other public endpoints
                                .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                                // Explicitly allow all payment endpoints with any method
                                .requestMatchers("/payment/**").permitAll()
                                // Allow everything else (no authentication required)
                                .anyRequest().permitAll()
                )

                // Disable HTTP Basic Authentication
                .httpBasic(httpBasic -> httpBasic.disable())
                
                // Disable form login
                .formLogin(formLogin -> formLogin.disable())

                // Stateless sessions for JWT
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                );

        // Disable frame options for Swagger UI
        http.headers(headers -> headers
                .frameOptions(frame -> frame.disable())
        );

        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Allow all origins
        configuration.setAllowedOriginPatterns(List.of("*"));
        
        // Allow all methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        
        // Allow all headers
        configuration.setAllowedHeaders(List.of("*"));
        
        // Allow credentials (set to false if not needed)
        configuration.setAllowCredentials(false);
        
        // Expose headers if needed
        configuration.setExposedHeaders(List.of("*"));
        
        // Cache preflight for 1 hour
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(@org.springframework.lang.NonNull CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOriginPatterns("*")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                        .allowedHeaders("*")
                        .allowCredentials(false);
            }
        };
    }
}