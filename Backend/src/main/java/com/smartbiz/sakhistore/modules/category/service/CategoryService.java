package com.smartbiz.sakhistore.modules.category.service;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.smartbiz.sakhistore.config.CloudinaryHelper;
import com.smartbiz.sakhistore.modules.auth.sellerauth.model.SellerDetails;
import com.smartbiz.sakhistore.modules.auth.sellerauth.repository.SellerDetailsRepo;
import com.smartbiz.sakhistore.modules.category.model.Category;
import com.smartbiz.sakhistore.modules.category.repository.CategoryRepository;
import com.smartbiz.sakhistore.modules.collection.model.collection;
import com.smartbiz.sakhistore.modules.collection.repository.CollectionRepository;
import com.smartbiz.sakhistore.modules.store.model.StoreDetails;
import com.smartbiz.sakhistore.modules.store.repository.StoreDetailsRepo;
import com.smartbiz.sakhistore.modules.product.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryService {

    @Autowired
    public CategoryRepository categoryRepository;

    @Autowired
    CloudinaryHelper cloudinaryHelper;

    @Autowired
    StoreDetailsRepo storeRepository;

    @Autowired
    CollectionRepository collectionRepository;

    @Autowired
    private SellerDetailsRepo sellerDetailsRepo;

    @Autowired
    private ProductRepository productRepository;

    // ✅ Upload and save Category with images (with seller linking)
    public Category uploadCategoryWithImages(
            String categoryName,
            String businessCategory,
            String description,
            String seoTitleTag,
            String seoMetaDescription,
            List<MultipartFile> categoryImages,
            MultipartFile socialSharingImage,
            Long sellerId) {
        try {
            List<String> categoryImageUrls = new ArrayList<>();

            // ✅ Upload multiple category images in PARALLEL
            List<CompletableFuture<String>> imageFutures = new ArrayList<>();
            if (categoryImages != null && !categoryImages.isEmpty()) {
                imageFutures = categoryImages.stream()
                        .map(image -> CompletableFuture.supplyAsync(() -> cloudinaryHelper.saveImage(image)))
                        .collect(Collectors.toList());
            }

            // ✅ Upload social sharing image in PARALLEL
            CompletableFuture<String> socialImageFuture = null;
            if (socialSharingImage != null && !socialSharingImage.isEmpty()) {
                socialImageFuture = CompletableFuture.supplyAsync(() -> cloudinaryHelper.saveImage(socialSharingImage));
            }

            // Wait for all uploads to complete
            CompletableFuture.allOf(imageFutures.toArray(new CompletableFuture[0])).join();
            if (socialImageFuture != null) {
                socialImageFuture.join();
            }

            // Collect category images results
            for (CompletableFuture<String> future : imageFutures) {
                try {
                    String url = future.get();
                    if (url != null && !url.trim().isEmpty()) {
                        categoryImageUrls.add(url);
                    } else {
                        System.err.println("⚠️ [CategoryService] Image upload returned null or empty URL");
                    }
                } catch (Exception e) {
                    System.err.println("❌ [CategoryService] Error getting image upload result: " + e.getMessage());
                    e.printStackTrace();
                    // Continue processing other images even if one fails
                }
            }

            // Collect social image result
            String socialImageUrl = null;
            if (socialImageFuture != null) {
                try {
                    socialImageUrl = socialImageFuture.get();
                    if (socialImageUrl == null || socialImageUrl.trim().isEmpty()) {
                        System.err.println("⚠️ [CategoryService] Social sharing image upload returned null or empty URL");
                    }
                } catch (Exception e) {
                    System.err.println("❌ [CategoryService] Error getting social image upload result: " + e.getMessage());
                    e.printStackTrace();
                    // Continue even if social image upload fails
                }
            }

            // ✅ Create Category entity
            Category category = new Category();
            category.setCategoryName(categoryName);
            category.setBusinessCategory(businessCategory);
            category.setDescription(description);
            // Default: category is ACTIVE when created
            category.setIsActive(true);
            category.setSeoTitleTag(seoTitleTag);
            category.setSeoMetaDescription(seoMetaDescription);
            // Generate unique slug from category name (SmartBiz: URL-friendly identifier)
            String slug = generateUniqueSlug(categoryName, sellerId);
            category.setSlug(slug);

            if (!categoryImageUrls.isEmpty()) {
                category.setCategoryImage(categoryImageUrls.get(0));
            }
            if (socialImageUrl != null) {
                category.setSocialSharingImage(socialImageUrl);
            }

            // ✅ Link category to seller (prevent cross-seller visibility)
            if (sellerId != null) {
                SellerDetails seller = sellerDetailsRepo.findById(sellerId)
                        .orElseThrow(() -> new RuntimeException("Seller not found with id: " + sellerId));
                category.setSeller(seller);
            }

            return categoryRepository.save(category);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error uploading category with images: " + e.getMessage());
        }
    }

    // ✅ Get all categories (filtered by seller)
    public List<Category> allCategories(Long sellerId) {
        if (sellerId != null) {
            return categoryRepository.findBySeller_SellerId(sellerId);
        }
        return categoryRepository.findAll();
    }

    // ✅ Get all categories (backward compatibility - returns all, should be
    // avoided)
    public List<Category> allCategories() {
        return categoryRepository.findAll();
    }

    // ✅ Add category (with seller linking if sellerId provided)
    public Category addCategory(Category category, Long sellerId) {
        if (sellerId != null) {
            SellerDetails seller = sellerDetailsRepo.findById(sellerId)
                    .orElseThrow(() -> new RuntimeException("Seller not found with id: " + sellerId));
            category.setSeller(seller);
        }
        return categoryRepository.save(category);
    }

    // ✅ Add category (backward compatibility)
    public Category addCategory(Category category) {
        return categoryRepository.save(category);
    }

    // ✅ Get by ID
    public Category findById(Long category_id) {
        return categoryRepository.findById(category_id)
                .orElseThrow(() -> new NoSuchElementException("Category not found with ID: " + category_id));
    }

    // ✅ Get by slug and seller ID (for public store API)
    public Category findBySlugAndSellerId(String slug, Long sellerId) {
        if (slug == null || slug.isEmpty() || sellerId == null) {
            return null;
        }
        try {
            return categoryRepository.findBySlugAndSeller_SellerId(slug, sellerId);
        } catch (Exception e) {
            // Return null if not found (don't throw exception)
            return null;
        }
    }

    // ✅ Delete
    public void deleteCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new NoSuchElementException("Category not found with ID: " + categoryId));

        try {
            // Check if category has associated products
            long productCount = productRepository.countByCategoryId(categoryId);
            if (productCount > 0) {
                throw new RuntimeException("Cannot delete category: It has " + productCount
                        + " product(s) associated with it. Please remove or reassign products first.");
            }
        } catch (RuntimeException e) {
            // Re-throw business logic exceptions
            throw e;
        } catch (Exception e) {
            // Log other exceptions but don't fail deletion if count check fails
            System.err.println(
                    "Warning: Could not check product count for category " + categoryId + ": " + e.getMessage());
            e.printStackTrace();
        }

        try {
            categoryRepository.delete(category);
        } catch (Exception e) {
            // If deletion fails due to foreign key constraint, provide helpful message
            if (e.getMessage() != null && e.getMessage().contains("foreign key")) {
                throw new RuntimeException(
                        "Cannot delete category: It has products associated with it. Please remove or reassign products first.");
            }
            throw new RuntimeException("Failed to delete category: " + e.getMessage(), e);
        }
    }

    // ✅ Search by business category (filtered by seller)
    public List<Category> searchCategoriesByBusiness(String businessCategory, Long sellerId) {
        if (sellerId != null) {
            return categoryRepository.findBySeller_SellerIdAndBusinessCategoryContainingIgnoreCase(sellerId,
                    businessCategory);
        }
        return categoryRepository.findByBusinessCategoryContainingIgnoreCase(businessCategory);
    }

    // ✅ Search by business category (backward compatibility)
    public List<Category> searchCategoriesByBusiness(String businessCategory) {
        return categoryRepository.findByBusinessCategoryContainingIgnoreCase(businessCategory);
    }

    // ✅ Get Collections by Store Name
    public List<collection> getCollectionsByStoreName(String storeName) {

        StoreDetails store = storeRepository.findByStoreName(storeName)
                .orElseThrow(() -> new NoSuchElementException("Store not found"));

        Long sellerId = store.getSeller().getSellerId(); // seller_id exists in store_details

        return collectionRepository.findBySeller_SellerId(sellerId);
    }

    /**
     * Generate slug from category name (SmartBiz: URL-friendly identifier)
     * Ensures uniqueness per seller by appending number if needed
     */
    private String generateSlug(String categoryName) {
        if (categoryName == null || categoryName.trim().isEmpty()) {
            return "category-" + System.currentTimeMillis();
        }
        // Convert to lowercase, replace spaces/special chars with hyphens
        String baseSlug = categoryName.toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
        return baseSlug;
    }

    /**
     * Generate unique slug for category (ensures uniqueness per seller)
     * Made public for use in controller (SmartBiz: same as CollectionService)
     */
    public String generateUniqueSlug(String categoryName, Long sellerId) {
        String baseSlug = generateSlug(categoryName);
        if (sellerId == null) {
            return baseSlug;
        }

        // Check if slug already exists for this seller
        String candidateSlug = baseSlug;
        int counter = 1;
        while (categoryRepository.findBySlugAndSeller_SellerId(candidateSlug, sellerId) != null) {
            candidateSlug = baseSlug + "-" + counter;
            counter++;
        }
        return candidateSlug;
    }

}
