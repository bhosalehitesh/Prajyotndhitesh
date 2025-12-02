package com.smartbiz.sakhistore.modules.product.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.smartbiz.sakhistore.modules.product.model.Product;
import com.smartbiz.sakhistore.modules.product.service.ProductService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    @Autowired
    public ProductService productService;


    @GetMapping("/allProduct")
    public List<Product> allP(){
        return productService.allProduct();


    }


    @PostMapping(value = "/upload", consumes = {"multipart/form-data"})
    public ResponseEntity<?> uploadProductWithMultipleImages(
            @RequestParam("productName") String productName,
            @RequestParam("description") String description,
            @RequestParam("mrp") Double mrp,
            @RequestParam("sellingPrice") Double sellingPrice,
            @RequestParam("businessCategory") String businessCategory,
            @RequestParam("productCategory") String productCategory,
            @RequestParam("inventoryQuantity") Integer inventoryQuantity,
            @RequestParam("customSku") String customSku,
            @RequestParam("color") String color,
            @RequestParam("size") String size,
            @RequestParam("variant") String variant,
            @RequestParam("hsnCode") String hsnCode,
            @RequestParam("seoTitleTag") String seoTitleTag,
            @RequestParam("seoMetaDescription") String seoMetaDescription,
            @RequestParam("productImages") List<MultipartFile> productImages,
            @RequestParam("socialSharingImage") MultipartFile socialSharingImage
    ) {
        try {
            Product product = productService.uploadProductWithImages(
                    productName, description, mrp, sellingPrice, businessCategory,
                    productCategory, inventoryQuantity, customSku, color, size,
                    variant, hsnCode, seoTitleTag, seoMetaDescription,
                    productImages, socialSharingImage
            );
            return ResponseEntity.ok(product);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }

    @PostMapping("/addProduct")
    public Product addProduct(@RequestBody Product product) {
        return productService.addproduct(product);
    }

    @PostMapping("/Edit Product")
    public Product EditProduct(Product product) {
        return productService.addproduct(product);
    }

    @GetMapping("/{product_id}")
    public Product getProduct(@PathVariable Long product_id){
        return productService.findbyid(product_id);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok("✅ Product with ID " + id + " deleted successfully.");
    }

    // Endpoint: Get all product categories
    @GetMapping("/categoriesByProductIDFor Collections")
    public ResponseEntity<List<String>> getAllProductCategories() {
        List<String> categories = productService.getAllProductCategories();
        return ResponseEntity.ok(categories);
    }

    //Find By Product Name
    @GetMapping("/Find By Product Name")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam String name) {
        List<Product> products = productService.searchProductsByName(name);
        return ResponseEntity.ok(products);
    }



   /* // ✅ CREATE Product
    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        Product created = productService.createProduct(product);
        return ResponseEntity.ok(created);
    }

    // ✅ UPDATE Product
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        Product updated = productService.updateProduct(id, product);
        return ResponseEntity.ok(updated);
    }

    // ✅ GET Product by ID
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }

    // ✅ GET All Products
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    // ✅ DELETE Product
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    } */
}
