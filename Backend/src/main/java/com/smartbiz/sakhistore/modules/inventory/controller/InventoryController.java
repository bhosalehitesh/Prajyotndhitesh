package com.smartbiz.sakhistore.modules.inventory.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
        import org.springframework.web.multipart.MultipartFile;

import com.smartbiz.sakhistore.common.exceptions.ResourceNotFoundException;
import com.smartbiz.sakhistore.modules.inventory.service.InventoryService;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    @GetMapping("/download")
    public ResponseEntity<?> downloadInventory() {
        try {
            byte[] file = inventoryService.downloadInventory();
            if (file == null || file.length == 0) {
                throw new ResourceNotFoundException("Inventory data not found or file is empty.");
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=inventory.xlsx")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(file);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(404).body("❌ " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("⚠️ Error while downloading inventory: " + e.getMessage());
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadInventory(@RequestParam("file") MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body("❌ Please upload a valid Excel file.");
            }

            inventoryService.uploadInventory(file);
            return ResponseEntity.ok("✅ Inventory updated successfully!");
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(404).body("❌ " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("⚠️ Error while uploading inventory: " + e.getMessage());
        }
    }
}