package com.smartbiz.sakhistore.modules.order.service;

import com.smartbiz.sakhistore.modules.cart.model.Cart;
import com.smartbiz.sakhistore.modules.order.repository.OrdersRepository;
import com.smartbiz.sakhistore.modules.order.repository.OrderItemsRepository;
import com.smartbiz.sakhistore.modules.cart.repository.CartRepository;
import com.smartbiz.sakhistore.modules.customer_user.model.User;
import com.smartbiz.sakhistore.modules.customer_user.repository.UserRepository;
import com.smartbiz.sakhistore.modules.order.model.Orders;
import com.smartbiz.sakhistore.modules.order.model.OrderInvoiceHTMLBuilder;
import com.smartbiz.sakhistore.modules.inventory.model.PdfGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.smartbiz.sakhistore.modules.order.model.OrderStatus;
import com.smartbiz.sakhistore.modules.order.model.OrderItems;
import com.smartbiz.sakhistore.modules.payment.model.PaymentStatus;
import com.smartbiz.sakhistore.modules.store.repository.StoreDetailsRepo;
import com.smartbiz.sakhistore.modules.store.model.StoreDetails;

import java.util.List;
import java.util.Optional;

@Service
public class OrdersService {

    @Autowired
    private OrdersRepository ordersRepository;

    @Autowired
    private OrderItemsRepository orderItemsRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private StoreDetailsRepo storeDetailsRepo;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderEmailService orderEmailService;

    // ===============================
    // Create Order From Cart
    // ===============================
    public Orders placeOrder(User user, String address, Long mobile, Long storeId, Long sellerId) {

        System.out.println("\n" + "=".repeat(60));
        System.out.println("🛒 PLACING ORDER - USER EMAIL CHECK");
        System.out.println("=".repeat(60));
        System.out.println("User ID: " + user.getId());
        
        // ALWAYS fetch the LATEST user object from database to get most recent email
        User fullUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        System.out.println("📧 Email in database: " + (fullUser.getEmail() != null ? fullUser.getEmail() : "NULL"));
        System.out.println("📧 Email from request user object: " + (user.getEmail() != null ? user.getEmail() : "NULL"));
        
        if (fullUser.getEmail() == null || fullUser.getEmail().trim().isEmpty()) {
            System.out.println("⚠️ WARNING: User does not have an email in database!");
            System.out.println("   Order will be placed but invoice email will not be sent.");
            System.out.println("   User should update their email in profile/checkout.");
        } else {
            System.out.println("✅ User has email in database: " + fullUser.getEmail());
        }
        System.out.println("=".repeat(60) + "\n");

        Cart cart = cartRepository.findByUser(fullUser)
                .orElseThrow(() -> new RuntimeException("Cart not found for user"));

        Orders order = new Orders();
        order.setUser(fullUser);  // Use full user object with LATEST email from database
        order.setAddress(address);
        order.setMobile(mobile);
        order.setOrderStatus(OrderStatus.PLACED);
        order.setPaymentStatus(PaymentStatus.PENDING);
        
        // Initialize orderItems list to avoid NullPointerException
        order.setOrderItems(new java.util.ArrayList<>());

        double total = 0.0;
        Long extractedSellerId = sellerId;
        Long extractedStoreId = storeId;

        // Move cart items → order items
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty. Cannot place order with no items.");
        }
        
        for (OrderItems item : cart.getItems()) {
            if (item == null || item.getProduct() == null) {
                throw new RuntimeException("Cart contains invalid item. Product is missing.");
            }
            
            OrderItems newOrderItem = new OrderItems();
            newOrderItem.setProduct(item.getProduct());
            newOrderItem.setQuantity(item.getQuantity());
            newOrderItem.setPrice(item.getPrice());
            newOrderItem.setOrders(order);

            total += item.getPrice() * item.getQuantity();
            order.getOrderItems().add(newOrderItem);

            // Extract sellerId from product if not provided
            if (extractedSellerId == null && item.getProduct() != null && item.getProduct().getSeller() != null) {
                extractedSellerId = item.getProduct().getSeller().getSellerId();
            }
            
            // Extract storeId from product's seller's store if not provided
            if (extractedStoreId == null && item.getProduct() != null && item.getProduct().getSeller() != null) {
                try {
                    Long productSellerId = item.getProduct().getSeller().getSellerId();
                    if (productSellerId != null) {
                        // Find store by sellerId
                        java.util.List<StoreDetails> stores = storeDetailsRepo.findBySeller_SellerId(productSellerId);
                        if (stores != null && !stores.isEmpty()) {
                            extractedStoreId = stores.get(0).getStoreId();
                            System.out.println("✅ [OrdersService] Extracted storeId " + extractedStoreId + " from product's seller (sellerId: " + productSellerId + ")");
                        }
                    }
                } catch (Exception e) {
                    System.err.println("⚠️ [OrdersService] Could not extract storeId from product's seller: " + e.getMessage());
                    // Continue - we'll validate storeId later
                }
            }
        }
        
        if (order.getOrderItems().isEmpty()) {
            throw new RuntimeException("No valid items found in cart to place order.");
        }

        // Validate storeId is not null
        if (extractedStoreId == null) {
            throw new RuntimeException("Store ID is required but could not be determined. Please ensure products belong to a valid store.");
        }

        order.setTotalAmount(total);
        order.setSellerId(extractedSellerId);
        order.setStoreId(extractedStoreId);

