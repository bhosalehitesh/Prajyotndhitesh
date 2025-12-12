package com.smartbiz.sakhistore.modules.collection.service;

import com.smartbiz.sakhistore.config.CloudinaryHelper;
import com.smartbiz.sakhistore.modules.collection.model.collection;
import com.smartbiz.sakhistore.modules.collection.repository.CollectionRepository;
import com.smartbiz.sakhistore.modules.product.model.Product;
import com.smartbiz.sakhistore.modules.product.repository.ProductRepository;
import com.smartbiz.sakhistore.modules.auth.sellerauth.model.SellerDetails;
import com.smartbiz.sakhistore.modules.auth.sellerauth.repository.SellerDetailsRepo;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Transactional
public class CollectionService {

    @Autowired
    private CollectionRepository collectionRepository;

    @Autowired
    private CloudinaryHelper cloudinaryHelper;

    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private SellerDetailsRepo sellerDetailsRepo;
    
    @PersistenceContext
    private EntityManager entityManager;

    // ✅ Upload Collection with Multiple Images (collection + socialSharingImage)
    public collection uploadCollectionWithImages(
            String collectionName,
            String description,
            String seoTitleTag,
            String seoMetaDescription,
            List<MultipartFile> collectionImages,
            MultipartFile socialSharingImage,
            Long sellerId
    ) {
        try {
            List<String> collectionImageUrls = new ArrayList<>();

            // ✅ Upload multiple images
            if (collectionImages != null && !collectionImages.isEmpty()) {
                for (MultipartFile image : collectionImages) {
                    String imageUrl = cloudinaryHelper.saveImage(image);
                    if (imageUrl != null) {
                        collectionImageUrls.add(imageUrl);
                    }
                }
            }

            // ✅ Upload social sharing image
            String socialImageUrl = null;
            if (socialSharingImage != null && !socialSharingImage.isEmpty()) {
                socialImageUrl = cloudinaryHelper.saveImage(socialSharingImage);
            }

            // ✅ Create Collection entity
            collection newCollection = new collection();
            newCollection.setCollectionName(collectionName);
            newCollection.setDescription(description);
            newCollection.setSeoTitleTag(seoTitleTag);
            newCollection.setSeoMetaDescription(seoMetaDescription);

            // Save first image as main collectionImage (if available)
            if (!collectionImageUrls.isEmpty()) {
                newCollection.setCollectionImage(collectionImageUrls.get(0));
            }

            newCollection.setSocialSharingImage(socialImageUrl);
            
            // ✅ Link collection to seller (prevent cross-seller visibility)
            if (sellerId != null) {
                SellerDetails seller = sellerDetailsRepo.findById(sellerId)
                        .orElseThrow(() -> new RuntimeException("Seller not found with id: " + sellerId));
                newCollection.setSeller(seller);
            }

            // ✅ Save collection in DB
            return collectionRepository.save(newCollection);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error uploading collection: " + e.getMessage());
        }
    }

    // ✅ Get all collections (filtered by seller)
    public List<collection> allCollections(Long sellerId) {
        if (sellerId != null) {
            return collectionRepository.findBySeller_SellerId(sellerId);
        }
        return collectionRepository.findAll();
    }
    
    // ✅ Get all collections (backward compatibility - returns all, should be avoided)
    public List<collection> allCollections() {
        return collectionRepository.findAll();
    }

    // ✅ Add / Edit Collection (with seller linking if sellerId provided)
    public collection addCollection(collection col, Long sellerId) {
        if (sellerId != null) {
            SellerDetails seller = sellerDetailsRepo.findById(sellerId)
                    .orElseThrow(() -> new RuntimeException("Seller not found with id: " + sellerId));
            col.setSeller(seller);
        }
        return collectionRepository.save(col);
    }
    
    // ✅ Add / Edit Collection (backward compatibility)
    public collection addCollection(collection col) {
        return collectionRepository.save(col);
    }

    // ✅ Find by ID
    public collection findById(Long id) {
        return collectionRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Collection not found with ID: " + id));
    }

