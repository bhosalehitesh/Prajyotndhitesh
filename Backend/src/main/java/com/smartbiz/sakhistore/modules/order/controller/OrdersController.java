package com.smartbiz.sakhistore.modules.order.controller;

import com.smartbiz.sakhistore.modules.order.model.OrderStatus;
import com.smartbiz.sakhistore.modules.order.model.Orders;
import com.smartbiz.sakhistore.modules.order.service.OrdersService;
import com.smartbiz.sakhistore.modules.customer_user.model.User;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/orders", "/api/orders"})
public class OrdersController {

    @Autowired
    private OrdersService ordersService;
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Autowired(required = false)
    private com.smartbiz.sakhistore.modules.order.repository.EmailLogRepository emailLogRepository;

    // ===============================
    // Place Order From Cart
    // ===============================
    @PostMapping("/place")
    public ResponseEntity<?> placeOrder(
            @RequestParam Long userId,
            @RequestParam String address,
            @RequestParam Long mobile,
            @RequestParam(required = false) Long storeId,
            @RequestParam(required = false) Long sellerId
    ) {
        try {
            // Validate required parameters
            if (userId == null || userId <= 0) {
                return ResponseEntity.badRequest().body(
                    java.util.Map.of("error", "Invalid user ID", "message", "User ID is required and must be greater than 0")
                );
            }
            
            if (address == null || address.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(
                    java.util.Map.of("error", "Missing address", "message", "Delivery address is required")
                );
            }
            
            if (mobile == null || mobile <= 0) {
                return ResponseEntity.badRequest().body(
                    java.util.Map.of("error", "Invalid mobile number", "message", "Mobile number is required and must be valid")
                );
            }
            
            User user = new User();
            user.setId(userId);

            Orders order = ordersService.placeOrder(user, address, mobile, storeId, sellerId);
            return ResponseEntity.ok(order);
            
        } catch (RuntimeException e) {
            // Log the error for debugging
            System.err.println("❌ [OrdersController] Error placing order:");
            System.err.println("   User ID: " + userId);
            System.err.println("   Error: " + e.getMessage());
            e.printStackTrace();
            
            // Return user-friendly error message
            String errorMessage = e.getMessage();
            if (errorMessage == null || errorMessage.isEmpty()) {
                errorMessage = "Failed to place order. Please check that your cart is not empty and all required information is provided.";
            }
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                java.util.Map.of(
                    "error", "Order placement failed",
                    "message", errorMessage,
                    "details", "Please ensure your cart has items and all required fields are filled"
                )
            );
        } catch (Exception e) {
            // Log unexpected errors
            System.err.println("❌ [OrdersController] Unexpected error placing order:");
            System.err.println("   User ID: " + userId);
            System.err.println("   Error: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                java.util.Map.of(
                    "error", "Server error",
                    "message", "An unexpected error occurred while placing your order. Please try again.",
                    "details", e.getMessage() != null ? e.getMessage() : "Unknown error"
                )
            );
        }
    }

    // ===============================
    // Get Order Details
    // ===============================
    @GetMapping("/{id}")
    public Orders getOrder(@PathVariable Long id) {
        return ordersService.getOrder(id);
    }

    // ===============================
    // Get All Orders of a User
    // ===============================
    @GetMapping("/user/{userId}")
    public List<Orders> getUserOrders(@PathVariable Long userId) {
        User user = new User();
        user.setId(userId);
        return ordersService.getOrdersByUser(user);
    }

    // ===============================
    // Update Order Status
    // ===============================
    @PutMapping("/update-status/{id}")
    public Orders updateStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status,
            @RequestParam(required = false) String rejectionReason
    ) {
        return ordersService.updateOrderStatus(id, status, rejectionReason);
    }

    // ===============================
    // Get Orders by Seller ID
    // Returns all orders containing products from this seller
    // Includes customer information (user details)
    // ===============================
    @GetMapping("/seller/{sellerId}")
    public List<Orders> getSellerOrders(@PathVariable Long sellerId) {
        return ordersService.getOrdersBySellerId(sellerId);
    }

    // ===============================
    // Simple Email Test (no order required)
    // ===============================
    @PostMapping("/test-email-simple")
    public ResponseEntity<java.util.Map<String, Object>> testSimpleEmail(@RequestParam String toEmail) {
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        try {
            // Validate email parameter
            if (toEmail == null || toEmail.trim().isEmpty()) {
                response.put("status", "ERROR");
                response.put("message", "Email address is required");
                response.put("error", "VALIDATION_ERROR");
                return ResponseEntity.badRequest().body(response);
            }
            
            System.out.println("\n" + "=".repeat(60));
            System.out.println("🧪 TESTING EMAIL CONFIGURATION");
            System.out.println("=".repeat(60));
            System.out.println("Sending test email to: " + toEmail);
            System.out.println("From: mindrushikesh8@gmail.com");
            System.out.println("=".repeat(60) + "\n");
            
            // Validate mailSender is available
            if (mailSender == null) {
                response.put("status", "ERROR");
                response.put("message", "Email service is not configured. JavaMailSender is null.");
                response.put("error", "CONFIGURATION_ERROR");
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
            }
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail.trim());
            message.setSubject("Test Email from Sakhi Store");
            message.setText("This is a test email to verify email configuration is working correctly.\n\nIf you receive this email, your email configuration is working!");
            message.setFrom("mindrushikesh8@gmail.com");
            
            mailSender.send(message);
            
            System.out.println("✅ Test email sent successfully!");
            System.out.println("=".repeat(60) + "\n");
            
            response.put("status", "SUCCESS");
            response.put("message", "Test email sent successfully to " + toEmail);
            response.put("timestamp", java.time.LocalDateTime.now().toString());
            response.put("note", "Check your inbox (and spam folder) for the test email");
            return ResponseEntity.ok(response);
            
        } catch (org.springframework.mail.MailException e) {
            System.err.println("\n" + "=".repeat(60));
            System.err.println("❌ EMAIL TEST FAILED - MAIL EXCEPTION");
            System.err.println("=".repeat(60));
            System.err.println("Error: " + e.getMessage());
            System.err.println("Error Type: " + e.getClass().getSimpleName());
            e.printStackTrace();
            System.err.println("=".repeat(60) + "\n");
            
            response.put("status", "ERROR");
            response.put("message", "Failed to send test email: " + e.getMessage());
            response.put("error", e.getClass().getSimpleName());
            response.put("details", "Check email configuration in application.properties");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            
        } catch (Exception e) {
            System.err.println("\n" + "=".repeat(60));
            System.err.println("❌ EMAIL TEST FAILED - UNEXPECTED ERROR");
            System.err.println("=".repeat(60));
            System.err.println("Error: " + e.getMessage());
            System.err.println("Error Type: " + e.getClass().getSimpleName());
            e.printStackTrace();
            System.err.println("=".repeat(60) + "\n");
            
            response.put("status", "ERROR");
            response.put("message", "Failed to send test email: " + (e.getMessage() != null ? e.getMessage() : "Unknown error"));
            response.put("error", e.getClass().getSimpleName());
            response.put("details", "Check backend console for full error details");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ===============================
    // Test Email Sending (for debugging)
    // ===============================
    @PostMapping("/test-email/{orderId}")
    public ResponseEntity<java.util.Map<String, Object>> testEmail(@PathVariable Long orderId) {
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        
        try {
            // Validate orderId
            if (orderId == null || orderId <= 0) {
                response.put("status", "ERROR");
                response.put("message", "Invalid order ID: " + orderId);
                response.put("error", "VALIDATION_ERROR");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Fetch order
            Orders order;
            try {
                order = ordersService.getOrder(orderId);
            } catch (RuntimeException e) {
                response.put("status", "ERROR");
                response.put("message", "Order not found with ID: " + orderId);
                response.put("error", "ORDER_NOT_FOUND");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
            // Check if user exists
            if (order.getUser() == null) {
                response.put("status", "ERROR");
                response.put("message", "Order #" + orderId + " does not have an associated user");
                response.put("error", "USER_NOT_FOUND");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            // Check if user has email
            String userEmail = order.getUser().getEmail();
            String userName = order.getUser().getFullName();
            Long userId = order.getUser().getId();
            
            response.put("orderId", orderId);
            response.put("userEmail", userEmail != null ? userEmail : "NO EMAIL FOUND");
            response.put("userName", userName != null ? userName : "N/A");
            response.put("userId", userId);
            response.put("hasEmail", userEmail != null && !userEmail.trim().isEmpty());
            
            if (userEmail == null || userEmail.trim().isEmpty()) {
                response.put("status", "ERROR");
                response.put("message", "User does not have an email address. Cannot send email.");
                response.put("solution", "Update user email in database: UPDATE users SET email = 'user@example.com' WHERE id = " + userId);
                response.put("error", "EMAIL_NOT_FOUND");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            // Try to send email
            try {
                System.out.println("\n" + "=".repeat(60));
                System.out.println("📧 TESTING ORDER INVOICE EMAIL");
                System.out.println("=".repeat(60));
                System.out.println("Order ID: #" + orderId);
                System.out.println("User ID: " + userId);
                System.out.println("User Name: " + userName);
                System.out.println("User Email: " + userEmail);
                System.out.println("=".repeat(60) + "\n");
                
                // Generate PDF
                String htmlContent = com.smartbiz.sakhistore.modules.order.model.OrderInvoiceHTMLBuilder.build(order);
                byte[] pdfBytes = com.smartbiz.sakhistore.modules.inventory.model.PdfGenerator.generatePdfBytes(htmlContent);
                
                System.out.println("✅ PDF generated successfully (" + pdfBytes.length + " bytes)");
                
                // Send email
                ordersService.sendTestEmail(order, pdfBytes);
                
                System.out.println("✅ Test email sent successfully!");
                System.out.println("=".repeat(60) + "\n");
                
                response.put("status", "SUCCESS");
                response.put("message", "Test email sent successfully to " + userEmail);
                response.put("timestamp", java.time.LocalDateTime.now().toString());
                response.put("note", "Check inbox (and spam folder) for the invoice email");
                return ResponseEntity.ok(response);
                
            } catch (org.springframework.mail.MailException e) {
                System.err.println("\n" + "=".repeat(60));
                System.err.println("❌ EMAIL SENDING FAILED - MAIL EXCEPTION");
                System.err.println("=".repeat(60));
                System.err.println("Order ID: #" + orderId);
                System.err.println("User Email: " + userEmail);
                System.err.println("Error: " + e.getMessage());
                System.err.println("Error Type: " + e.getClass().getSimpleName());
                e.printStackTrace();
                System.err.println("=".repeat(60) + "\n");
                
                response.put("status", "ERROR");
                response.put("message", "Failed to send email: " + e.getMessage());
                response.put("error", e.getClass().getSimpleName());
                response.put("details", "Check email configuration in application.properties");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
                
            } catch (Exception e) {
                System.err.println("\n" + "=".repeat(60));
                System.err.println("❌ EMAIL SENDING FAILED - UNEXPECTED ERROR");
                System.err.println("=".repeat(60));
                System.err.println("Order ID: #" + orderId);
                System.err.println("User Email: " + userEmail);
                System.err.println("Error: " + e.getMessage());
                System.err.println("Error Type: " + e.getClass().getSimpleName());
                e.printStackTrace();
                System.err.println("=".repeat(60) + "\n");
                
                response.put("status", "ERROR");
                response.put("message", "Failed to send email: " + (e.getMessage() != null ? e.getMessage() : "Unknown error"));
                response.put("error", e.getClass().getSimpleName());
                response.put("details", "Check backend console for full error details");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
            
        } catch (Exception e) {
            System.err.println("\n" + "=".repeat(60));
            System.err.println("❌ UNEXPECTED ERROR IN TEST EMAIL ENDPOINT");
            System.err.println("=".repeat(60));
            System.err.println("Order ID: " + orderId);
            System.err.println("Error: " + e.getMessage());
            System.err.println("Error Type: " + e.getClass().getSimpleName());
            e.printStackTrace();
            System.err.println("=".repeat(60) + "\n");
            
            response.put("status", "ERROR");
            response.put("message", "Unexpected error: " + (e.getMessage() != null ? e.getMessage() : "Unknown error"));
            response.put("error", e.getClass().getSimpleName());
            response.put("details", "Check backend console for full error details");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ===============================
    // Check Email Status for an Order
    // ===============================
    @GetMapping("/email-status/{orderId}")
    public ResponseEntity<java.util.Map<String, Object>> getEmailStatus(@PathVariable Long orderId) {
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        
        try {
            // Get order
            Orders order = ordersService.getOrder(orderId);
            
            String userEmail = order.getUser() != null ? order.getUser().getEmail() : null;
            String userName = order.getUser() != null ? order.getUser().getFullName() : "N/A";
            boolean hasEmail = userEmail != null && !userEmail.trim().isEmpty();
            
            response.put("orderId", orderId);
            response.put("userEmail", userEmail != null ? userEmail : "NO EMAIL");
            response.put("userName", userName);
            response.put("hasEmail", hasEmail);
            
            // Get email logs from database if repository is available
            if (emailLogRepository != null) {
                try {
                    java.util.List<com.smartbiz.sakhistore.modules.order.model.EmailLog> logs = 
                        emailLogRepository.findByOrderId(orderId);
                    
                    response.put("emailLogCount", logs.size());
                    
                    if (!logs.isEmpty()) {
                        // Get the latest log (most recent)
                        com.smartbiz.sakhistore.modules.order.model.EmailLog latestLog = 
                            logs.stream()
                                .max(java.util.Comparator.comparing(com.smartbiz.sakhistore.modules.order.model.EmailLog::getSentAt))
                                .orElse(null);
                        
                        if (latestLog != null) {
                            response.put("latestEmailStatus", latestLog.getStatus());
                            response.put("latestEmailSentAt", latestLog.getSentAt());
                            response.put("latestEmailRecipient", latestLog.getRecipientEmail());
                            response.put("latestEmailSubject", latestLog.getSubject());
                            if (latestLog.getErrorMessage() != null) {
                                response.put("latestEmailError", latestLog.getErrorMessage());
                            }
                            if (latestLog.getPdfSizeBytes() != null) {
                                response.put("pdfSizeBytes", latestLog.getPdfSizeBytes());
                            }
                        }
                        
                        // Include all logs summary
                        java.util.List<java.util.Map<String, Object>> logsSummary = new java.util.ArrayList<>();
                        for (com.smartbiz.sakhistore.modules.order.model.EmailLog log : logs) {
                            java.util.Map<String, Object> logInfo = new java.util.HashMap<>();
                            logInfo.put("id", log.getId());
                            logInfo.put("status", log.getStatus());
                            logInfo.put("sentAt", log.getSentAt());
                            logInfo.put("recipientEmail", log.getRecipientEmail());
                            if (log.getErrorMessage() != null) {
                                logInfo.put("errorMessage", log.getErrorMessage());
                            }
                            logsSummary.add(logInfo);
                        }
                        response.put("emailLogs", logsSummary);
                    } else {
                        response.put("emailLogs", new java.util.ArrayList<>());
                        response.put("message", "No email logs found for this order. Email may not have been sent yet.");
                    }
                } catch (Exception e) {
                    response.put("emailLogError", "Could not fetch email logs: " + e.getMessage());
                }
            } else {
                response.put("emailLogError", "Email log repository not available");
            }
            
            // Add helpful message
            if (!hasEmail) {
                response.put("warning", "User does not have an email address. Cannot send invoice email.");
                response.put("solution", "Update user email: UPDATE users SET email = 'user@example.com' WHERE id = " + 
                    (order.getUser() != null ? order.getUser().getId() : "USER_ID"));
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("status", "ERROR");
            response.put("message", "Failed to get email status: " + e.getMessage());
            response.put("error", e.getClass().getSimpleName());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