        // Save order (+ items) to database
        Orders savedOrder = ordersRepository.save(order);

        // Empty cart after order creation
        cart.getItems().clear();
        cartRepository.save(cart);

        // ===============================
        // Generate PDF and Send Email
        // ===============================
        try {
            // ALWAYS fetch fresh user from database to get latest email
            System.out.println("\n" + "=".repeat(60));
            System.out.println("🔄 [OrdersService] REFRESHING USER DATA FROM DATABASE");
            System.out.println("=".repeat(60));
            System.out.println("Order ID: #" + savedOrder.getOrdersId());
            System.out.println("User ID: " + fullUser.getId());
            
            // Fetch the LATEST user data from database (in case email was updated)
            User latestUser = userRepository.findById(fullUser.getId())
                    .orElseThrow(() -> new RuntimeException("User not found in database"));
            
            System.out.println("📧 Email from database: " + (latestUser.getEmail() != null ? latestUser.getEmail() : "NULL"));
            System.out.println("📧 Email from order user: " + (fullUser.getEmail() != null ? fullUser.getEmail() : "NULL"));
            
            // Update the order's user with latest email
            if (latestUser.getEmail() != null && !latestUser.getEmail().trim().isEmpty()) {
                fullUser.setEmail(latestUser.getEmail());
                System.out.println("✅ Updated order user with latest email from database: " + latestUser.getEmail());
            } else {
                System.out.println("⚠️ No email found in database for user ID: " + latestUser.getId());
                System.out.println("   User needs to add email address to their profile.");
            }
            System.out.println("=".repeat(60) + "\n");
            
            // Fetch order with user and items for PDF generation
            Orders orderWithDetails = ordersRepository.findByIdWithUser(savedOrder.getOrdersId())
                    .orElse(savedOrder);
            
            // Ensure order has the latest user email
            if (orderWithDetails.getUser() != null && latestUser.getEmail() != null) {
                orderWithDetails.getUser().setEmail(latestUser.getEmail());
            }

            // Debug: Check if user and email exist
            System.out.println("\n🔍 [OrdersService] Final check before sending email for Order #" + orderWithDetails.getOrdersId());
            if (orderWithDetails.getUser() != null) {
                System.out.println("   User ID: " + orderWithDetails.getUser().getId());
                System.out.println("   User Name: " + orderWithDetails.getUser().getFullName());
                System.out.println("   User Phone: " + orderWithDetails.getUser().getPhone());
                System.out.println("   User Email: " + (orderWithDetails.getUser().getEmail() != null ? orderWithDetails.getUser().getEmail() : "NULL/EMPTY"));
            } else {
                System.out.println("   ❌ User is NULL for this order!");
            }

            // Generate PDF invoice
            System.out.println("\n📄 [OrdersService] Generating PDF invoice for Order #" + orderWithDetails.getOrdersId());
            String htmlContent = OrderInvoiceHTMLBuilder.build(orderWithDetails);
            byte[] pdfBytes = PdfGenerator.generatePdfBytes(htmlContent);
            System.out.println("✅ [OrdersService] PDF generated successfully (" + pdfBytes.length + " bytes)");

            // Send email with PDF attachment
            orderEmailService.sendOrderInvoiceEmail(orderWithDetails, pdfBytes);

        } catch (Exception e) {
            // Log error but don't fail the order placement
            System.err.println("⚠️ [OrdersService] Failed to generate PDF or send email: " + e.getMessage());
            e.printStackTrace();
            // Order is already saved, so we continue
        }

        return savedOrder;
    }

    // ===============================
    // Fetch Order by ID
    // ===============================
    public Orders getOrder(Long id) {
        // Use findByIdWithUser to eagerly load user for customerName/customerPhone getters
        Optional<Orders> orderOpt = ordersRepository.findByIdWithUser(id);
        return orderOpt.orElseThrow(() -> new RuntimeException("Order not found"));
    }

    // ===============================
    // Fetch Orders by User
    // ===============================
    public List<Orders> getOrdersByUser(User user) {
        return ordersRepository.findByUser(user);
    }

    // ===============================
    // Update Order Status
    // ===============================
    public Orders updateOrderStatus(Long id, OrderStatus status, String rejectionReason) {
        Orders order = getOrder(id);
        order.setOrderStatus(status);
        
        // Store rejection reason if provided and status is REJECTED
        if (status == com.smartbiz.sakhistore.modules.order.model.OrderStatus.REJECTED && rejectionReason != null && !rejectionReason.trim().isEmpty()) {
            order.setRejectionReason(rejectionReason.trim());
        } else if (status != com.smartbiz.sakhistore.modules.order.model.OrderStatus.REJECTED) {
            // Clear rejection reason if order is not rejected
            order.setRejectionReason(null);
        }
        
        return ordersRepository.save(order);
    }

    public List<Orders> getAllOrders() {
        return ordersRepository.findAll();
    }

    // ===============================
    // Fetch Orders by Seller ID
    // Returns all orders containing products from this seller
    // ===============================
    public List<Orders> getOrdersBySellerId(Long sellerId) {
        return ordersRepository.findBySellerId(sellerId);
    }

    // ===============================
    // Test Email Method (for debugging)
    // ===============================
    public void sendTestEmail(Orders order, byte[] pdfBytes) {
        orderEmailService.sendOrderInvoiceEmail(order, pdfBytes);
    }
}
