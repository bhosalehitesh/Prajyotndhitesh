package com.smartbiz.sakhistore.modules.category.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
        import org.springframework.web.multipart.MultipartFile;

import com.smartbiz.sakhistore.modules.category.model.Category;
import com.smartbiz.sakhistore.modules.category.service.CategoryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/category")
@RequiredArgsConstructor
public class CategoryController {

    @Autowired
    public CategoryService categoryService;

    // ✅ Get all categories
    @GetMapping("/allCategory")
    public List<Category> allCategories() {
        return categoryService.allCategories();
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
            @RequestParam(value = "socialSharingImage", required = false) MultipartFile socialSharingImage
    ) {
        try {
            Category category = categoryService.uploadCategoryWithImages(
                    categoryName, businessCategory, description,
                    seoTitleTag, seoMetaDescription,
                    categoryImages, socialSharingImage
            );
            return ResponseEntity.ok(category);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }

    // ✅ Add category (normal POST)
    @PostMapping("/addCategory")
    public Category addCategory(Category category) {
        return categoryService.addCategory(category);
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

    // ✅ Delete category
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok("✅ Category with ID " + id + " deleted successfully.");
    }

    // ✅ Find categories by business category
    @GetMapping("/FindByBusinessCategory")
    public ResponseEntity<List<Category>> searchCategories(@RequestParam String businessCategory) {
        List<Category> categories = categoryService.searchCategoriesByBusiness(businessCategory);
        return ResponseEntity.ok(categories);
    }
}
