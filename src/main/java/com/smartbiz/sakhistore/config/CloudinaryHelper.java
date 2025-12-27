package com.smartbiz.sakhistore.config;

import java.io.IOException;
import java.net.SocketException;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

@Component
public class CloudinaryHelper {

    @Value("${cloudinary.api.name}")
    private String name;

    @Value("${cloudinary.api.key}")
    private String key;

    @Value("${cloudinary.api.secret}")
    private String secret;

    private static final int MAX_RETRIES = 3;
    private static final long RETRY_DELAY_MS = 1000; // 1 second

    /**
     * Save image to Cloudinary with retry logic for network errors
     */
    public String saveImage(MultipartFile image) {
        return saveImageWithRetry(image, "ecommerce", 0);
    }

    /**
     * Save image to Cloudinary with retry logic for network errors
     */
    public String saveImage(MultipartFile image, String folder) {
        return saveImageWithRetry(image, folder, 0);
    }

    /**
     * Internal method with retry logic for network errors
     */
    private String saveImageWithRetry(MultipartFile image, String folder, int attempt) {
        String url = "cloudinary://" + key + ":" + secret + "@" + name;
        Cloudinary cloudinary = new Cloudinary(url);

        try {
            // Read image bytes
            byte[] picture = new byte[image.getInputStream().available()];
            image.getInputStream().read(picture);

            // Upload to Cloudinary
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = (Map<String, Object>) cloudinary.uploader().upload(
                picture, 
                ObjectUtils.asMap("folder", folder)
            );
            
            String imageUrl = (String) uploadResult.get("url");
            System.out.println("✅ [Cloudinary] Image uploaded successfully: " + imageUrl);
            return imageUrl;

        } catch (IOException e) {
            // Check if it's a network connectivity error (SocketException or ConnectException)
            if (e instanceof SocketException || e instanceof java.net.ConnectException) {
                // Network connectivity errors - retry
                if (attempt < MAX_RETRIES) {
                    System.err.println("⚠️ [Cloudinary] Network error (attempt " + (attempt + 1) + "/" + MAX_RETRIES + "): " + e.getMessage());
                    System.err.println("   Retrying in " + RETRY_DELAY_MS + "ms...");
                    
                    try {
                        Thread.sleep(RETRY_DELAY_MS * (attempt + 1)); // Exponential backoff
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        System.err.println("❌ [Cloudinary] Retry interrupted");
                        return null;
                    }
                    
                    return saveImageWithRetry(image, folder, attempt + 1);
                } else {
                    System.err.println("❌ [Cloudinary] Failed after " + MAX_RETRIES + " attempts: " + e.getMessage());
                    e.printStackTrace();
                    return null;
                }
            } else {
                // Other IO errors - don't retry
                System.err.println("❌ [Cloudinary] IO error: " + e.getMessage());
                e.printStackTrace();
                return null;
            }
        } catch (Exception e) {
            // Any other errors
            System.err.println("❌ [Cloudinary] Unexpected error: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
}
