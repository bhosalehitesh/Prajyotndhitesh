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
import com.smartbiz.sakhistore.modules.store.model.StoreDetails;
import com.smartbiz.sakhistore.modules.store.repository.StoreDetailsRepo;
import com.smartbiz.sakhistore.modules.store.service.StoreDetailsService;

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
    
    @Autowired
    private StoreDetailsRepo storeRepository;

    @Autowired
    private StoreDetailsService storeService;


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
            Long categoryId
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

            // Link to seller if provided
            if (sellerId != null) {
                SellerDetails seller = sellerDetailsRepo.findById(sellerId)
                        .orElseThrow(() -> new RuntimeException("Seller not found with id: " + sellerId));
                product.setSeller(seller);
            }

            // Link to category - automatically find if not provided
            if (categoryId != null) {
                // Use provided categoryId
                Category category = categoryRepository.findById(categoryId)
                        .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));
                product.setCategory(category);
            } else {
                // Automatically find category based on productCategory or businessCategory
                Category category = findOrCreateCategoryForProduct(productCategory, businessCategory);
                if (category != null) {
                    product.setCategory(category);
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

    /**
     * Get paginated products for a seller with optimized query to avoid N+1 problems
     * @param sellerId The seller ID
     * @param isActive Filter by active status (null = all products)
     * @param pageable Pageable object with page number and size
     * @return Page of products
     */
    public Page<Product> allProductForSellerPaginated(Long sellerId, Boolean isActive, Pageable pageable) {
        if (sellerId == null) {
            if (isActive != null) {
                return productRepository.findByIsActive(isActive, pageable);
            }
            return productRepository.findAll(pageable);
        }
        // Use optimized query with JOIN FETCH to avoid N+1 queries
        if (isActive != null) {
            return productRepository.findBySeller_SellerIdAndIsActiveWithRelations(sellerId, isActive, pageable);
        }
        return productRepository.findBySeller_SellerIdWithRelations(sellerId, pageable);
    }

    /**
     * Update product active status (enable/disable)
     * @param productId The product ID
     * @param isActive The new active status
     * @return Updated product
     */
    public Product updateActiveStatus(Long productId, boolean isActive) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NoSuchElementException("Product not found with ID: " + productId));
        product.setIsActive(isActive);
        return productRepository.save(product);
    }

    /**
     * Get featured (bestseller) products, optionally filtered by seller
     */
    public List<Product> getFeaturedProducts(Long sellerId) {
        if (sellerId != null) {
            return productRepository.findTop20BySeller_SellerIdAndIsBestsellerTrueAndIsActiveTrueOrderByCreatedAtDesc(sellerId);
        }
        return productRepository.findTop20ByIsBestsellerTrueAndIsActiveTrueOrderByCreatedAtDesc();
    }




    // Backwards-compatible method used from older code paths
    public Product addproduct(Product product){
        return addproduct(product, null);
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
        
        // Link to category - use provided categoryId parameter first, then check product.getCategory()
        if (categoryId != null) {
            // Use provided categoryId (preferred method)
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));
            product.setCategory(category);
        } else if (product.getCategory() != null && product.getCategory().getCategory_id() != null) {
            // If product has a category with categoryId, fetch the actual Category entity
            Long catId = product.getCategory().getCategory_id();
            Category category = categoryRepository.findById(catId)
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + catId));
            product.setCategory(category);
        } else {
            // Automatically find category based on productCategory or businessCategory if not provided
            String productCategory = product.getProductCategory();
            String businessCategory = product.getBusinessCategory();
            Category category = findOrCreateCategoryForProduct(productCategory, businessCategory);
            if (category != null) {
                product.setCategory(category);
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

    // =======================
    // FEATURED / BEST SELLERS
    // =======================
    // Note: getFeaturedProducts method is already defined above (line 187)
    // This duplicate has been removed to use the Top20 methods with ordering

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
        
        // Update bestseller status
        if (updated.getIsBestseller() != null) {
            existing.setIsBestseller(updated.getIsBestseller());
        }
        
        // Update active status
        if (updated.getIsActive() != null) {
            existing.setIsActive(updated.getIsActive());
        }

        // NOTE: We intentionally do NOT modify productImages, socialSharingImage or seller here.
        // Image updates are handled via the upload endpoint; seller relation stays the same.

        return productRepository.save(existing);
    }

    // ✅ Automatically find or create category for product based on productCategory or businessCategory
    private Category findOrCreateCategoryForProduct(String productCategory, String businessCategory) {
        if (productCategory == null && businessCategory == null) {
            // If no category info, try to get first available category or return null
            List<Category> allCategories = categoryRepository.findAll();
            if (!allCategories.isEmpty()) {
                return allCategories.get(0); // Return first category as default
            }
            return null; // No categories exist
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
        
        // Last resort: return first available category or null
        List<Category> allCategories = categoryRepository.findAll();
        if (!allCategories.isEmpty()) {
            return allCategories.get(0); // Return first category as default
        }
        
        return null; // No categories exist in database
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
    
    public List<Product> getProductsByStoreName(String storeName) {

        StoreDetails store = storeRepository.findByStoreName(storeName)
                .orElseThrow(() -> new NoSuchElementException("Store not found"));

        Long sellerId = store.getSeller().getSellerId();

        return productRepository.findBySeller_SellerId(sellerId);
    }

}