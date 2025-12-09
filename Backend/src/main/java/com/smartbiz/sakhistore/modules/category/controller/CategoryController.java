package com.smartbiz.sakhistore.modules.category.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
        import org.springframework.web.multipart.MultipartFile;

import com.smartbiz.sakhistore.modules.category.model.Category;
import com.smartbiz.sakhistore.modules.category.service.CategoryService;
import com.smartbiz.sakhistore.modules.auth.sellerauth.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/category")
@RequiredArgsConstructor
public class CategoryController {

    @Autowired
    public CategoryService categoryService;
    
    @Autowired
    private JwtService jwtService;

    // ✅ Get all categories (filtered by authenticated seller)
    @GetMapping("/allCategory")
    public List<Category> allCategories(HttpServletRequest httpRequest) {
        Long sellerId = extractSellerIdFromToken(httpRequest);
        return categoryService.allCategories(sellerId);
    }
    
    // Helper method to extract sellerId from JWT token
    private Long extractSellerIdFromToken(HttpServletRequest httpRequest) {
        try {
            String authHeader = httpRequest.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                return jwtService.extractUserId(token);
            }
        } catch (Exception e) {
            // If token extraction fails, return null (will return all categories for backward compatibility)
        }
        return null;
    }

    // ✅ Upload category with multiple images (category + social)
    @PostMapping(value = "/upload", consumes = {"multipart/form-data"})
    public ResponseEntity<?> uploadCategoryWithImages(
            @RequestParam("categoryName") String categoryName,
            @RequestParam("businessCategory") String businessCategory,
            @RequestParam("description") String description,
            @RequestParam("seoTitleTag") String seoTitleTag,
            @RequestParam("seoMetaDescription") String seoMetaDescription,
            @RequestParam(value = "categoryImages", required = false) List<MultipartFile> categoryImages,
            @RequestParam(value = "socialSharingImage", required = false) MultipartFile socialSharingImage,
            HttpServletRequest httpRequest
    ) {
        try {
            Long sellerId = extractSellerIdFromToken(httpRequest);
            if (sellerId == null) {
                return ResponseEntity.status(401).body("Authentication required. Please provide a valid JWT token.");
            }
            
            Category category = categoryService.uploadCategoryWithImages(
                    categoryName, businessCategory, description,
                    seoTitleTag, seoMetaDescription,
                    categoryImages, socialSharingImage, sellerId
            );
            return ResponseEntity.ok(category);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }

    // ✅ Add category (normal POST)
    @PostMapping("/addCategory")
    public Category addCategory(Category category, HttpServletRequest httpRequest) {
        Long sellerId = extractSellerIdFromToken(httpRequest);
        return categoryService.addCategory(category, sellerId);
    }

    // ✅ Edit category
    @PostMapping("/EditCategory")
    public Category editCategory(Category category) {
        return categoryService.addCategory(category);
    }

    // ✅ Get category by ID
    @GetMapping("/{category_id}")
    public Category getCategory(@PathVariable Long category_id) {
        return categoryService.findById(category_id);
    }

    // ✅ Delete category (with seller verification)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCategory(@PathVariable Long id, HttpServletRequest httpRequest) {
        Long sellerId = extractSellerIdFromToken(httpRequest);
        if (sellerId == null) {
            return ResponseEntity.status(401).body("Authentication required. Please provide a valid JWT token.");
        }
        
        // Verify category belongs to seller
        Category category = categoryService.findById(id);
        if (category.getSeller() == null || !category.getSeller().getSellerId().equals(sellerId)) {
            return ResponseEntity.status(403).body("You can only delete your own categories.");
        }
        
        categoryService.deleteCategory(id);
        return ResponseEntity.ok("✅ Category with ID " + id + " deleted successfully.");
    }

    // ✅ Find categories by business category (filtered by authenticated seller)
    @GetMapping("/FindByBusinessCategory")
    public ResponseEntity<List<Category>> searchCategories(
            @RequestParam String businessCategory,
            HttpServletRequest httpRequest) {
        Long sellerId = extractSellerIdFromToken(httpRequest);
        List<Category> categories = categoryService.searchCategoriesByBusiness(businessCategory, sellerId);
        return ResponseEntity.ok(categories);
    }
}
