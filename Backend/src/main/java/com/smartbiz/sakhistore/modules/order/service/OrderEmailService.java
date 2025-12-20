package com.smartbiz.sakhistore.modules.order.service;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import com.smartbiz.sakhistore.modules.order.model.Orders;
import com.smartbiz.sakhistore.modules.order.model.EmailLog;
import com.smartbiz.sakhistore.modules.order.repository.EmailLogRepository;
import com.smartbiz.sakhistore.modules.customer_user.model.User;
import com.smartbiz.sakhistore.modules.customer_user.repository.UserRepository;

import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Service
public class OrderEmailService {

    private final JavaMailSender mailSender;
    
    @Autowired(required = false)
    private EmailLogRepository emailLogRepository;
    
    @Autowired(required = false)
    private UserRepository userRepository;

    public OrderEmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOrderInvoiceEmail(Orders order, byte[] pdfBytes) {
        Long orderId = order != null ? order.getOrdersId() : null;
        String userEmail = null;
        String userName = "Customer";
        Integer pdfSize = pdfBytes != null ? pdfBytes.length : 0;
        
        try {
            // Validate order
            if (order == null) {
                throw new IllegalArgumentException("Order cannot be null");
            }
            
            if (orderId == null) {
                throw new IllegalArgumentException("Order ID cannot be null");
            }
            
            // Get user email - ALWAYS fetch fresh from database to get latest email
            if (order.getUser() != null) {
                Long userId = order.getUser().getId();
                String emailFromOrder = order.getUser().getEmail();
                
                System.out.println("\n" + "=".repeat(60));
                System.out.println("🔍 FETCHING USER EMAIL FROM DATABASE");
                System.out.println("=".repeat(60));
                System.out.println("User ID: " + userId);
                System.out.println("Email from Order object: " + (emailFromOrder != null ? emailFromOrder : "NULL"));
                
                // Fetch fresh user from database to get latest email
                if (userRepository != null && userId != null) {
                    try {
                        Optional<User> freshUserOpt = userRepository.findById(userId);
                        if (freshUserOpt.isPresent()) {
                            User freshUser = freshUserOpt.get();
                            String emailFromDb = freshUser.getEmail();
                            
                            System.out.println("Email from Database: " + (emailFromDb != null ? emailFromDb : "NULL"));
                            
                            // Use email from database (most up-to-date)
                            if (emailFromDb != null && !emailFromDb.trim().isEmpty()) {
                                userEmail = emailFromDb.trim();
                                System.out.println("✅ Using email from database: " + userEmail);
                            } else {
                                // Fallback to email from order object if database doesn't have it
                                userEmail = emailFromOrder;
                                System.out.println("⚠️ Database email is null/empty, using email from order object: " + 
                                    (userEmail != null ? userEmail : "NULL"));
                            }
                            
                            userName = freshUser.getFullName() != null 
                                ? freshUser.getFullName() 
                                : "Customer";
                        } else {
                            System.out.println("⚠️ User not found in database, using email from order object");
                            userEmail = emailFromOrder;
                            userName = order.getUser().getFullName() != null 
                                ? order.getUser().getFullName() 
                                : "Customer";
                        }
                    } catch (Exception dbError) {
                        System.err.println("⚠️ Error fetching user from database: " + dbError.getMessage());
                        System.err.println("   Falling back to email from order object");
                        userEmail = emailFromOrder;
                        userName = order.getUser().getFullName() != null 
                            ? order.getUser().getFullName() 
                            : "Customer";
                    }
                } else {
                    System.out.println("⚠️ UserRepository not available, using email from order object");
                    userEmail = emailFromOrder;
                    userName = order.getUser().getFullName() != null 
                        ? order.getUser().getFullName() 
                        : "Customer";
                }
                
                System.out.println("Final Email to use: " + (userEmail != null ? userEmail : "NULL"));
                System.out.println("=".repeat(60) + "\n");
            }

            // Skip if no email - but still log it
            if (userEmail == null || userEmail.trim().isEmpty()) {
                System.out.println("\n" + "=".repeat(60));
                System.out.println("⚠️ EMAIL NOT SENT - NO EMAIL ADDRESS");
                System.out.println("=".repeat(60));
                System.out.println("Order ID: #" + orderId);
                System.out.println("User ID: " + (order.getUser() != null ? order.getUser().getId() : "N/A"));
                System.out.println("User Name: " + userName);
                System.out.println("User Phone: " + (order.getUser() != null ? order.getUser().getPhone() : "N/A"));
                System.out.println("User Email: NULL or EMPTY");
                System.out.println("=".repeat(60));
                System.out.println("💡 SOLUTION: User needs to add email address to their profile.");
                System.out.println("   Update user email in database: UPDATE users SET email = 'user@example.com' WHERE id = [USER_ID]");
                System.out.println("=".repeat(60) + "\n");
                
                // Log to database even when email is missing
                if (emailLogRepository != null) {
                    try {
                        EmailLog emailLog = new EmailLog();
                        emailLog.setOrderId(orderId);
                        emailLog.setRecipientEmail("NO_EMAIL_PROVIDED");
                        emailLog.setSubject("Your Order Invoice - Order #" + orderId);
                        emailLog.setStatus("FAILED");
                        emailLog.setErrorMessage("User does not have an email address configured");
                        emailLog.setPdfSizeBytes(pdfSize);
                        emailLog.setSentAt(LocalDateTime.now());
                        emailLogRepository.save(emailLog);
                        System.out.println("📝 Email log saved to database (ID: " + emailLog.getId() + ")");
                    } catch (Exception logError) {
                        System.err.println("⚠️ Failed to save email log to database: " + logError.getMessage());
                    }
                }
                return;
            }

            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            
            System.out.println("\n" + "=".repeat(60));
            System.out.println("📧 SENDING ORDER INVOICE EMAIL");
            System.out.println("=".repeat(60));
            System.out.println("Timestamp: " + timestamp);
            System.out.println("To: " + userEmail);
            System.out.println("Customer: " + userName);
            System.out.println("Order ID: #" + orderId);
            System.out.println("Total Amount: ₹" + (order.getTotalAmount() != null ? order.getTotalAmount() : "0.00"));
            System.out.println("PDF Attachment Size: " + pdfSize + " bytes");
            System.out.println("From: mindrushikesh8@gmail.com");
            System.out.println("Subject: Your Order Invoice - Order #" + orderId);
            System.out.println("=".repeat(60) + "\n");

            // Build email template with error handling
            String htmlContent = null;
            try {
                htmlContent = com.smartbiz.sakhistore.modules.order.model.OrderInvoiceEmailHTMLBuilder.build(order);
                if (htmlContent == null || htmlContent.trim().isEmpty()) {
                    throw new RuntimeException("Email template is null or empty");
                }
                System.out.println("✅ Email template generated successfully (" + htmlContent.length() + " characters)");
            } catch (Exception templateError) {
                System.err.println("❌ Failed to generate email template: " + templateError.getMessage());
                templateError.printStackTrace();
                throw new RuntimeException("Failed to generate email template: " + templateError.getClass().getSimpleName() + " - " + 
                    (templateError.getMessage() != null ? templateError.getMessage() : "Unknown error"), templateError);
            }

            // Create and send email
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(userEmail);
            helper.setSubject("Your Order Invoice - Order #" + orderId);
            helper.setText(htmlContent, true);

            // Attach PDF
            if (pdfBytes != null && pdfBytes.length > 0) {
                helper.addAttachment(
                        "Order_" + orderId + "_Invoice.pdf",
                        new ByteArrayResource(pdfBytes)
                );
                System.out.println("✅ PDF attachment added (" + pdfSize + " bytes)");
            } else {
                System.out.println("⚠️ Warning: PDF bytes are null or empty, skipping attachment");
            }

            // Send email
            mailSender.send(message);

            // Success log with detailed information
            String successTimestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            System.out.println("=".repeat(60));
            System.out.println("✅ EMAIL SENT SUCCESSFULLY!");
            System.out.println("=".repeat(60));
            System.out.println("Sent At: " + successTimestamp);
            System.out.println("Recipient: " + userEmail);
            System.out.println("Order ID: #" + orderId);
            System.out.println("Customer: " + userName);
            System.out.println("PDF File: Order_" + orderId + "_Invoice.pdf");
            System.out.println("Status: DELIVERED TO SMTP SERVER");
            System.out.println("=".repeat(60));
            System.out.println("📬 Email should arrive in recipient's inbox within a few minutes.");
            System.out.println("💡 Check recipient's inbox (and spam folder) to confirm delivery.\n");

            // Log to database if repository is available
            if (emailLogRepository != null) {
                try {
                    EmailLog emailLog = new EmailLog();
                    emailLog.setOrderId(orderId);
                    emailLog.setRecipientEmail(userEmail);
                    emailLog.setSubject("Your Order Invoice - Order #" + orderId);
                    emailLog.setStatus("SUCCESS");
                    emailLog.setPdfSizeBytes(pdfSize);
                    emailLog.setSentAt(LocalDateTime.now());
                    emailLogRepository.save(emailLog);
                    System.out.println("📝 Email log saved to database (ID: " + emailLog.getId() + ")");
                } catch (Exception e) {
                    System.err.println("⚠️ Failed to save email log to database: " + e.getMessage());
                    e.printStackTrace();
                }
            }

        } catch (Exception e) {
            String errorTimestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            System.out.println("\n" + "=".repeat(60));
            System.out.println("❌ ERROR SENDING ORDER EMAIL");
            System.out.println("=".repeat(60));
            System.out.println("Timestamp: " + errorTimestamp);
            System.out.println("Order ID: #" + orderId);
            System.out.println("Recipient: " + (userEmail != null ? userEmail : "N/A"));
            System.out.println("Error Class: " + e.getClass().getName());
            System.out.println("Error Message: " + (e.getMessage() != null ? e.getMessage() : "NULL"));
            System.out.println("Error Type: " + e.getClass().getSimpleName());
            
            // Print cause if available
            if (e.getCause() != null) {
                System.out.println("Cause: " + e.getCause().getClass().getName());
                System.out.println("Cause Message: " + (e.getCause().getMessage() != null ? e.getCause().getMessage() : "NULL"));
            }
            
            System.out.println("=".repeat(60));
            System.out.println("Full Stack Trace:");
            e.printStackTrace();
            System.out.println("=".repeat(60) + "\n");
            
            // Log error to database with comprehensive error message
            if (emailLogRepository != null && orderId != null) {
                try {
                    EmailLog emailLog = new EmailLog();
                    emailLog.setOrderId(orderId);
                    emailLog.setRecipientEmail(userEmail != null ? userEmail : "N/A");
                    emailLog.setSubject("Your Order Invoice - Order #" + orderId);
                    emailLog.setStatus("FAILED");
                    emailLog.setPdfSizeBytes(pdfSize); // Always set PDF size, even on failure
                    emailLog.setSentAt(LocalDateTime.now());
                    
                    // Build comprehensive error message
                    StringBuilder errorMsg = new StringBuilder();
                    errorMsg.append("Class: ").append(e.getClass().getSimpleName());
                    if (e.getMessage() != null) {
                        errorMsg.append(" | Message: ").append(e.getMessage());
                    }
                    if (e.getCause() != null) {
                        errorMsg.append(" | Cause: ").append(e.getCause().getClass().getSimpleName());
                        if (e.getCause().getMessage() != null) {
                            errorMsg.append(": ").append(e.getCause().getMessage());
                        }
                    }
                    
                    // Truncate to 1000 chars but preserve important info
                    String finalError = errorMsg.toString();
                    if (finalError.length() > 1000) {
                        finalError = finalError.substring(0, 997) + "...";
                    }
                    
                    emailLog.setErrorMessage(finalError);
                    emailLogRepository.save(emailLog);
                    System.out.println("📝 Error log saved to database (ID: " + emailLog.getId() + ")");
                } catch (Exception logError) {
                    System.err.println("⚠️ Failed to save error log to database: " + logError.getMessage());
                    logError.printStackTrace();
                }
            }
            
            // Don't throw exception - order should still be saved even if email fails
            // Just log the error
        }
    }
}

