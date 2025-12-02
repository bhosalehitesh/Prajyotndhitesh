package com.smartbiz.sakhistore.modules.collection.service;

import com.smartbiz.sakhistore.config.CloudinaryHelper;
import com.smartbiz.sakhistore.modules.collection.model.collection;
import com.smartbiz.sakhistore.modules.collection.repository.CollectionRepository;
import com.smartbiz.sakhistore.modules.product.model.Product;
import com.smartbiz.sakhistore.modules.product.repository.ProductRepository;
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

    // ✅ Upload Collection with Multiple Images (collection + socialSharingImage)
    public collection uploadCollectionWithImages(
            String collectionName,
            String description,
            String seoTitleTag,
            String seoMetaDescription,
            List<MultipartFile> collectionImages,
            MultipartFile socialSharingImage
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

            // ✅ Save collection in DB
            return collectionRepository.save(newCollection);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error uploading collection: " + e.getMessage());
        }
    }

    // ✅ Get all collections
    public List<collection> allCollections() {
        return collectionRepository.findAll();
    }

    // ✅ Add / Edit Collection (Generic)
    public collection addCollection(collection col) {
        return collectionRepository.save(col);
    }

    // ✅ Find by ID
    public collection findById(Long id) {
        return collectionRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Collection not found with ID: " + id));
    }

    // ✅ Delete collection
    public void deleteCollection(Long id) {
        collection col = findById(id);
        collectionRepository.delete(col);
    }

    // ✅ Get all collection names
    public List<String> getAllCollectionNames() {
        return collectionRepository.findAllDistinctCollectionNames();
    }

    // ✅ Search by name
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
}
