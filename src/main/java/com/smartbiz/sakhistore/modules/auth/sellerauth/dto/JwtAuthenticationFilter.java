package com.smartbiz.sakhistore.modules.auth.sellerauth.dto;

import com.smartbiz.sakhistore.modules.auth.sellerauth.model.Token;
import com.smartbiz.sakhistore.modules.auth.sellerauth.repository.TokenRepository;
import com.smartbiz.sakhistore.modules.auth.sellerauth.service.JwtService;
import com.smartbiz.sakhistore.modules.customer_user.service.CustomSellerDetailsService;
import com.smartbiz.sakhistore.modules.customer_user.service.CustomUserDetailsService;
import com.smartbiz.sakhistore.modules.customer_user.model.UserToken;
import com.smartbiz.sakhistore.modules.customer_user.repository.UserTokenRepository;
import com.smartbiz.sakhistore.modules.customer_user.service.JwtServiceUser;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

import java.io.IOException;
import java.util.Optional;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private JwtServiceUser jwtServiceUser;

    @Autowired
    private TokenRepository tokenRepository;

    @Autowired
    private UserTokenRepository userTokenRepository;

    @Autowired
    private CustomSellerDetailsService customSellerDetailsService;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    // ✅ UPDATED: Only truly public endpoints that should skip JWT validation
    private static final String[] PUBLIC_PATHS = {
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
            "/api/user/send-otp",
            "/api/user/verify-otp",
            "/api/user/login",
            "/api/user/phone/",
            "/api/user/verify-email/",
            "/v3/api-docs/",
            "/swagger-ui",
            "/api/health",
            "/api/public/store/",
            "/api/payment/",
            "/payment/",
            "/api/cart/",
            "/api/stores/check-availability"
    };

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
        
        String requestPath = request.getRequestURI();
        
        // ✅ UPDATED: Check if this is a public endpoint
        boolean isPublicPath = false;
        for (String publicPath : PUBLIC_PATHS) {
            if (requestPath.startsWith(publicPath)) {
                isPublicPath = true;
                break;
            }
        }
        
        // Skip JWT filter for public endpoints
        if (isPublicPath) {
            filterChain.doFilter(request, response);
            return;
        }

        // ✅ CHANGED: For protected endpoints, require Authorization header
        final String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Authentication required. Please provide a valid JWT token.\"}");
            return;
        }

        String token = header.substring(7);

        // ✅ UPDATED: Check both UserToken (for customers) and Token (for sellers)
        UserToken userToken = userTokenRepository.findByToken(token);
        Optional<Token> sellerTokenOpt = tokenRepository.findByToken(token);
        
        boolean isValidToken = false;
        boolean isUserToken = false;
        String phone = null;
        
        // Check if it's a user token (customer)
        if (userToken != null) {
            if (userToken.isRevoked() || userToken.isExpired()) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Token revoked or expired. Please login again.\"}");
                return;
            }
            isValidToken = true;
            isUserToken = true;
            // Extract phone from user token
            try {
                phone = jwtServiceUser.extractPhone(token);
            } catch (Exception ex) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Invalid token.\"}");
                return;
            }
            // Validate user token
            if (!jwtServiceUser.validateToken(token, phone)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Invalid or expired token.\"}");
                return;
            }
        }
        // Check if it's a seller token
        else if (sellerTokenOpt.isPresent()) {
            Token tokenEntity = sellerTokenOpt.get();
            if (tokenEntity.isRevoked() || tokenEntity.isExpired()) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Token revoked or expired. Please login again.\"}");
                return;
            }
            isValidToken = true;
            isUserToken = false;
            // Extract phone from seller token
            try {
                phone = jwtService.extractPhone(token);
            } catch (Exception ex) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Invalid token.\"}");
                return;
            }
            // Validate seller token
            if (!jwtService.validateToken(token, phone)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Invalid or expired token.\"}");
                return;
            }
        }
        
        // If token not found in either repository
        if (!isValidToken) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Token not recognized (login required).\"}");
            return;
        }

        // Set authentication context - use appropriate service based on token type
        if (phone != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails;
            if (isUserToken) {
                // Load User (customer) details
                userDetails = customUserDetailsService.loadUserByUsername(phone);
            } else {
                // Load Seller details
                userDetails = customSellerDetailsService.loadUserByUsername(phone);
            }

            var auth = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(auth);
        }

        filterChain.doFilter(request, response);
    }
}
