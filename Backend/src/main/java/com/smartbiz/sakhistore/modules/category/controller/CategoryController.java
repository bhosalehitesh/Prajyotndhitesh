package com.smartbiz.sakhistore.modules.category.controller;

import java.util.List;
import java.util.NoSuchElementException;

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
@CrossOrigin(origins = "*")
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

    // ✅ Edit category (legacy POST endpoint - kept for backward compatibility)
    @PostMapping("/EditCategory")
    public Category editCategory(Category category) {
        return categoryService.addCategory(category);
    }

    // ✅ Toggle trending status for a category (similar to product bestseller)
    // IMPORTANT: This endpoint must be BEFORE /{id} to avoid path conflicts
    @PutMapping("/{id}/trending")
    public ResponseEntity<?> updateCategoryTrendingStatus(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, Boolean> body) {
        try {
            System.out.println("🔄 [CategoryController] Updating trending status for category ID: " + id);
            System.out.println("🔄 [CategoryController] Request body: " + body);
            
            Boolean isTrending = body.get("isTrending");
            if (isTrending == null) {
                System.err.println("❌ [CategoryController] isTrending parameter is null");
                return ResponseEntity.badRequest().body("isTrending parameter is required");
            }
            
            Category category = categoryService.findById(id);
            if (category == null) {
                System.err.println("❌ [CategoryController] Category not found with ID: " + id);
                return ResponseEntity.notFound().build();
            }
            
            System.out.println("✅ [CategoryController] Category found: " + category.getCategoryName());
            category.setIsTrending(isTrending);
            Long sellerId = category.getSeller() != null ? category.getSeller().getSellerId() : null;
            Category updated = categoryService.addCategory(category, sellerId);
            System.out.println("✅ [CategoryController] Category trending status updated successfully");
            return ResponseEntity.ok(updated);
        } catch (NoSuchElementException e) {
            System.err.println("❌ [CategoryController] Category not found: " + e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("❌ [CategoryController] Error updating category trending status " + id + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(java.util.Map.of(
                "error", "Internal Server Error",
                "message", e.getMessage() != null ? e.getMessage() : "Failed to update category trending status"
            ));
        }
    }

    // ✅ Update category (SmartBiz: PUT endpoint for proper REST API - same as collections)
    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(
            @PathVariable Long id,
            @RequestBody Category updatedCategory) {
        try {
            Category existing = categoryService.findById(id);
            
            // Update fields (SmartBiz: same as Collection update logic)
            if (updatedCategory.getCategoryName() != null) {
                existing.setCategoryName(updatedCategory.getCategoryName());
                // Regenerate slug if name changed
                if (updatedCategory.getSlug() == null || updatedCategory.getSlug().isEmpty()) {
                    String newSlug = categoryService.generateUniqueSlug(updatedCategory.getCategoryName(), 
                        existing.getSeller() != null ? existing.getSeller().getSellerId() : null);
                    existing.setSlug(newSlug);
                }
            }
            if (updatedCategory.getBusinessCategory() != null) {
                existing.setBusinessCategory(updatedCategory.getBusinessCategory());
            }
            if (updatedCategory.getDescription() != null) {
                existing.setDescription(updatedCategory.getDescription());
            }
            if (updatedCategory.getCategoryImage() != null) {
                existing.setCategoryImage(updatedCategory.getCategoryImage());
            }
            if (updatedCategory.getSeoTitleTag() != null) {
                existing.setSeoTitleTag(updatedCategory.getSeoTitleTag());
            }
            if (updatedCategory.getSeoMetaDescription() != null) {
                existing.setSeoMetaDescription(updatedCategory.getSeoMetaDescription());
            }
            if (updatedCategory.getSocialSharingImage() != null) {
                existing.setSocialSharingImage(updatedCategory.getSocialSharingImage());
            }
            if (updatedCategory.getIsActive() != null) {
                existing.setIsActive(updatedCategory.getIsActive());
            }
            if (updatedCategory.getIsTrending() != null) {
                existing.setIsTrending(updatedCategory.getIsTrending());
            }
            if (updatedCategory.getOrderIndex() != null) {
                existing.setOrderIndex(updatedCategory.getOrderIndex());
            }
            if (updatedCategory.getSlug() != null && !updatedCategory.getSlug().isEmpty()) {
                existing.setSlug(updatedCategory.getSlug());
            }
            
            Long sellerId = existing.getSeller() != null ? existing.getSeller().getSellerId() : null;
            return ResponseEntity.ok(categoryService.addCategory(existing, sellerId));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Error updating category " + id + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    // ✅ Get category by ID
    @GetMapping("/{category_id}")
    public Category getCategory(@PathVariable Long category_id) {
        return categoryService.findById(category_id);
    }

    // ✅ Delete category (with seller verification)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCategory(@PathVariable Long id, HttpServletRequest httpRequest) {
        try {
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
        } catch (NoSuchElementException e) {
            // Handle category not found (must come before RuntimeException since NoSuchElementException extends RuntimeException)
            return ResponseEntity.status(404).body("Category not found with ID: " + id);
        } catch (RuntimeException e) {
            // Handle business logic errors (e.g., category has products)
            return ResponseEntity.status(400).body(e.getMessage());
        } catch (Exception e) {
            // Handle other errors - log full stack trace for debugging
            System.err.println("Error deleting category " + id + ":");
            e.printStackTrace();
            
            // Return detailed error message
            String errorMessage = e.getMessage();
            if (errorMessage == null || errorMessage.isEmpty()) {
                errorMessage = "An unexpected error occurred while deleting the category.";
            }
            
            // Check for common database constraint errors
            if (errorMessage.contains("foreign key") || errorMessage.contains("constraint")) {
                return ResponseEntity.status(400).body("Cannot delete category: It has products or other data associated with it. Please remove or reassign them first.");
            }
            
            return ResponseEntity.status(500).body("Failed to delete category: " + errorMessage);
        }
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
