package com.smartbiz.sakhistore.modules.collection.service;

import com.smartbiz.sakhistore.config.CloudinaryHelper;
import com.smartbiz.sakhistore.modules.collection.model.collection;
import com.smartbiz.sakhistore.modules.collection.repository.CollectionRepository;
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
}
