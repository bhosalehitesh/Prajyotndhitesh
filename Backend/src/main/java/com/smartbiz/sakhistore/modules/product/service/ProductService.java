package com.smartbiz.sakhistore.modules.product.service;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.smartbiz.sakhistore.config.CloudinaryHelper;
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
            MultipartFile socialSharingImage
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




    public Product addproduct(Product product){
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
