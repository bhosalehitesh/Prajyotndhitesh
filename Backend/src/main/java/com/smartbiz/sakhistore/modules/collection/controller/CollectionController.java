package com.smartbiz.sakhistore.modules.collection.controller;

import com.smartbiz.sakhistore.modules.collection.model.collection;
import com.smartbiz.sakhistore.modules.collection.service.CollectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
        import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/collections")
@RequiredArgsConstructor
public class CollectionController {

    @Autowired
    private CollectionService collectionService;

    // ✅ Get all collections
    @GetMapping("/all")
    public List<collection> getAllCollections() {
        return collectionService.allCollections();
    }

    // ✅ Upload Collection with Images
    @PostMapping(value = "/upload", consumes = {"multipart/form-data"})
    public ResponseEntity<?> uploadCollectionWithImages(
            @RequestParam("collectionName") String collectionName,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "seoTitleTag", required = false) String seoTitleTag,
            @RequestParam(value = "seoMetaDescription", required = false) String seoMetaDescription,
            @RequestParam(value = "collectionImages", required = false) List<MultipartFile> collectionImages,
            @RequestParam(value = "socialSharingImage", required = false) MultipartFile socialSharingImage
    ) {
        try {
            collection col = collectionService.uploadCollectionWithImages(
                    collectionName, description, seoTitleTag, seoMetaDescription, collectionImages, socialSharingImage
            );
            return ResponseEntity.ok(col);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }

    // ✅ Add or Edit collection (via JSON)
    @PostMapping("/add")
    public collection addCollection(@RequestBody collection col) {
        return collectionService.addCollection(col);
    }

    // ✅ Get by ID
    @GetMapping("/{id}")
    public collection getById(@PathVariable Long id) {
        return collectionService.findById(id);
    }

    // ✅ Delete collection
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        collectionService.deleteCollection(id);
        return ResponseEntity.ok("✅ Collection with ID " + id + " deleted successfully.");
    }

    // ✅ Get all collection names
    @GetMapping("/names")
    public ResponseEntity<List<String>> getAllCollectionNames() {
        return ResponseEntity.ok(collectionService.getAllCollectionNames());
    }

    // ✅ Search by name
    @GetMapping("/search")
    public ResponseEntity<List<collection>> searchCollections(@RequestParam String name) {
        return ResponseEntity.ok(collectionService.searchCollectionsByName(name));
    }
}
