package com.smartbiz.sakhistore.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.smartbiz.sakhistore.modules.auth.sellerauth.dto.JwtAuthenticationFilter;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ✅ UPDATED: Only truly public endpoints (authentication endpoints)
    private static final String[] PUBLIC_ENDPOINTS = {
            // Seller authentication endpoints
            "/api/sellers/signup-seller",
            "/api/sellers/login-seller",
            "/api/sellers/verify-otp-seller",
            "/api/sellers/verify-login-otp-seller",
            "/api/sellers/login-otp-seller",
            "/api/sellers/resend-otp-seller",
            "/api/sellers/forgot-password-seller",
            "/api/sellers/verify-forgot-otp-seller",
            "/api/sellers/reset-password-seller",
            // Legacy seller endpoints (for backward compatibility)
            "/api/sellers/signup",
            "/api/sellers/login",
            "/api/sellers/verifyOtp",
            "/api/sellers/resendOtp",
            "/api/sellers/forgot-password",
            "/api/sellers/reset-password",
            
            // Store endpoints (public for onboarding)
            "/api/stores/check-availability",
            
            // User authentication endpoints
            "/api/user/send-otp",
            "/api/user/verify-otp",
            "/api/user/login",
            "/api/user/phone/**",
            "/api/user/verify-email/**",
            
            // Swagger/OpenAPI documentation (optional - remove in production)
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/swagger-resources/**",
            "/webjars/**",
            
            // Health check
            "/api/health",
            
            // Public store endpoints (for viewing public store pages)
            "/api/public/store/**",
            
            // Payment endpoints (must be public for Razorpay integration)
            "/api/payment/**",
            "/payment/**",
            
            // Cart endpoints (public for guest cart functionality)
            "/api/cart/**"
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF for APIs
                .csrf(csrf -> csrf.disable())

                // Enable CORS - MUST be before authorization
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // ✅ ADD JWT FILTER BEFORE AUTHORIZATION
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)

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
                                "/swagger-ui/swagger-ui-standalone-preset.js")
                        .permitAll()
                        
                        // ✅ UPDATED: Only public endpoints are allowed
                        .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                        
                        // ✅ CHANGED: All other requests require authentication
                        .anyRequest().authenticated())

                // Disable HTTP Basic Authentication
                .httpBasic(httpBasic -> httpBasic.disable())

                // Disable form login
                .formLogin(formLogin -> formLogin.disable())

                // Stateless sessions for JWT
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        // Disable frame options for Swagger UI
        http.headers(headers -> headers
                .frameOptions(frame -> frame.disable()));

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