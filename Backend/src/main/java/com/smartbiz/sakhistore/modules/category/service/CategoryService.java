package com.smartbiz.sakhistore.modules.category.service;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.smartbiz.sakhistore.config.CloudinaryHelper;
import com.smartbiz.sakhistore.modules.category.model.Category;
import com.smartbiz.sakhistore.modules.category.repository.CategoryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryService {

    @Autowired
    public CategoryRepository categoryRepository;

    @Autowired
    CloudinaryHelper cloudinaryHelper;

    // ✅ Upload and save Category with images
    public Category uploadCategoryWithImages(
            String categoryName,
            String businessCategory,
            String description,
            String seoTitleTag,
            String seoMetaDescription,
            List<MultipartFile> categoryImages,
            MultipartFile socialSharingImage
    ) {
        try {
            List<String> categoryImageUrls = new ArrayList<>();

            // ✅ Upload multiple category images
            if (categoryImages != null && !categoryImages.isEmpty()) {
                for (MultipartFile image : categoryImages) {
                    String imageUrl = cloudinaryHelper.saveImage(image);
                    if (imageUrl != null) {
                        categoryImageUrls.add(imageUrl);
                    }
                }
            }

            // ✅ Upload single social sharing image
            String socialImageUrl = null;
            if (socialSharingImage != null && !socialSharingImage.isEmpty()) {
                socialImageUrl = cloudinaryHelper.saveImage(socialSharingImage);
            }

            // ✅ Create Category entity
            Category category = new Category();
            category.setCategoryName(categoryName);
            category.setBusinessCategory(businessCategory);
            category.setDescription(description);
            category.setSeoTitleTag(seoTitleTag);
            category.setSeoMetaDescription(seoMetaDescription);

            if (!categoryImageUrls.isEmpty()) {
                category.setCategoryImage(categoryImageUrls.get(0));
            }
            if (socialImageUrl != null) {
                category.setSocialSharingImage(socialImageUrl);
            }

            return categoryRepository.save(category);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error uploading category with images: " + e.getMessage());
        }
    }

    // ✅ Get all categories
    public List<Category> allCategories() {
        return categoryRepository.findAll();
    }

    // ✅ Add category
    public Category addCategory(Category category) {
        return categoryRepository.save(category);
    }

    // ✅ Get by ID
    public Category findById(Long category_id) {
        return categoryRepository.findById(category_id)
                .orElseThrow(() -> new NoSuchElementException("Category not found with ID: " + category_id));
    }

    // ✅ Delete
    public void deleteCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new NoSuchElementException("Category not found with ID: " + categoryId));
        categoryRepository.delete(category);
    }

    // ✅ Search by business category
    public List<Category> searchCategoriesByBusiness(String businessCategory) {
        return categoryRepository.findByBusinessCategoryContainingIgnoreCase(businessCategory);
    }
}
