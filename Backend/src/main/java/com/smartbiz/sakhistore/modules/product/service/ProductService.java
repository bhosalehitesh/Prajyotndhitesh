package com.smartbiz.sakhistore.modules.product.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

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
public class ProductService {

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
    private ProductVariantRepository productVariantRepository;

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
            Long categoryId,
            Boolean isBestseller) {
        try {
            List<String> productImageUrls = new ArrayList<>();

            // ✅ Upload multiple product images in PARALLEL
            List<CompletableFuture<String>> imageFutures = new ArrayList<>();
            if (productImages != null && !productImages.isEmpty()) {
                imageFutures = productImages.stream()
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

            // Collect product images results
            for (CompletableFuture<String> future : imageFutures) {
                try {
                    String url = future.get();
                    if (url != null) {
                        productImageUrls.add(url);
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }

            // Collect social image result
            String socialImageUrl = null;
            if (socialImageFuture != null) {
                try {
                    socialImageUrl = socialImageFuture.get();
                } catch (Exception e) {
                    e.printStackTrace();
                }
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
                category = findOrCreateCategoryForProduct(productCategory, businessCategory, sellerId);
                if (category == null) {
                    throw new RuntimeException(
                            "Category is required. Please provide categoryId or ensure categories exist in database.");
                }
            }
            product.setCategory(category);

            // Generate slug from product name (SmartBiz: SEO slug)
            String slug = generateSlug(productName);
            product.setSlug(slug);

            // Determine product type: SINGLE (no variants) or MULTI_VARIANT (has
            // color/size)
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
                    hsnCode);
            productVariantRepository.save(productVariant);

            return product;

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error uploading product with images: " + e.getMessage());
        }
    }

    public List<Product> allProduct() {
        return productRepository.findAll();
    }

    public List<Product> allProductForSeller(Long sellerId) {
        if (sellerId == null) {
            return productRepository.findAll();
        }
        // Use query with JOIN FETCH to ensure category is loaded (needed for categoryId
        // in JSON)
        List<Product> products = productRepository.findBySeller_SellerIdWithRelations(sellerId);

        // Load variants separately to avoid cartesian product issues
        if (!products.isEmpty()) {
            List<Long> productIds = products.stream()
                    .map(Product::getProductsId)
                    .filter(java.util.Objects::nonNull)
                    .collect(java.util.stream.Collectors.toList());

            if (!productIds.isEmpty()) {
                List<ProductVariant> variants = productVariantRepository.findVariantsByProductIds(productIds);
                // Group variants by product ID and set them
                java.util.Map<Long, List<ProductVariant>> variantsByProduct = variants.stream()
                        .collect(java.util.stream.Collectors.groupingBy(v -> v.getProduct().getProductsId()));

                products.forEach(p -> {
                    List<ProductVariant> productVariants = variantsByProduct.getOrDefault(p.getProductsId(),
                            new java.util.ArrayList<>());
                    // Set variants directly instead of clearing to avoid deletion issues
                    // This is just for loading/display, not for persisting changes
                    p.setVariants(productVariants);
                });
            }
        }

        return products;
    }

    /**
     * Get paginated products for a seller with optimized query to avoid N+1
     * problems
     * 
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
     * 
     * @param productId The product ID
     * @param isActive  The new active status
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
            return productRepository
                    .findTop20BySeller_SellerIdAndIsBestsellerTrueAndIsActiveTrueOrderByCreatedAtDesc(sellerId);
        }
        return productRepository.findTop20ByIsBestsellerTrueAndIsActiveTrueOrderByCreatedAtDesc();
    }

    /**
     * PERMANENT SOLUTION: Automatically mark active products as bestseller for a
     * seller
     * This ensures featured products are always available for any store
     * 
     * @param sellerId - Seller ID to mark products for
     * @param limit    - Maximum number of products to mark (default: 10)
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
                    if (p1.getCreatedAt() == null && p2.getCreatedAt() == null)
                        return 0;
                    if (p1.getCreatedAt() == null)
                        return 1;
                    if (p2.getCreatedAt() == null)
                        return -1;
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

        System.out.println("✅ [markFeaturedProductsForSeller] Marked " + count
                + " products as bestseller for seller_id " + sellerId);
        return count;
    }

    /**
     * PERMANENT SOLUTION: Mark featured products for all sellers
     * Useful for bulk operations or initial setup
     * 
     * @param limitPerSeller - Maximum number of products to mark per seller
     *                       (default: 10)
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
    public Product addproduct(Product product) {
        return addproduct(product, null);
    }

    public Product addproduct(Product product, Long sellerId) {
        return addproduct(product, sellerId, null);
    }

    public Product addproduct(Product product, Long sellerId, Long categoryId) {
        if (sellerId != null) {
            SellerDetails seller = sellerDetailsRepo.findById(sellerId)
                    .orElseThrow(() -> new RuntimeException("Seller not found with id: " + sellerId));
            product.setSeller(seller);
        }

        // Link to category - use provided categoryId parameter first, then check
        // product.getCategory()
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
            // Automatically find category based on productCategory or businessCategory if
            // not provided
            String productCategory = product.getProductCategory();
            String businessCategory = product.getBusinessCategory();
            // Use provided sellerId parameter, or fallback to product's seller
            Long productSellerId = sellerId != null ? sellerId 
                    : (product.getSeller() != null ? product.getSeller().getSellerId() : null);
            Category category = findOrCreateCategoryForProduct(productCategory, businessCategory, productSellerId);
            if (category != null) {
                product.setCategory(category);
            }
        }
        return productRepository.save(product);
    }

    public Product findbyid(Long product_id) {
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

    // ✅ Update inventory quantity (stock) for a variant (SmartBiz: stock is on
    // variant, not product)
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

    // ✅ Update all editable fields of a product (SmartBiz: price/stock on variants,
    // not product)
    public Product updateProduct(Long productId, Product updated) {
        Product existing = productRepository.findById(productId)
                .orElseThrow(() -> new NoSuchElementException("Product not found with ID: " + productId));

        // Basic product fields
        if (updated.getProductName() != null) {
            existing.setProductName(updated.getProductName());
        }
        if (updated.getDescription() != null) {
            existing.setDescription(updated.getDescription());
        }
        if (updated.getBusinessCategory() != null) {
            existing.setBusinessCategory(updated.getBusinessCategory());
        }
        if (updated.getProductCategory() != null) {
            existing.setProductCategory(updated.getProductCategory());
        }
        if (updated.getSizeChartImage() != null) {
            existing.setSizeChartImage(updated.getSizeChartImage());
        }
        if (updated.getSeoTitleTag() != null) {
            existing.setSeoTitleTag(updated.getSeoTitleTag());
        }
        if (updated.getSeoMetaDescription() != null) {
            existing.setSeoMetaDescription(updated.getSeoMetaDescription());
        }
        if (updated.getSlug() != null) {
            existing.setSlug(updated.getSlug());
        } else if (updated.getProductName() != null) {
            existing.setSlug(generateSlug(updated.getProductName()));
        }
        if (updated.getProductType() != null) {
            existing.setProductType(updated.getProductType());
        }

        // Update legacy fields for backward compatibility
        if (updated.getMrp() != null) {
            existing.setMrp(updated.getMrp());
        }
        if (updated.getSellingPrice() != null) {
            existing.setSellingPrice(updated.getSellingPrice());
        }
        if (updated.getInventoryQuantity() != null) {
            existing.setInventoryQuantity(updated.getInventoryQuantity());
        }
        if (updated.getCustomSku() != null) {
            existing.setCustomSku(updated.getCustomSku());
        }
        if (updated.getColor() != null) {
            existing.setColor(updated.getColor());
        }
        if (updated.getSize() != null) {
            existing.setSize(updated.getSize());
        }
        if (updated.getHsnCode() != null) {
            existing.setHsnCode(updated.getHsnCode());
        }

        // Update category if provided (check both category object and categoryId field)
        Long categoryIdToSet = null;
        if (updated.getCategory() != null && updated.getCategory().getCategory_id() != null) {
            categoryIdToSet = updated.getCategory().getCategory_id();
        } else if (updated.getCategoryId() != null) {
            categoryIdToSet = updated.getCategoryId();
        }

        if (categoryIdToSet != null) {
            // Extract to final variable for lambda expression
            final Long finalCategoryId = categoryIdToSet;
            Category category = categoryRepository.findById(finalCategoryId)
                    .orElseThrow(() -> new RuntimeException("Category not found with ID: " + finalCategoryId));
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

        // Sync price/stock to variants (SmartBiz: variants are the sellable unit)
        List<ProductVariant> variants = productVariantRepository.findByProduct_ProductsId(productId);
        if (!variants.isEmpty()) {
            // Update first variant (for single-variant products) or all variants
            for (ProductVariant variant : variants) {
                if (updated.getMrp() != null) {
                    variant.setMrp(updated.getMrp());
                }
                if (updated.getSellingPrice() != null) {
                    variant.setSellingPrice(updated.getSellingPrice());
                }
                if (updated.getInventoryQuantity() != null) {
                    variant.setStock(updated.getInventoryQuantity());
                }
                if (updated.getHsnCode() != null) {
                    variant.setHsnCode(updated.getHsnCode());
                }
                if (updated.getCustomSku() != null && variants.size() == 1) {
                    // Only update SKU if single variant (to avoid conflicts)
                    variant.setSku(updated.getCustomSku());
                }
                productVariantRepository.save(variant);
            }
        } else {
            // No variants exist - create a default variant for backward compatibility
            if (updated.getSellingPrice() != null || updated.getMrp() != null
                    || updated.getInventoryQuantity() != null) {
                ProductVariant defaultVariant = new ProductVariant();
                defaultVariant.setProduct(existing);
                defaultVariant.setMrp(updated.getMrp() != null ? updated.getMrp() : 0.0);
                defaultVariant.setSellingPrice(updated.getSellingPrice() != null ? updated.getSellingPrice() : 0.0);
                defaultVariant.setStock(updated.getInventoryQuantity() != null ? updated.getInventoryQuantity() : 0);
                defaultVariant.setSku(updated.getCustomSku());
                defaultVariant.setHsnCode(updated.getHsnCode());
                productVariantRepository.save(defaultVariant);
            }
        }

        // NOTE: We intentionally do NOT modify productImages, socialSharingImage or
        // seller here.
        // Image updates are handled via the upload endpoint; seller relation stays the
        // same.

        return productRepository.save(existing);
    }

    // ✅ Automatically find or create category for product based on productCategory
    // or businessCategory, with seller context for better matching
    private Category findOrCreateCategoryForProduct(String productCategory, String businessCategory, Long sellerId) {
        if (productCategory == null && businessCategory == null) {
            // If no category info, try to get first available category for seller or return null
            if (sellerId != null) {
                List<Category> sellerCategories = categoryRepository.findBySeller_SellerId(sellerId);
                if (!sellerCategories.isEmpty()) {
                    return sellerCategories.get(0); // Return first category for seller as default
                }
            }
            // Fallback to any category if no seller-specific categories exist
            List<Category> allCategories = categoryRepository.findAll();
            if (!allCategories.isEmpty()) {
                return allCategories.get(0); // Return first category as default
            }
            return null; // No categories exist
        }

        List<Category> candidateCategories = new ArrayList<>();

        // STEP 1: Filter by seller first (if sellerId provided)
        if (sellerId != null) {
            // Get all categories for this seller
            candidateCategories = categoryRepository.findBySeller_SellerId(sellerId);
        } else {
            // If no sellerId, search all categories
            candidateCategories = categoryRepository.findAll();
        }

        // STEP 2: Find best match with priority:
        // Priority 1: Match both productCategory name AND businessCategory (exact match)
        if (productCategory != null && !productCategory.trim().isEmpty() 
                && businessCategory != null && !businessCategory.trim().isEmpty()) {
            String productCatLower = productCategory.trim().toLowerCase();
            String businessCatLower = businessCategory.trim().toLowerCase();
            
            for (Category cat : candidateCategories) {
                String catName = (cat.getCategoryName() != null) ? cat.getCategoryName().toLowerCase().trim() : "";
                String catBusiness = (cat.getBusinessCategory() != null) ? cat.getBusinessCategory().toLowerCase().trim() : "";
                
                // Check if both productCategory name and businessCategory match
                if ((catName.equals(productCatLower) || catName.contains(productCatLower) || productCatLower.contains(catName))
                        && (catBusiness.equals(businessCatLower) || catBusiness.contains(businessCatLower) || businessCatLower.contains(catBusiness))) {
                    System.out.println("✅ [ProductService] Found category matching both productCategory and businessCategory: " + cat.getCategoryName());
                    return cat;
                }
            }
        }

        // Priority 2: Match by productCategory name (exact match) - seller-specific
        if (productCategory != null && !productCategory.trim().isEmpty()) {
            String productCatLower = productCategory.trim().toLowerCase();
            for (Category cat : candidateCategories) {
                String catName = (cat.getCategoryName() != null) ? cat.getCategoryName().toLowerCase().trim() : "";
                if (catName.equals(productCatLower) || catName.contains(productCatLower) || productCatLower.contains(catName)) {
                    System.out.println("✅ [ProductService] Found category matching productCategory: " + cat.getCategoryName());
                    return cat;
                }
            }
        }

        // Priority 3: Match by businessCategory (contains match) - seller-specific
        if (businessCategory != null && !businessCategory.trim().isEmpty()) {
            String businessCatLower = businessCategory.trim().toLowerCase();
            
            // If sellerId provided, use seller-specific search
            if (sellerId != null) {
                List<Category> sellerBusinessCategories = categoryRepository
                        .findBySeller_SellerIdAndBusinessCategoryContainingIgnoreCase(sellerId, businessCategory.trim());
                if (!sellerBusinessCategories.isEmpty()) {
                    // If multiple matches, prefer the one that also matches productCategory name (if provided)
                    if (productCategory != null && !productCategory.trim().isEmpty()) {
                        String productCatLower = productCategory.trim().toLowerCase();
                        for (Category cat : sellerBusinessCategories) {
                            String catName = (cat.getCategoryName() != null) ? cat.getCategoryName().toLowerCase().trim() : "";
                            if (catName.equals(productCatLower) || catName.contains(productCatLower) || productCatLower.contains(catName)) {
                                System.out.println("✅ [ProductService] Found seller category matching businessCategory and productCategory: " + cat.getCategoryName());
                                return cat;
                            }
                        }
                    }
                    // Return first match if no productCategory match found
                    System.out.println("✅ [ProductService] Found seller category matching businessCategory: " + sellerBusinessCategories.get(0).getCategoryName());
                    return sellerBusinessCategories.get(0);
                }
            } else {
                // No sellerId - search all categories
                for (Category cat : candidateCategories) {
                    String catBusiness = (cat.getBusinessCategory() != null) ? cat.getBusinessCategory().toLowerCase().trim() : "";
                    if (catBusiness.contains(businessCatLower) || businessCatLower.contains(catBusiness)) {
                        System.out.println("✅ [ProductService] Found category matching businessCategory: " + cat.getCategoryName());
                        return cat;
                    }
                }
            }
        }

        // STEP 3: Last resort - Create new category if none found (Auto-create)
        // Only create if sellerId is provided (to ensure seller association)
        if (sellerId != null) {
            Category newCategory = new Category();
            // Use provided names or defaults
            String name = productCategory != null && !productCategory.trim().isEmpty() ? productCategory.trim()
                    : (businessCategory != null && !businessCategory.trim().isEmpty() ? businessCategory.trim()
                            : "General");

            newCategory.setCategoryName(name);
            newCategory.setBusinessCategory(businessCategory != null ? businessCategory : "General");
            newCategory.setIsActive(true);
            newCategory.setOrderIndex(0);
            newCategory.setSlug(generateSlug(name));
            newCategory.setIsTrending(false); // Default
            
            // Link to seller
            SellerDetails seller = sellerDetailsRepo.findById(sellerId)
                    .orElseThrow(() -> new RuntimeException("Seller not found with id: " + sellerId));
            newCategory.setSeller(seller);

            System.out.println("⚠️ [ProductService] Auto-creating category for seller " + sellerId + ": " + name);
            return categoryRepository.save(newCategory);
        }

        // If no sellerId and no match found, return null
        System.out.println("⚠️ [ProductService] No category found and no sellerId provided - cannot auto-create category");
        return null;
    }

    // Get all unique product categories
    public List<String> getAllProductCategories() {
        return productRepository.findAllDistinctProductCategories();
    }

    // Search products by name
    public List<Product> searchProductsByName(String name) {
        return productRepository.findByProductNameContainingIgnoreCase(name);
    }

    /*
     * public Product createProduct(Product product) {
     * return productRepository.save(product);
     * }
     * 
     * 
     * public Product updateProduct(Long id, Product product) {
     * Product existing = getProductById(id);
     * existing.setProductName(product.getProductName());
     * existing.setDescription(product.getDescription());
     * existing.setMrp(product.getMrp());
     * existing.setSellingPrice(product.getSellingPrice());
     * existing.setInventoryQuantity(product.getInventoryQuantity());
     * existing.setBusinessCategory(product.getBusinessCategory());
     * existing.setProductCategory(product.getProductCategory());
     * existing.setColor(product.getColor());
     * existing.setSize(product.getSize());
     * existing.setSeoTitleTag(product.getSeoTitleTag());
     * existing.setSeoMetaDescription(product.getSeoMetaDescription());
     * existing.setSocialSharingImage(product.getSocialSharingImage());
     * existing.setProductImages(product.getProductImages());
     * existing.setSeller(product.getSeller());
     * existing.setUser(product.getUser());
     * existing.setPayment(product.getPayment());
     * existing.setOrder(product.getOrder());
     * existing.setCategory(product.getCategory());
     * return productRepository.save(existing);
     * }
     * 
     * 
     * public void deleteProduct(Long id) {
     * productRepository.deleteById(id);
     * }
     * 
     * 
     * public Product getProductById(Long id) {
     * return productRepository.findById(id)
     * .orElseThrow(() -> new RuntimeException("Product not found with ID: " + id));
     * }
     * 
     * 
     * public List<Product> getAllProducts() {
     * return productRepository.findAll();
     * }
     */

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
     * Auto-creates variant for SINGLE products, creates variant with attributes for
     * MULTI_VARIANT
     */
    private ProductVariant createVariantForProduct(
            Product product,
            String sku,
            Double mrp,
            Double sellingPrice,
            Integer stock,
            String color,
            String size,
            String hsnCode) {
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
            Boolean isBestseller) {
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
        public String getSku() {
            return sku;
        }

        public void setSku(String sku) {
            this.sku = sku;
        }

        public Double getMrp() {
            return mrp;
        }

        public void setMrp(Double mrp) {
            this.mrp = mrp;
        }

        public Double getSellingPrice() {
            return sellingPrice;
        }

        public void setSellingPrice(Double sellingPrice) {
            this.sellingPrice = sellingPrice;
        }

        public Integer getStock() {
            return stock;
        }

        public void setStock(Integer stock) {
            this.stock = stock;
        }

        public String getHsnCode() {
            return hsnCode;
        }

        public void setHsnCode(String hsnCode) {
            this.hsnCode = hsnCode;
        }

        public Map<String, String> getAttributes() {
            return attributes;
        }

        public void setAttributes(Map<String, String> attributes) {
            this.attributes = attributes;
        }
    }

}