package com.smartbiz.sakhistore.modules.product.service;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.smartbiz.sakhistore.config.CloudinaryHelper;
import com.smartbiz.sakhistore.modules.auth.sellerauth.model.SellerDetails;
import com.smartbiz.sakhistore.modules.auth.sellerauth.repository.SellerDetailsRepo;
import com.smartbiz.sakhistore.modules.category.model.Category;
import com.smartbiz.sakhistore.modules.category.repository.CategoryRepository;
import com.smartbiz.sakhistore.modules.product.model.Product;
import com.smartbiz.sakhistore.modules.product.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductService{

    @Autowired
    public ProductRepository productRepository;

    @Autowired
    CloudinaryHelper cloudinaryHelper;

    @Autowired
    private SellerDetailsRepo sellerDetailsRepo;

    @Autowired
    private CategoryRepository categoryRepository;


    public Product uploadProductWithImages(
            String productName,
            String description,
            Double mrp,
            Double sellingPrice,
            String businessCategory,
            String productCategory,
            Integer inventoryQuantity,
            String customSku,
            String color,
            String size,
            String variant,
            String hsnCode,
            String seoTitleTag,
            String seoMetaDescription,
            List<MultipartFile> productImages,
            MultipartFile socialSharingImage,
            Long sellerId,
            Long categoryId,
            Boolean isBestseller
    ) {
        try {
            List<String> productImageUrls = new ArrayList<>();

            // ✅ Upload multiple product images
            if (productImages != null && !productImages.isEmpty()) {
                for (MultipartFile image : productImages) {
                    String imageUrl = cloudinaryHelper.saveImage(image);
                    if (imageUrl != null) {
                        productImageUrls.add(imageUrl);
                    }
                }
            }

            // ✅ Upload single social sharing image
            String socialImageUrl = null;
            if (socialSharingImage != null && !socialSharingImage.isEmpty()) {
                socialImageUrl = cloudinaryHelper.saveImage(socialSharingImage);
            }

            // ✅ Create Product entity
            Product product = new Product();
            product.setProductName(productName);
            product.setDescription(description);
            product.setMrp(mrp);
            product.setSellingPrice(sellingPrice);
            product.setBusinessCategory(businessCategory);
            product.setProductCategory(productCategory);
            product.setInventoryQuantity(inventoryQuantity);
            product.setCustomSku(customSku);
            product.setColor(color);
            product.setSize(size);
            product.setVariant(variant);
            product.setHsnCode(hsnCode);
            product.setSeoTitleTag(seoTitleTag);
            product.setSeoMetaDescription(seoMetaDescription);
            product.setProductImages(productImageUrls);
            product.setSocialSharingImage(socialImageUrl);
            product.setIsBestseller(isBestseller != null ? isBestseller : false);

            // Link to seller if provided
            if (sellerId != null) {
                SellerDetails seller = sellerDetailsRepo.findById(sellerId)
                        .orElseThrow(() -> new RuntimeException("Seller not found with id: " + sellerId));
                product.setSeller(seller);
            }

            // Link to category - require explicit categoryId to avoid incorrect assignments
            if (categoryId != null) {
                // Use provided categoryId (preferred method)
                Category category = categoryRepository.findById(categoryId)
                        .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));
                product.setCategory(category);
            } else {
                // Try to automatically find category based on productCategory or businessCategory
                // ⚠️ This is a fallback - explicit categoryId should be provided
                Category category = findOrCreateCategoryForProduct(productCategory, businessCategory);
                if (category != null) {
                    product.setCategory(category);
                } else {
                    // If no category found and no categoryId provided, log warning but don't fail
                    // Product will be created without category (category_id will be null)
                    System.out.println("⚠️ WARNING: Product created without category. Please provide categoryId explicitly.");
                }
            }

            // ✅ Save in database
            return productRepository.save(product);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error uploading product with images: " + e.getMessage());
        }
    }

    public List<Product> allProduct(){
        return productRepository.findAll();
    }

    public List<Product> allProductForSeller(Long sellerId) {
        if (sellerId == null) {
            return productRepository.findAll();
        }
        return productRepository.findBySeller_SellerId(sellerId);
    }

    public List<Product> featuredProducts(Long sellerId) {
        if (sellerId == null) {
            return productRepository.findByIsBestsellerTrue();
        }
        return productRepository.findByIsBestsellerTrueAndSeller_SellerId(sellerId);
    }

    /**
     * Get paginated products for a seller with optimized query to avoid N+1 problems
     * @param sellerId The seller ID
     * @param pageable Pageable object with page number and size
     * @return Page of products
     */
    public Page<Product> allProductForSellerPaginated(Long sellerId, Pageable pageable) {
        if (sellerId == null) {
            return productRepository.findAll(pageable);
        }
        // Use optimized query with JOIN FETCH to avoid N+1 queries
        return productRepository.findBySeller_SellerIdWithRelations(sellerId, pageable);
    }




    // Backwards-compatible method used from older code paths
    public Product addproduct(Product product){
        return addproduct(product, null, null);
    }

    public Product addproduct(Product product, Long sellerId){
        return addproduct(product, sellerId, null);
    }

    public Product addproduct(Product product, Long sellerId, Long categoryId){
        if (sellerId != null) {
            SellerDetails seller = sellerDetailsRepo.findById(sellerId)
                    .orElseThrow(() -> new RuntimeException("Seller not found with id: " + sellerId));
            product.setSeller(seller);
        }
        // Ensure bestseller flag is never null so it persists correctly
        product.setIsBestseller(product.getIsBestseller() != null ? product.getIsBestseller() : false);
        // Prefer explicit categoryId parameter if provided
        if (categoryId != null) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));
            product.setCategory(category);
        }
        // Else use category from payload if present
        else if (product.getCategory() != null && product.getCategory().getCategory_id() != null) {
            Long payloadCategoryId = product.getCategory().getCategory_id();
            Category category = categoryRepository.findById(payloadCategoryId)
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + payloadCategoryId));
            product.setCategory(category);
        } else {
            // Automatically find category based on productCategory or businessCategory if not provided
            // ⚠️ This is a fallback - explicit categoryId should be provided
            String productCategory = product.getProductCategory();
            String businessCategory = product.getBusinessCategory();
            Category category = findOrCreateCategoryForProduct(productCategory, businessCategory);
            if (category != null) {
                product.setCategory(category);
            } else {
                // If no category found and no categoryId provided, log warning but don't fail
                System.out.println("⚠️ WARNING: Product created without category. Please provide categoryId explicitly.");
            }
        }
        return productRepository.save(product);
    }




    public Product findbyid(Long product_id){
        return productRepository.findById(product_id).get();
    }

    public void deleteProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NoSuchElementException("Product not found with ID: " + productId));

        productRepository.delete(product);
    }

    // ✅ Update only inventory quantity (stock) for a product
    public Product updateInventoryQuantity(Long productId, Integer inventoryQuantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NoSuchElementException("Product not found with ID: " + productId));
        product.setInventoryQuantity(inventoryQuantity);
        return productRepository.save(product);
    }

    // ✅ Update all editable fields of a product (without changing seller or images)
    public Product updateProduct(Long productId, Product updated) {
        Product existing = productRepository.findById(productId)
                .orElseThrow(() -> new NoSuchElementException("Product not found with ID: " + productId));

        // Basic fields
        existing.setProductName(updated.getProductName());
        existing.setDescription(updated.getDescription());
        existing.setMrp(updated.getMrp());
        existing.setSellingPrice(updated.getSellingPrice());
        existing.setInventoryQuantity(updated.getInventoryQuantity());
        existing.setBusinessCategory(updated.getBusinessCategory());
        existing.setProductCategory(updated.getProductCategory());
        existing.setCustomSku(updated.getCustomSku());
        existing.setColor(updated.getColor());
        existing.setSize(updated.getSize());
        existing.setVariant(updated.getVariant());
        existing.setHsnCode(updated.getHsnCode());
        existing.setSeoTitleTag(updated.getSeoTitleTag());
        existing.setSeoMetaDescription(updated.getSeoMetaDescription());
        existing.setIsBestseller(updated.getIsBestseller() != null ? updated.getIsBestseller() : false);

        // ✅ Update category if provided
        if (updated.getCategory() != null && updated.getCategory().getCategory_id() != null) {
            Long categoryId = updated.getCategory().getCategory_id();
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));
            existing.setCategory(category);
        } else if (updated.getProductCategory() != null || updated.getBusinessCategory() != null) {
            // If category object is not provided but productCategory/businessCategory changed,
            // try to find matching category (but don't default to first category)
            Category category = findOrCreateCategoryForProduct(
                updated.getProductCategory(), 
                updated.getBusinessCategory()
            );
            if (category != null) {
                existing.setCategory(category);
            }
            // If no match found, keep existing category (don't change it)
        }

        // NOTE: We intentionally do NOT modify productImages, socialSharingImage or seller here.
        // Image updates are handled via the upload endpoint; seller relation stays the same.

        return productRepository.save(existing);
    }

    // ✅ Automatically find or create category for product based on productCategory or businessCategory
    // ⚠️ IMPORTANT: This method will NOT default to category 1. It only returns a category if there's an exact match.
    // Products should explicitly provide categoryId to avoid incorrect category assignment.
    private Category findOrCreateCategoryForProduct(String productCategory, String businessCategory) {
        // If no category info provided, return null (don't default to first category)
        if (productCategory == null && businessCategory == null) {
            return null; // Require explicit categoryId instead of defaulting
        }
        
        // Try to find by productCategory name (exact match)
        if (productCategory != null && !productCategory.trim().isEmpty()) {
            List<Category> categories = categoryRepository.findByCategoryNameIgnoreCase(productCategory.trim());
            if (!categories.isEmpty()) {
                return categories.get(0); // Return first match
            }
        }
        
        // Try to find by businessCategory (contains match)
        if (businessCategory != null && !businessCategory.trim().isEmpty()) {
            List<Category> categories = categoryRepository.findByBusinessCategoryContainingIgnoreCase(businessCategory.trim());
            if (!categories.isEmpty()) {
                return categories.get(0); // Return first match
            }
        }
        
        // If no match found, try to find any category with similar businessCategory
        if (businessCategory != null && !businessCategory.trim().isEmpty()) {
            List<Category> allCategories = categoryRepository.findAll();
            String searchTerm = businessCategory.trim().toLowerCase();
            for (Category cat : allCategories) {
                if (cat.getBusinessCategory() != null && 
                    cat.getBusinessCategory().toLowerCase().contains(searchTerm)) {
                    return cat;
                }
            }
        }
        
        // ⚠️ CHANGED: Don't default to first category. Return null if no match found.
        // This forces the caller to explicitly provide categoryId.
        return null; // No matching category found - require explicit categoryId
    }

    //  Get all unique product categories
    public List<String> getAllProductCategories() {
        return productRepository.findAllDistinctProductCategories();
    }


    // Search products by name
    public List<Product> searchProductsByName(String name) {
        return productRepository.findByProductNameContainingIgnoreCase(name);
    }

	 /*   public Product createProduct(Product product) {
	        return productRepository.save(product);
	    }


	    public Product updateProduct(Long id, Product product) {
	        Product existing = getProductById(id);
	        existing.setProductName(product.getProductName());
	        existing.setDescription(product.getDescription());
	        existing.setMrp(product.getMrp());
	        existing.setSellingPrice(product.getSellingPrice());
	        existing.setInventoryQuantity(product.getInventoryQuantity());
	        existing.setBusinessCategory(product.getBusinessCategory());
	        existing.setProductCategory(product.getProductCategory());
	        existing.setColor(product.getColor());
	        existing.setSize(product.getSize());
	        existing.setSeoTitleTag(product.getSeoTitleTag());
	        existing.setSeoMetaDescription(product.getSeoMetaDescription());
	        existing.setSocialSharingImage(product.getSocialSharingImage());
	        existing.setProductImages(product.getProductImages());
	        existing.setSeller(product.getSeller());
	        existing.setUser(product.getUser());
	        existing.setPayment(product.getPayment());
	        existing.setOrder(product.getOrder());
	        existing.setCategory(product.getCategory());
	        return productRepository.save(existing);
	    }


	    public void deleteProduct(Long id) {
	        productRepository.deleteById(id);
	    }


	    public Product getProductById(Long id) {
	        return productRepository.findById(id)
	                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + id));
	    }


	    public List<Product> getAllProducts() {
	        return productRepository.findAll();
	    } */
}
