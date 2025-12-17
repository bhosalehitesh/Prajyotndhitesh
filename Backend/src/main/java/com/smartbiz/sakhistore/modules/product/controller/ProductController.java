package com.smartbiz.sakhistore.modules.product.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.smartbiz.sakhistore.modules.product.model.Product;
import com.smartbiz.sakhistore.modules.product.service.ProductService;
import com.smartbiz.sakhistore.modules.auth.sellerauth.service.JwtService;

import jakarta.servlet.http.HttpServletRequest;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProductController {

	@Autowired
	public ProductService productService;

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
			// If token extraction fails, return null (will return all products for backward
			// compatibility)
		}
		return null;
	}

	@GetMapping("/allProduct")
	public List<Product> allP(HttpServletRequest httpRequest) {
		Long sellerId = extractSellerIdFromToken(httpRequest);
		if (sellerId != null) {
			return productService.allProductForSeller(sellerId);
		}
		return productService.allProduct();
	}

	@PostMapping(value = "/upload", consumes = { "multipart/form-data" })
	public ResponseEntity<?> uploadProductWithMultipleImages(@RequestParam("productName") String productName,
			@RequestParam("description") String description, @RequestParam("mrp") Double mrp,
			@RequestParam("sellingPrice") Double sellingPrice,
			@RequestParam("businessCategory") String businessCategory,
			@RequestParam("productCategory") String productCategory,
			@RequestParam("inventoryQuantity") Integer inventoryQuantity, @RequestParam("customSku") String customSku,
			@RequestParam("color") String color, @RequestParam("size") String size,
			@RequestParam("variant") String variant, @RequestParam("hsnCode") String hsnCode,
			@RequestParam("seoTitleTag") String seoTitleTag,
			@RequestParam("seoMetaDescription") String seoMetaDescription,
			@RequestParam("productImages") List<MultipartFile> productImages,
			@RequestParam("socialSharingImage") MultipartFile socialSharingImage,
			@RequestParam(value = "sellerId", required = false) Long sellerId,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "isBestseller", required = false, defaultValue = "false") Boolean isBestseller) {
		try {
			Product product = productService.uploadProductWithImages(productName, description, mrp, sellingPrice,
					businessCategory, productCategory, inventoryQuantity, customSku, color, size, variant, hsnCode,
                    seoTitleTag, seoMetaDescription, productImages, socialSharingImage, sellerId, categoryId, isBestseller);
			return ResponseEntity.ok(product);
		} catch (Exception e) {
			return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
		}
	}

	@PostMapping("/addProduct")
	public Product addProduct(@RequestBody Product product,
			@RequestParam(value = "sellerId", required = false) Long sellerId) {
		return productService.addproduct(product, sellerId);
	}

	@PostMapping("/Edit Product")
	public Product EditProduct(Product product) {
		return productService.addproduct(product);
	}

	@GetMapping("/{product_id}")
	public Product getProduct(@PathVariable Long product_id) {
		return productService.findbyid(product_id);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
		try {
			productService.deleteProduct(id);
			return ResponseEntity.ok("✅ Product with ID " + id + " deleted successfully.");
		} catch (DataIntegrityViolationException ex) {
			// This usually means the product is referenced by orders, cart items, etc.
			String message = "Cannot delete this product because it is already used in orders or other records. " +
					"Please mark it as Hidden instead of deleting.";
			return ResponseEntity.status(HttpStatus.CONFLICT).body(message);
		} catch (Exception ex) {
			String message = "Failed to delete product: " + ex.getMessage();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(message);
		}
	}

	// Enable/Disable product status (supports both PATCH and POST)
	@RequestMapping(value = "/{id}/status", method = {RequestMethod.PATCH, RequestMethod.POST})
	public ResponseEntity<Product> updateProductStatus(
			@PathVariable Long id,
			@RequestParam("isActive") boolean isActive
	) {
		Product updated = productService.updateActiveStatus(id, isActive);
		return ResponseEntity.ok(updated);
	}

	// ✅ Update product details (JSON, no image upload)
	@PutMapping("/{id}")
	public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Product product) {
		try {
			System.out.println("🔄 [ProductController] Updating product ID: " + id);
			System.out.println("🔄 [ProductController] Received categoryId: " + product.getCategoryId());
			System.out.println("🔄 [ProductController] Product name: " + product.getProductName());
			
			Product updated = productService.updateProduct(id, product);
			System.out.println("✅ [ProductController] Product updated successfully");
			return ResponseEntity.ok(updated);
		} catch (NoSuchElementException e) {
			System.err.println("❌ [ProductController] Product not found: " + e.getMessage());
			return ResponseEntity.status(HttpStatus.NOT_FOUND)
					.body("Product not found with ID: " + id);
		} catch (RuntimeException e) {
			System.err.println("❌ [ProductController] Validation error: " + e.getMessage());
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.body("Failed to update product: " + e.getMessage());
		} catch (Exception e) {
			System.err.println("❌ [ProductController] Error updating product: " + e.getMessage());
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Internal server error: " + e.getMessage());
		}
	}

	// ✅ Update inventory quantity (stock) for a product
	@PutMapping("/{id}/stock")
	public ResponseEntity<Product> updateProductStock(@PathVariable Long id,
			@RequestBody java.util.Map<String, Integer> body) {
		Integer qty = body.get("inventoryQuantity");
		if (qty == null) {
			return ResponseEntity.badRequest().build();
		}
		Product updated = productService.updateInventoryQuantity(id, qty);
		return ResponseEntity.ok(updated);
	}

	// ✅ Update bestseller status for a product
	@PutMapping("/{id}/bestseller")
	public ResponseEntity<Product> updateProductBestsellerStatus(@PathVariable Long id,
			@RequestBody java.util.Map<String, Boolean> body) {
		Boolean isBestseller = body.get("isBestseller");
		if (isBestseller == null) {
			return ResponseEntity.badRequest().build();
		}
		Product product = new Product();
		product.setIsBestseller(isBestseller);
		Product updated = productService.updateProduct(id, product);
		return ResponseEntity.ok(updated);
	}

	// Get products for a specific seller (with pagination support)
	@GetMapping("/sellerProducts")
	public ResponseEntity<?> getProductsForSeller(@RequestParam("sellerId") Long sellerId,
			@RequestParam(value = "page", required = false) Integer page,
			@RequestParam(value = "size", required = false) Integer size,
			@RequestParam(value = "isActive", required = false) Boolean isActive) {

		// If pagination parameters are provided, return paginated response
		if (page != null && size != null) {
			Pageable pageable = PageRequest.of(page, size);
			Page<Product> productPage = productService.allProductForSellerPaginated(sellerId, isActive, pageable);

			Map<String, Object> response = new HashMap<>();
			response.put("content", productPage.getContent());
			response.put("totalElements", productPage.getTotalElements());
			response.put("totalPages", productPage.getTotalPages());
			response.put("currentPage", productPage.getNumber());
			response.put("size", productPage.getSize());
			response.put("hasNext", productPage.hasNext());
			response.put("hasPrevious", productPage.hasPrevious());

			return ResponseEntity.ok(response);
		}

		// Backward compatibility: return list if no pagination params
		List<Product> products = productService.allProductForSeller(sellerId);
		return ResponseEntity.ok(products);
	}

    // Featured / Best Seller products (optional sellerId filter)
    @GetMapping("/featured")
    public ResponseEntity<List<Product>> getFeaturedProducts(
            @RequestParam(value = "sellerId", required = false) Long sellerId) {
        return ResponseEntity.ok(productService.getFeaturedProducts(sellerId));
    }

    /**
     * PERMANENT SOLUTION: Mark active products as bestseller for a specific seller
     * This ensures featured products are always available for any store
     * 
     * Usage: POST /api/products/mark-featured?sellerId=11&limit=10
     */
    @PostMapping("/mark-featured")
    public ResponseEntity<Map<String, Object>> markFeaturedProducts(
            @RequestParam(value = "sellerId", required = true) Long sellerId,
            @RequestParam(value = "limit", defaultValue = "10") int limit) {
        try {
            int count = productService.markFeaturedProductsForSeller(sellerId, limit);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("sellerId", sellerId);
            response.put("productsMarked", count);
            response.put("message", "Successfully marked " + count + " products as bestseller for seller " + sellerId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * PERMANENT SOLUTION: Mark featured products for ALL sellers
     * Useful for bulk operations or initial setup
     * 
     * Usage: POST /api/products/mark-featured-all?limitPerSeller=10
     */
    @PostMapping("/mark-featured-all")
    public ResponseEntity<Map<String, Object>> markFeaturedProductsForAll(
            @RequestParam(value = "limitPerSeller", defaultValue = "10") int limitPerSeller) {
        try {
            int totalMarked = productService.markFeaturedProductsForAllSellers(limitPerSeller);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("totalProductsMarked", totalMarked);
            response.put("limitPerSeller", limitPerSeller);
            response.put("message", "Successfully marked " + totalMarked + " products as bestseller across all sellers");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

	// Endpoint: Get all product categories
	@GetMapping("/categoriesByProductIDFor Collections")
	public ResponseEntity<List<String>> getAllProductCategories() {
		List<String> categories = productService.getAllProductCategories();
		return ResponseEntity.ok(categories);
	}

	// Find By Product Name
	@GetMapping("/Find By Product Name")
	public ResponseEntity<List<Product>> searchProducts(@RequestParam String name) {
		List<Product> products = productService.searchProductsByName(name);
		return ResponseEntity.ok(products);
	}

	/*
	 * // ✅ CREATE Product
	 * 
	 * @PostMapping public ResponseEntity<Product> createProduct(@RequestBody
	 * Product product) { Product created = productService.createProduct(product);
	 * return ResponseEntity.ok(created); }
	 * 
	 * // ✅ UPDATE Product
	 * 
	 * @PutMapping("/{id}") public ResponseEntity<Product>
	 * updateProduct(@PathVariable Long id, @RequestBody Product product) { Product
	 * updated = productService.updateProduct(id, product); return
	 * ResponseEntity.ok(updated); }
	 * 
	 * // ✅ GET Product by ID
	 * 
	 * @GetMapping("/{id}") public ResponseEntity<Product>
	 * getProductById(@PathVariable Long id) { Product product =
	 * productService.getProductById(id); return ResponseEntity.ok(product); }
	 * 
	 * // ✅ GET All Products
	 * 
	 * @GetMapping public ResponseEntity<List<Product>> getAllProducts() {
	 * List<Product> products = productService.getAllProducts(); return
	 * ResponseEntity.ok(products); }
	 * 
	 * // ✅ DELETE Product
	 * 
	 * @DeleteMapping("/{id}") public ResponseEntity<Void>
	 * deleteProduct(@PathVariable Long id) { productService.deleteProduct(id);
	 * return ResponseEntity.noContent().build(); }
	 */

	@GetMapping("/{storeName}/products")
	public ResponseEntity<?> getStoreProducts(@PathVariable String storeName) {
		return ResponseEntity.ok(productService.getProductsByStoreName(storeName));
	}

}