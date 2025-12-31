package com.smartbiz.sakhistore.modules.order.controller;

import com.smartbiz.sakhistore.modules.order.dto.*;
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

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping({ "/orders", "/api/orders" })
public class OrdersController {

    @Autowired
    private OrdersService ordersService;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired(required = false)
    private com.smartbiz.sakhistore.modules.order.repository.EmailLogRepository emailLogRepository;
    
    @Autowired
    private OrderMapper orderMapper;

    // ===============================
    // Place Order From Cart (Supports both @RequestBody DTO and @RequestParam for backward compatibility)
    // ===============================
    @PostMapping("/place")
    public ResponseEntity<?> placeOrder(
            @RequestBody(required = false) PlaceOrderRequest request,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) Long mobile,
            @RequestParam(required = false) Long storeId,
            @RequestParam(required = false) Long sellerId) {
        try {
            // Support both DTO (new way) and RequestParam (old way)
            Long finalUserId;
            String finalAddress;
            Long finalMobile;
            Long finalStoreId;
            Long finalSellerId;
            
            if (request != null) {
                // New way: Using DTO
                if (!request.isValid()) {
                    return ResponseEntity.badRequest().body(java.util.Map.of(
                            "error", "VALIDATION_ERROR",
                            "message", "Invalid request data",
                            "timestamp", java.time.LocalDateTime.now().toString()));
                }
                finalUserId = request.getUserId();
                finalAddress = request.getAddress();
                finalMobile = request.getMobile();
                finalStoreId = request.getStoreId();
                finalSellerId = request.getSellerId();
            } else {
                // Old way: Using RequestParam (backward compatibility)
                if (userId == null || address == null || mobile == null) {
                    return ResponseEntity.badRequest().body(java.util.Map.of(
                            "error", "VALIDATION_ERROR",
                            "message", "User ID, address, and mobile are required",
                            "timestamp", java.time.LocalDateTime.now().toString()));
                }
                finalUserId = userId;
                finalAddress = address;
                finalMobile = mobile;
                finalStoreId = storeId;
                finalSellerId = sellerId;
            }

            System.out.println("\n" + "=".repeat(60));
            System.out.println("🛒 PLACING ORDER - REQUEST RECEIVED");
            System.out.println("=".repeat(60));
            System.out.println("User ID: " + finalUserId);
            System.out.println("Address: "
                    + (finalAddress != null ? finalAddress.substring(0, Math.min(50, finalAddress.length())) + "..." : "NULL"));
            System.out.println("Mobile: " + finalMobile);
            System.out.println("Store ID: " + finalStoreId);
            System.out.println("Seller ID: " + finalSellerId);
            System.out.println("=".repeat(60) + "\n");

            User user = new User();
            user.setId(finalUserId);

            Orders order = ordersService.placeOrder(user, finalAddress, finalMobile, 
                    finalStoreId, finalSellerId);

            System.out.println("✅ Order placed successfully. Order ID: "
                    + (order.getOrdersId() != null ? order.getOrdersId() : "N/A"));
            System.out.println("=".repeat(60) + "\n");

            // Convert to response DTO
            PlaceOrderResponse placeOrderResponse = new PlaceOrderResponse(
                    order.getOrdersId(),
                    order.getTotalAmount(),
                    order.getOrderStatus() != null ? order.getOrderStatus().name() : null,
                    order.getPaymentStatus() != null ? order.getPaymentStatus().name() : null,
                    order.getCreationTime()
            );
            
            if (order.getPayment() != null) {
                placeOrderResponse.setPaymentId(order.getPayment().getPaymentId());
            }

            return ResponseEntity.ok(placeOrderResponse);

        } catch (IllegalArgumentException e) {
            System.err.println("\n" + "=".repeat(60));
            System.err.println("❌ ORDER PLACEMENT FAILED - VALIDATION ERROR");
            System.err.println("=".repeat(60));
            System.err.println("Error: " + e.getMessage());
            System.err.println("=".repeat(60) + "\n");

            return ResponseEntity.badRequest().body(java.util.Map.of(
                    "error", "VALIDATION_ERROR",
                    "message", e.getMessage(),
                    "timestamp", java.time.LocalDateTime.now().toString()));

        } catch (RuntimeException e) {
            System.err.println("\n" + "=".repeat(60));
            System.err.println("❌ ORDER PLACEMENT FAILED - RUNTIME ERROR");
            System.err.println("=".repeat(60));
            System.err.println("Error: " + e.getMessage());
            System.err.println("Error Type: " + e.getClass().getSimpleName());
            e.printStackTrace();
            System.err.println("=".repeat(60) + "\n");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(java.util.Map.of(
                    "error", "ORDER_PLACEMENT_FAILED",
                    "message", e.getMessage() != null ? e.getMessage() : "Failed to place order",
                    "details", "Please ensure your cart has items and all required fields are filled",
                    "errorType", e.getClass().getSimpleName(),
                    "timestamp", java.time.LocalDateTime.now().toString()));

        } catch (Exception e) {
            System.err.println("\n" + "=".repeat(60));
            System.err.println("❌ ORDER PLACEMENT FAILED - UNEXPECTED ERROR");
            System.err.println("=".repeat(60));
            System.err.println("Error: " + e.getMessage());
            System.err.println("Error Type: " + e.getClass().getSimpleName());
            e.printStackTrace();
            System.err.println("=".repeat(60) + "\n");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(java.util.Map.of(
                    "error", "INTERNAL_SERVER_ERROR",
                    "message", "An unexpected error occurred while placing the order",
                    "details", e.getMessage() != null ? e.getMessage() : "Unknown error",
                    "errorType", e.getClass().getSimpleName(),
                    "timestamp", java.time.LocalDateTime.now().toString()));
        }
    }

    // ===============================
    // Get Order Details (Using DTO)
    // ===============================
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponseDTO> getOrder(@PathVariable Long id) {
        Orders order = ordersService.getOrder(id);
        OrderResponseDTO responseDTO = orderMapper.toOrderResponseDTO(order);
        return ResponseEntity.ok(responseDTO);
    }

    // ===============================
    // Get All Orders of a User (Using DTO)
    // ===============================
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderResponseDTO>> getUserOrders(@PathVariable Long userId) {
        User user = new User();
        user.setId(userId);
        List<Orders> orders = ordersService.getOrdersByUser(user);
        List<OrderResponseDTO> orderDTOs = orderMapper.toOrderResponseDTOList(orders);
        return ResponseEntity.ok(orderDTOs);
    }

    // ===============================
    // Update Order Status (Using DTO)
    // ===============================
    @PutMapping("/update-status/{id}")
    public ResponseEntity<OrderResponseDTO> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        if (!request.isValid()) {
            return ResponseEntity.badRequest().build();
        }
        
        OrderStatus status = OrderStatus.valueOf(request.getOrderStatus());
        Orders order = ordersService.updateOrderStatus(id, status, request.getRejectionReason());
        OrderResponseDTO responseDTO = orderMapper.toOrderResponseDTO(order);
        return ResponseEntity.ok(responseDTO);
    }

    // ===============================
    // Get Orders by Seller ID (Using DTO)
    // Returns all orders containing products from this seller
    // Includes customer information (user details)
    // ===============================
    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<OrderResponseDTO>> getSellerOrders(@PathVariable Long sellerId) {
        List<Orders> orders = ordersService.getOrdersBySellerId(sellerId);
        List<OrderResponseDTO> orderDTOs = orderMapper.toOrderResponseDTOList(orders);
        return ResponseEntity.ok(orderDTOs);
    }

    // ===============================
    // Get All Orders (Using DTO)
    // Returns all orders in the system
    // ===============================
    @GetMapping("/all")
    public ResponseEntity<List<OrderResponseDTO>> getAllOrders() {
        List<Orders> orders = ordersService.getAllOrders();
        List<OrderResponseDTO> orderDTOs = orderMapper.toOrderResponseDTOList(orders);
        return ResponseEntity.ok(orderDTOs);
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
            System.out.println("From: support@smartbiz.ltd");
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
            message.setText(
                    "This is a test email to verify email configuration is working correctly.\n\nIf you receive this email, your email configuration is working!");
            message.setFrom("support@smartbiz.ltd");

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
            response.put("message",
                    "Failed to send test email: " + (e.getMessage() != null ? e.getMessage() : "Unknown error"));
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
                response.put("solution",
                        "Update user email in database: UPDATE users SET email = 'user@example.com' WHERE id = "
                                + userId);
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
                byte[] pdfBytes = com.smartbiz.sakhistore.modules.inventory.model.PdfGenerator
                        .generatePdfBytes(htmlContent);

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
                response.put("message",
                        "Failed to send email: " + (e.getMessage() != null ? e.getMessage() : "Unknown error"));
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
                    java.util.List<com.smartbiz.sakhistore.modules.order.model.EmailLog> logs = emailLogRepository
                            .findByOrderId(orderId);

                    response.put("emailLogCount", logs.size());

                    if (!logs.isEmpty()) {
                        // Get the latest log (most recent)
                        com.smartbiz.sakhistore.modules.order.model.EmailLog latestLog = logs.stream()
                                .max(java.util.Comparator
                                        .comparing(com.smartbiz.sakhistore.modules.order.model.EmailLog::getSentAt))
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
                        response.put("message",
                                "No email logs found for this order. Email may not have been sent yet.");
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
