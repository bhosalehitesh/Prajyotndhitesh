package com.smartbiz.sakhistore.modules.store.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.smartbiz.sakhistore.modules.auth.sellerauth.service.JwtService;
import com.smartbiz.sakhistore.modules.store.model.Banner;
import com.smartbiz.sakhistore.modules.store.service.BannerService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/banners")
@RequiredArgsConstructor
public class BannerController {

    @Autowired
    private BannerService bannerService;

    @Autowired
    private JwtService jwtService;

    // Helper method to extract sellerId from JWT token
    private Long extractSellerIdFromToken(HttpServletRequest httpRequest) {
        try {
            String authHeader = httpRequest.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                return jwtService.extractUserId(token);
            }
        } catch (Exception e) {
            // If token extraction fails, return null
        }
        return null;
    }

    // Get all banners for a seller (requires authentication)
    @GetMapping("/seller")
    public ResponseEntity<?> getBannersBySeller(
            @RequestParam("sellerId") Long sellerId,
            @RequestParam(value = "activeOnly", defaultValue = "false") Boolean activeOnly,
            HttpServletRequest httpRequest) {
        try {
            Long tokenSellerId = extractSellerIdFromToken(httpRequest);
            
            // If token is provided, verify seller owns the banners
            if (tokenSellerId != null && !tokenSellerId.equals(sellerId)) {
                return ResponseEntity.status(403).body(Map.of(
                    "error", "Forbidden",
                    "message", "You can only access your own banners"
                ));
            }

            List<Banner> banners;
            if (activeOnly) {
                banners = bannerService.getActiveBannersBySellerId(sellerId);
            } else {
                banners = bannerService.getBannersBySellerId(sellerId);
            }

            return ResponseEntity.ok(banners);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "error", "Internal Server Error",
                "message", e.getMessage()
            ));
        }
    }

    // Get a specific banner by ID
    @GetMapping("/{bannerId}")
    public ResponseEntity<?> getBannerById(
            @PathVariable Long bannerId,
            HttpServletRequest httpRequest) {
        try {
            Long sellerId = extractSellerIdFromToken(httpRequest);
            if (sellerId == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "error", "Unauthorized",
                    "message", "Authentication required"
                ));
            }

            Banner banner = bannerService.getBannerById(bannerId, sellerId);
            return ResponseEntity.ok(banner);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of(
                "error", "Not Found",
                "message", e.getMessage()
            ));
        }
    }

    // Create a new banner (with image upload)
    @PostMapping(value = "/upload", consumes = {"multipart/form-data"})
    public ResponseEntity<?> createBannerWithImage(
            @RequestParam("sellerId") Long sellerId,
            @RequestParam("image") MultipartFile imageFile,
            @RequestParam(value = "title", required = false, defaultValue = "") String title,
            @RequestParam(value = "buttonText", required = false, defaultValue = "Shop Now") String buttonText,
            @RequestParam(value = "buttonLink", required = false) String buttonLink,
            @RequestParam(value = "displayOrder", required = false, defaultValue = "0") Integer displayOrder,
            HttpServletRequest httpRequest) {
        try {
            Long tokenSellerId = extractSellerIdFromToken(httpRequest);
            if (tokenSellerId != null && !tokenSellerId.equals(sellerId)) {
                return ResponseEntity.status(403).body(Map.of(
                    "error", "Forbidden",
                    "message", "You can only create banners for your own store"
                ));
            }

            if (imageFile.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Bad Request",
                    "message", "Image file is required"
                ));
            }

            // Validate file type
            String contentType = imageFile.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Bad Request",
                    "message", "File must be an image"
                ));
            }

            // Validate file size (5MB max)
            if (imageFile.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Bad Request",
                    "message", "Image size must be less than 5MB"
                ));
            }

            Banner banner = bannerService.uploadBannerImageAndCreate(
                sellerId, imageFile, title, buttonText, buttonLink, displayOrder
            );

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Banner created successfully",
                "banner", banner
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Internal Server Error",
                "message", e.getMessage()
            ));
        }
    }

    // Create a new banner (without image upload - uses existing image URL)
    @PostMapping
    public ResponseEntity<?> createBanner(
            @RequestBody Map<String, Object> request,
            HttpServletRequest httpRequest) {
        try {
            Long sellerId = Long.valueOf(request.get("sellerId").toString());
            Long tokenSellerId = extractSellerIdFromToken(httpRequest);
            
            if (tokenSellerId != null && !tokenSellerId.equals(sellerId)) {
                return ResponseEntity.status(403).body(Map.of(
                    "error", "Forbidden",
                    "message", "You can only create banners for your own store"
                ));
            }

            String imageUrl = (String) request.get("imageUrl");
            String title = (String) request.getOrDefault("title", "");
            String buttonText = (String) request.getOrDefault("buttonText", "Shop Now");
            String buttonLink = (String) request.get("buttonLink");
            Integer displayOrder = request.get("displayOrder") != null 
                ? Integer.valueOf(request.get("displayOrder").toString()) 
                : 0;

            Banner banner = bannerService.createBanner(
                sellerId, imageUrl, title, buttonText, buttonLink, displayOrder
            );

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Banner created successfully",
                "banner", banner
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Internal Server Error",
                "message", e.getMessage()
            ));
        }
    }

    // Update banner
    @PutMapping("/{bannerId}")
    public ResponseEntity<?> updateBanner(
            @PathVariable Long bannerId,
            @RequestBody Map<String, Object> request,
            HttpServletRequest httpRequest) {
        try {
            Long sellerId = extractSellerIdFromToken(httpRequest);
            if (sellerId == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "error", "Unauthorized",
                    "message", "Authentication required"
                ));
            }

            String imageUrl = (String) request.get("imageUrl");
            String title = (String) request.get("title");
            String buttonText = (String) request.get("buttonText");
            String buttonLink = (String) request.get("buttonLink");
            Integer displayOrder = request.get("displayOrder") != null 
                ? Integer.valueOf(request.get("displayOrder").toString()) 
                : null;
            Boolean isActive = request.get("isActive") != null 
                ? Boolean.valueOf(request.get("isActive").toString()) 
                : null;

            Banner banner = bannerService.updateBanner(
                bannerId, sellerId, imageUrl, title, buttonText, buttonLink, displayOrder, isActive
            );

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Banner updated successfully",
                "banner", banner
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Internal Server Error",
                "message", e.getMessage()
            ));
        }
    }

    // Update banner image
    @PostMapping(value = "/{bannerId}/upload-image", consumes = {"multipart/form-data"})
    public ResponseEntity<?> updateBannerImage(
            @PathVariable Long bannerId,
            @RequestParam("image") MultipartFile imageFile,
            HttpServletRequest httpRequest) {
        try {
            Long sellerId = extractSellerIdFromToken(httpRequest);
            if (sellerId == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "error", "Unauthorized",
                    "message", "Authentication required"
                ));
            }

            if (imageFile.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Bad Request",
                    "message", "Image file is required"
                ));
            }

            // Validate file type
            String contentType = imageFile.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Bad Request",
                    "message", "File must be an image"
                ));
            }

            // Validate file size (5MB max)
            if (imageFile.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Bad Request",
                    "message", "Image size must be less than 5MB"
                ));
            }

            Banner banner = bannerService.uploadBannerImageAndUpdate(bannerId, sellerId, imageFile);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Banner image updated successfully",
                "banner", banner
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Internal Server Error",
                "message", e.getMessage()
            ));
        }
    }

    // Delete banner
    @DeleteMapping("/{bannerId}")
    public ResponseEntity<?> deleteBanner(
            @PathVariable Long bannerId,
            HttpServletRequest httpRequest) {
        try {
            Long sellerId = extractSellerIdFromToken(httpRequest);
            if (sellerId == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "error", "Unauthorized",
                    "message", "Authentication required"
                ));
            }

            bannerService.deleteBanner(bannerId, sellerId);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Banner deleted successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Internal Server Error",
                "message", e.getMessage()
            ));
        }
    }

    // Toggle banner active status
    @PutMapping("/{bannerId}/toggle-status")
    public ResponseEntity<?> toggleBannerStatus(
            @PathVariable Long bannerId,
            HttpServletRequest httpRequest) {
        try {
            Long sellerId = extractSellerIdFromToken(httpRequest);
            if (sellerId == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "error", "Unauthorized",
                    "message", "Authentication required"
                ));
            }

            Banner banner = bannerService.toggleBannerStatus(bannerId, sellerId);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Banner status updated successfully",
                "banner", banner
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Internal Server Error",
                "message", e.getMessage()
            ));
        }
    }
}
