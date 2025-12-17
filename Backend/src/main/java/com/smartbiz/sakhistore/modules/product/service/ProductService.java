package com.smartbiz.sakhistore.modules.product.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
import com.smartbiz.sakhistore.modules.product.model.ProductVariant;
import com.smartbiz.sakhistore.modules.product.repository.ProductRepository;
import com.smartbiz.sakhistore.modules.product.repository.ProductVariantRepository;
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

    @Autowired
    private ProductVariantRepository productVariantRepository;


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

            // Link to category - MANDATORY (SmartBiz rule)
            Category category = null;
            if (categoryId != null) {
                // Use provided categoryId
                category = categoryRepository.findById(categoryId)
                        .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));
            } else {
                // Automatically find category based on productCategory or businessCategory
                category = findOrCreateCategoryForProduct(productCategory, businessCategory);
                if (category == null) {
                    throw new RuntimeException("Category is required. Please provide categoryId or ensure categories exist in database.");
                }
            }
            product.setCategory(category);

            // Generate slug from product name (SmartBiz: SEO slug)
            String slug = generateSlug(productName);
            product.setSlug(slug);

            // Determine product type: SINGLE (no variants) or MULTI_VARIANT (has color/size)
            String productType = (color != null && !color.trim().isEmpty()) || (size != null && !size.trim().isEmpty()) 
                ? "MULTI_VARIANT" 
                : "SINGLE";
            product.setProductType(productType);

            // ✅ Save product first (needed for variant creation)
            product = productRepository.save(product);

            // ✅ SMARTBIZ RULE: Auto-create variant for single products
            // If SINGLE product → create 1 implicit variant
            // If MULTI_VARIANT → create variant with attributes
            ProductVariant productVariant = createVariantForProduct(
                product,
                customSku,
                mrp,
                sellingPrice,
                inventoryQuantity,
                color,
                size,
                hsnCode
            );
            productVariantRepository.save(productVariant);

            return product;

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

    /**
     * PERMANENT SOLUTION: Automatically mark active products as bestseller for a seller
     * This ensures featured products are always available for any store
     * 
     * @param sellerId - Seller ID to mark products for
     * @param limit - Maximum number of products to mark (default: 10)
     * @return Number of products marked as bestseller
     */
    public int markFeaturedProductsForSeller(Long sellerId, int limit) {
        if (sellerId == null) {
            throw new RuntimeException("Seller ID is required");
        }
        
        // Get active products that are not yet marked as bestseller
        List<Product> activeProducts = productRepository.findBySeller_SellerIdAndIsActive(sellerId, true);
        
        // Filter products that are not bestseller and sort by creation date
        List<Product> productsToMark = activeProducts.stream()
            .filter(p -> p.getIsBestseller() == null || !p.getIsBestseller())
            .sorted((p1, p2) -> {
                if (p1.getCreatedAt() == null && p2.getCreatedAt() == null) return 0;
                if (p1.getCreatedAt() == null) return 1;
                if (p2.getCreatedAt() == null) return -1;
                return p2.getCreatedAt().compareTo(p1.getCreatedAt()); // Newest first
            })
            .limit(limit)
            .toList();
        
        // Mark products as bestseller
        int count = 0;
        for (Product product : productsToMark) {
            product.setIsBestseller(true);
            productRepository.save(product);
            count++;
        }
        
        System.out.println("✅ [markFeaturedProductsForSeller] Marked " + count + " products as bestseller for seller_id " + sellerId);
        return count;
    }

    /**
     * PERMANENT SOLUTION: Mark featured products for all sellers
     * Useful for bulk operations or initial setup
     * 
     * @param limitPerSeller - Maximum number of products to mark per seller (default: 10)
     * @return Total number of products marked
     */
    public int markFeaturedProductsForAllSellers(int limitPerSeller) {
        // Get all sellers that have products
        List<SellerDetails> sellers = sellerDetailsRepo.findAll();
        
        int totalMarked = 0;
        for (SellerDetails seller : sellers) {
            Long sellerId = seller.getSellerId();
            if (sellerId != null) {
                int marked = markFeaturedProductsForSeller(sellerId, limitPerSeller);
                totalMarked += marked;
            }
        }
        
        System.out.println("✅ [markFeaturedProductsForAllSellers] Total products marked: " + totalMarked);
        return totalMarked;
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

    // ✅ Update inventory quantity (stock) for a variant (SmartBiz: stock is on variant, not product)
    public ProductVariant updateVariantStock(Long variantId, Integer stock) {
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new NoSuchElementException("Variant not found with ID: " + variantId));
        variant.setStock(stock);
        // Auto-disable if stock = 0 (SmartBiz rule)
        if (stock == 0) {
            variant.setIsActive(false);
        }
        return productVariantRepository.save(variant);
    }

    // Legacy wrapper: update stock by product ID (used by existing controllers)
    // For now, update the first active variant for the product.
    public Product updateInventoryQuantity(Long productId, Integer inventoryQuantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NoSuchElementException("Product not found with ID: " + productId));

        // Update legacy field for backward compatibility
        product.setInventoryQuantity(inventoryQuantity);

        // Also try to update a variant if it exists
        List<ProductVariant> variants = productVariantRepository.findByProduct_ProductsId(productId);
        if (!variants.isEmpty()) {
            ProductVariant primary = variants.get(0);
            primary.setStock(inventoryQuantity);
            if (inventoryQuantity == 0) {
                primary.setIsActive(false);
            }
            productVariantRepository.save(primary);
        }

        return productRepository.save(product);
    }

    // ✅ Update all editable fields of a product (SmartBiz: price/stock on variants, not product)
    public Product updateProduct(Long productId, Product updated) {
        Product existing = productRepository.findById(productId)
                .orElseThrow(() -> new NoSuchElementException("Product not found with ID: " + productId));

        // Basic product fields (no price/stock - those are on variants)
        existing.setProductName(updated.getProductName());
        existing.setDescription(updated.getDescription());
        existing.setBusinessCategory(updated.getBusinessCategory());
        existing.setProductCategory(updated.getProductCategory());
        existing.setSizeChartImage(updated.getSizeChartImage());
        existing.setSeoTitleTag(updated.getSeoTitleTag());
        existing.setSeoMetaDescription(updated.getSeoMetaDescription());
        existing.setSlug(updated.getSlug() != null ? updated.getSlug() : generateSlug(updated.getProductName()));
        existing.setProductType(updated.getProductType());
        
        // Update category if provided
        if (updated.getCategory() != null && updated.getCategory().getCategory_id() != null) {
            Category category = categoryRepository.findById(updated.getCategory().getCategory_id())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            existing.setCategory(category);
        }
        
        // Update bestseller status
        if (updated.getIsBestseller() != null) {
            existing.setIsBestseller(updated.getIsBestseller());
        }
        
        // Update active status
        if (updated.getIsActive() != null) {
            existing.setIsActive(updated.getIsActive());
        }

        // NOTE: Price/Stock updates are handled via variant update methods.
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

    // =======================
    // SMARTBIZ VARIANT METHODS
    // =======================

    /**
     * Create a variant for a product (SmartBiz architecture)
     * Auto-creates variant for SINGLE products, creates variant with attributes for MULTI_VARIANT
     */
    private ProductVariant createVariantForProduct(
            Product product,
            String sku,
            Double mrp,
            Double sellingPrice,
            Integer stock,
            String color,
            String size,
            String hsnCode
    ) {
        ProductVariant variant = new ProductVariant();
        variant.setProduct(product);
        variant.setSku(sku != null && !sku.trim().isEmpty() ? sku : generateSku(product));
        variant.setMrp(mrp != null ? mrp : 0.0);
        variant.setSellingPrice(sellingPrice != null ? sellingPrice : 0.0);
        variant.setStock(stock != null ? stock : 0);
        variant.setHsnCode(hsnCode);

        // Set attributes if color/size provided (for MULTI_VARIANT products)
        if (color != null || size != null) {
            Map<String, String> attributes = new HashMap<>();
            if (color != null && !color.trim().isEmpty()) {
                attributes.put("color", color.trim());
            }
            if (size != null && !size.trim().isEmpty()) {
                attributes.put("size", size.trim());
            }
            variant.setAttributes(attributes);
        }

        // Auto-disable if stock = 0 (SmartBiz rule)
        if (variant.getStock() == 0) {
            variant.setIsActive(false);
        }

        return variant;
    }

    /**
     * Generate SKU for variant (if not provided)
     */
    private String generateSku(Product product) {
        return "SKU-" + product.getProductsId() + "-" + System.currentTimeMillis();
    }

    /**
     * Generate slug from product name (SmartBiz: URL-friendly identifier)
     */
    private String generateSlug(String productName) {
        if (productName == null || productName.trim().isEmpty()) {
            return "product-" + System.currentTimeMillis();
        }
        // Convert to lowercase, replace spaces/special chars with hyphens
        return productName.toLowerCase()
            .replaceAll("[^a-z0-9]+", "-")
            .replaceAll("^-+|-+$", "");
    }

    /**
     * Create product with multiple variants (SmartBiz: MULTI_VARIANT product)
     * Used when seller defines multiple variants (e.g., different sizes/colors)
     */
    public Product createProductWithVariants(
            String productName,
            String description,
            Long categoryId,
            Long sellerId,
            List<MultipartFile> productImages,
            MultipartFile socialSharingImage,
            List<ProductVariantData> variantDataList,
            String seoTitleTag,
            String seoMetaDescription,
            Boolean isBestseller
    ) {
        // Upload images
        List<String> productImageUrls = new ArrayList<>();
        if (productImages != null && !productImages.isEmpty()) {
            for (MultipartFile image : productImages) {
                String imageUrl = cloudinaryHelper.saveImage(image);
                if (imageUrl != null) {
                    productImageUrls.add(imageUrl);
                }
            }
        }

        String socialImageUrl = null;
        if (socialSharingImage != null && !socialSharingImage.isEmpty()) {
            socialImageUrl = cloudinaryHelper.saveImage(socialSharingImage);
        }

        // Create product
        Product product = new Product();
        product.setProductName(productName);
        product.setDescription(description);
        product.setProductImages(productImageUrls);
        product.setSocialSharingImage(socialImageUrl);
        product.setSeoTitleTag(seoTitleTag);
        product.setSeoMetaDescription(seoMetaDescription);
        product.setIsBestseller(isBestseller != null ? isBestseller : false);
        product.setProductType("MULTI_VARIANT");
        product.setSlug(generateSlug(productName));

        // Link seller
        if (sellerId != null) {
            SellerDetails seller = sellerDetailsRepo.findById(sellerId)
                    .orElseThrow(() -> new RuntimeException("Seller not found with id: " + sellerId));
            product.setSeller(seller);
        }

        // Link category (MANDATORY)
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));
        product.setCategory(category);

        // Save product
        product = productRepository.save(product);

        // Create variants
        List<ProductVariant> variants = new ArrayList<>();
        for (ProductVariantData variantData : variantDataList) {
            ProductVariant variant = new ProductVariant();
            variant.setProduct(product);
            variant.setSku(variantData.getSku());
            variant.setMrp(variantData.getMrp());
            variant.setSellingPrice(variantData.getSellingPrice());
            variant.setStock(variantData.getStock());
            variant.setHsnCode(variantData.getHsnCode());
            variant.setAttributes(variantData.getAttributes());
            
            if (variant.getStock() == 0) {
                variant.setIsActive(false);
            }
            
            variants.add(variant);
        }

        productVariantRepository.saveAll(variants);
        return product;
    }

    /**
     * Inner class for variant data (used in createProductWithVariants)
     */
    public static class ProductVariantData {
        private String sku;
        private Double mrp;
        private Double sellingPrice;
        private Integer stock;
        private String hsnCode;
        private Map<String, String> attributes;

        // Getters and setters
        public String getSku() { return sku; }
        public void setSku(String sku) { this.sku = sku; }
        public Double getMrp() { return mrp; }
        public void setMrp(Double mrp) { this.mrp = mrp; }
        public Double getSellingPrice() { return sellingPrice; }
        public void setSellingPrice(Double sellingPrice) { this.sellingPrice = sellingPrice; }
        public Integer getStock() { return stock; }
        public void setStock(Integer stock) { this.stock = stock; }
        public String getHsnCode() { return hsnCode; }
        public void setHsnCode(String hsnCode) { this.hsnCode = hsnCode; }
        public Map<String, String> getAttributes() { return attributes; }
        public void setAttributes(Map<String, String> attributes) { this.attributes = attributes; }
    }

}