    // ✅ Delete collection
    @Transactional
    public void deleteCollection(Long id) {
        // Verify collection exists (will throw NoSuchElementException if not found)
        collection col = findById(id);
        
        try {
            // Get all products that have this collection
            List<Product> productsWithCollection = productRepository.findByCollections_CollectionId(id);
            
            // Remove this collection from all products (owning side controls the relationship)
            if (productsWithCollection != null && !productsWithCollection.isEmpty()) {
                for (Product product : productsWithCollection) {
                    List<collection> productCollections = product.getCollections();
                    if (productCollections != null) {
                        // Remove the collection from the product's list
                        productCollections.removeIf(c -> c != null && c.getCollectionId() != null && c.getCollectionId().equals(id));
                    }
                }
                // Save products to update the join table
                productRepository.saveAll(productsWithCollection);
                productRepository.flush();
            }
            
            // Now delete the collection itself
            collectionRepository.delete(col);
            collectionRepository.flush();
            
        } catch (NoSuchElementException e) {
            throw e; // Re-throw as-is
        } catch (Exception e) {
            System.err.println("========== ERROR DELETING COLLECTION ==========");
            System.err.println("Collection ID: " + id);
            System.err.println("Error Type: " + e.getClass().getName());
            System.err.println("Error Message: " + e.getMessage());
            System.err.println("Stack Trace:");
            e.printStackTrace();
            System.err.println("================================================");
            throw new RuntimeException("Failed to delete collection with ID " + id + ": " + e.getMessage(), e);
        }
    }

    // ✅ Get all collection names (filtered by seller)
    public List<String> getAllCollectionNames(Long sellerId) {
        if (sellerId != null) {
            return collectionRepository.findAllDistinctCollectionNamesBySeller(sellerId);
        }
        return collectionRepository.findAllDistinctCollectionNames();
    }
    
    // ✅ Get all collection names (backward compatibility)
    public List<String> getAllCollectionNames() {
        return collectionRepository.findAllDistinctCollectionNames();
    }

    // ✅ Search by name (filtered by seller)
    public List<collection> searchCollectionsByName(String name, Long sellerId) {
        if (sellerId != null) {
            return collectionRepository.findBySeller_SellerIdAndCollectionNameContainingIgnoreCase(sellerId, name);
        }
        return collectionRepository.findByCollectionNameContainingIgnoreCase(name);
    }
    
    // ✅ Search by name (backward compatibility)
    public List<collection> searchCollectionsByName(String name) {
        return collectionRepository.findByCollectionNameContainingIgnoreCase(name);
    }

    // ✅ Update visibility flag (hide from website)
    public collection updateHideFromWebsite(Long id, boolean hide) {
        collection col = findById(id);
        col.setHideFromWebsite(hide);
        return collectionRepository.save(col);
    }

    // ============================
    // 🔗 COLLECTION ↔ PRODUCTS (Many-to-Many mapping)
    // ============================

    @Transactional
    public collection setProductsForCollection(Long collectionId, List<Long> productIds) {
        collection col = findById(collectionId);

        // Load new products to be linked
        List<Product> newProducts = productRepository.findAllById(productIds);

        // Clear old mappings on owning side: remove this collection from existing products
        List<Product> existingProducts = col.getProducts();
        if (existingProducts != null) {
            for (Product p : existingProducts) {
                if (p.getCollections() != null) {
                    p.getCollections().remove(col);
                }
            }
        }

        // Set new list on inverse side
        col.setProducts(newProducts);

        // Ensure owning side has this collection in its collections list
        for (Product p : newProducts) {
            List<collection> cols = p.getCollections();
            if (cols == null) {
                cols = new java.util.ArrayList<>();
                p.setCollections(cols);
            }
            if (!cols.contains(col)) {
                cols.add(col);
            }
        }

        // Save owning side so join table is updated
        productRepository.saveAll(newProducts);

        // Save collection as well
        return collectionRepository.save(col);
    }

    public long countProductsForCollection(Long collectionId) {
        return productRepository.countByCollections_CollectionId(collectionId);
    }

    /**
     * Add a single product to an existing collection without removing other products.
     */
    @Transactional
    public collection addProductToCollection(Long collectionId, Long productId) {
        collection col = findById(collectionId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NoSuchElementException("Product not found with ID: " + productId));

        // Link collection -> product
        List<Product> products = col.getProducts();
        if (products == null) {
            products = new ArrayList<>();
            col.setProducts(products);
        }
        if (!products.contains(product)) {
            products.add(product);
        }

        // Link product -> collection (owning side)
        List<collection> cols = product.getCollections();
        if (cols == null) {
            cols = new ArrayList<>();
            product.setCollections(cols);
        }
        if (!cols.contains(col)) {
            cols.add(col);
        }

        productRepository.save(product);
        return collectionRepository.save(col);
    }
}