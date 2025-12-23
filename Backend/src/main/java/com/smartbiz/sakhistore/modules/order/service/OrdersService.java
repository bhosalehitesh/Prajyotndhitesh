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
import com.smartbiz.sakhistore.modules.product.model.Product;

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
        // Validate required parameters
        if (user == null || user.getId() == null) {
            throw new RuntimeException("User is required to place an order");
        }
        
        if (address == null || address.trim().isEmpty()) {
            throw new RuntimeException("Delivery address is required to place an order");
        }
        
        if (mobile == null || mobile <= 0) {
            throw new RuntimeException("Mobile number is required to place an order");
        }

        System.out.println("\n" + "=".repeat(60));
        System.out.println("🛒 PLACING ORDER - USER EMAIL CHECK");
        System.out.println("=".repeat(60));
        System.out.println("User ID: " + user.getId());
        
        // ALWAYS fetch the LATEST user object from database to get most recent email
        User fullUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + user.getId()));
        
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

        // Use eager fetching to load cart with all items, products, and sellers
        // This prevents LazyInitializationException when accessing product.getSeller()
        System.out.println("\n" + "=".repeat(60));
        System.out.println("🛒 [OrdersService] FETCHING CART FOR USER ID: " + fullUser.getId());
        System.out.println("=".repeat(60));
        
        Cart cart = null;
        try {
            cart = cartRepository.findByUserWithItemsAndProducts(fullUser)
                    .orElse(null);
            if (cart == null) {
                System.out.println("⚠️ [OrdersService] Eager fetch returned null, trying regular fetch...");
                cart = cartRepository.findByUser(fullUser)
                        .orElse(null);
            }
            
            if (cart == null) {
                throw new RuntimeException("Cart not found for user ID: " + fullUser.getId());
            }
            
            System.out.println("✅ [OrdersService] Cart found. Cart ID: " + cart.getCartId());
            System.out.println("   Items count: " + (cart.getItems() != null ? cart.getItems().size() : 0));
        } catch (Exception e) {
            System.err.println("❌ [OrdersService] Error fetching cart: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch cart: " + e.getMessage(), e);
        }
        System.out.println("=".repeat(60) + "\n");

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
        System.out.println("\n" + "=".repeat(60));
        System.out.println("🛒 [OrdersService] PROCESSING CART ITEMS");
        System.out.println("=".repeat(60));
        System.out.println("Cart items: " + (cart.getItems() != null ? cart.getItems().size() : "NULL"));
        
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            System.err.println("❌ [OrdersService] Cart is empty!");
            throw new RuntimeException("Cart is empty. Cannot place order with no items.");
        }
        
        System.out.println("Processing " + cart.getItems().size() + " cart items...");
        int itemIndex = 0;
        for (OrderItems item : cart.getItems()) {
            itemIndex++;
            System.out.println("\n--- Processing Item #" + itemIndex + " ---");
            if (item == null) {
                System.err.println("⚠️ [OrdersService] Cart contains null item, skipping...");
                continue;
            }
            
            // Get product - either directly or from variant
            Product product = null;
            System.out.println("   Item variant: " + (item.getVariant() != null ? "EXISTS" : "NULL"));
            System.out.println("   Item product: " + (item.getProduct() != null ? "EXISTS" : "NULL"));
            
            if (item.getVariant() != null) {
                System.out.println("   Variant ID: " + item.getVariant().getVariantId());
                if (item.getVariant().getProduct() != null) {
                    product = item.getVariant().getProduct();
                    System.out.println("   ✅ Using product from variant (Product ID: " + product.getProductsId() + ")");
                } else {
                    System.out.println("   ⚠️ Variant exists but product is NULL");
                }
            }
            
            if (product == null && item.getProduct() != null) {
                product = item.getProduct();
                System.out.println("   ✅ Using direct product reference (Product ID: " + product.getProductsId() + ")");
            }
            
            if (product == null) {
                System.err.println("   ❌ ERROR: Neither product nor variant with product is available!");
                throw new RuntimeException("Cart contains invalid item at index " + itemIndex + ". Neither product nor variant with product is available.");
            }
            
            System.out.println("   Product ID: " + product.getProductsId());
            System.out.println("   Product seller: " + (product.getSeller() != null ? "EXISTS (ID: " + product.getSeller().getSellerId() + ")" : "NULL"));
            
            // Validate required fields
            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new RuntimeException("Cart item has invalid quantity: " + item.getQuantity());
            }
            
            if (item.getPrice() == null || item.getPrice() <= 0) {
                throw new RuntimeException("Cart item has invalid price: " + item.getPrice());
            }
            
            OrderItems newOrderItem = new OrderItems();
            newOrderItem.setProduct(product);
            if (item.getVariant() != null) {
                newOrderItem.setVariant(item.getVariant());
            }
            newOrderItem.setQuantity(item.getQuantity());
            newOrderItem.setPrice(item.getPrice());
            newOrderItem.setOrders(order);

            total += item.getPrice() * item.getQuantity();
            order.getOrderItems().add(newOrderItem);

            // Extract sellerId from product if not provided
            if (extractedSellerId == null && product != null) {
                try {
                    if (product.getSeller() != null && product.getSeller().getSellerId() != null) {
                        extractedSellerId = product.getSeller().getSellerId();
                        System.out.println("✅ [OrdersService] Extracted sellerId " + extractedSellerId + " from product");
                    }
                } catch (Exception e) {
                    System.err.println("⚠️ [OrdersService] Could not extract sellerId from product: " + e.getMessage());
                    e.printStackTrace();
                }
            }
            
            // Extract storeId from product's seller's store if not provided
            if (extractedStoreId == null && product != null) {
                try {
                    if (product.getSeller() != null && product.getSeller().getSellerId() != null) {
                        Long productSellerId = product.getSeller().getSellerId();
                        // Find store by sellerId
                        java.util.List<StoreDetails> stores = storeDetailsRepo.findBySeller_SellerId(productSellerId);
                        if (stores != null && !stores.isEmpty() && stores.get(0) != null) {
                            StoreDetails store = stores.get(0);
                            if (store.getStoreId() != null) {
                                extractedStoreId = store.getStoreId();
                                System.out.println("✅ [OrdersService] Extracted storeId " + extractedStoreId + " from product's seller (sellerId: " + productSellerId + ")");
                            }
                        }
                    }
                } catch (Exception e) {
                    System.err.println("⚠️ [OrdersService] Could not extract storeId from product's seller: " + e.getMessage());
                    e.printStackTrace();
                    // Continue - we'll validate storeId later
                }
            }
        }
        
        System.out.println("\n" + "=".repeat(60));
        System.out.println("📊 [OrdersService] ORDER SUMMARY");
        System.out.println("=".repeat(60));
        System.out.println("Total items: " + order.getOrderItems().size());
        System.out.println("Total amount: ₹" + total);
        System.out.println("Extracted sellerId: " + extractedSellerId);
        System.out.println("Extracted storeId: " + extractedStoreId);
        System.out.println("Provided sellerId: " + sellerId);
        System.out.println("Provided storeId: " + storeId);
        System.out.println("=".repeat(60) + "\n");
        
        if (order.getOrderItems().isEmpty()) {
            System.err.println("❌ [OrdersService] No valid items found in cart!");
            throw new RuntimeException("No valid items found in cart to place order.");
        }

        // Validate storeId is not null
        if (extractedStoreId == null) {
            System.err.println("❌ [OrdersService] Store ID is NULL!");
            System.err.println("   Provided storeId: " + storeId);
            System.err.println("   Extracted storeId: " + extractedStoreId);
            throw new RuntimeException("Store ID is required but could not be determined. Please ensure products belong to a valid store.");
        }

        order.setTotalAmount(total);
        order.setSellerId(extractedSellerId);
        order.setStoreId(extractedStoreId);
        
        // Ensure all order items have the order reference set BEFORE saving
        System.out.println("\n" + "=".repeat(60));
        System.out.println("🔗 [OrdersService] SETTING ORDER REFERENCES ON ITEMS");
        System.out.println("=".repeat(60));
        for (OrderItems orderItem : order.getOrderItems()) {
            if (orderItem.getOrders() == null) {
                orderItem.setOrders(order);
                System.out.println("⚠️ [OrdersService] Fixed null order reference on order item");
            } else {
                System.out.println("✅ [OrdersService] Order item already has order reference");
            }
            // Double-check the reference is set
            if (orderItem.getOrders() == null) {
                throw new RuntimeException("CRITICAL: Order item still has null order reference after setting!");
            }
            System.out.println("   Order item ID: " + orderItem.getOrderItemsId() + 
                             ", Order reference: " + (orderItem.getOrders() != null ? "SET (Order ID: " + orderItem.getOrders().getOrdersId() + ")" : "NULL"));
        }
        System.out.println("=".repeat(60) + "\n");
        
        System.out.println("✅ [OrdersService] Order prepared successfully. Saving to database...");
        System.out.println("   Order items count: " + order.getOrderItems().size());
        System.out.println("   Total amount: ₹" + order.getTotalAmount());
        System.out.println("   Store ID: " + order.getStoreId());
        System.out.println("   Seller ID: " + order.getSellerId());
        System.out.println("   Order ID (before save): " + order.getOrdersId());

        // Save order (+ items) to database
        Orders savedOrder;
        try {
            // Save the order first (this will generate the OrdersId)
            savedOrder = ordersRepository.save(order);
            System.out.println("✅ [OrdersService] Order saved successfully! Order ID: " + savedOrder.getOrdersId());
            
            // Ensure all items still have the correct reference after save
            for (OrderItems item : savedOrder.getOrderItems()) {
                if (item.getOrders() == null || !item.getOrders().getOrdersId().equals(savedOrder.getOrdersId())) {
                    item.setOrders(savedOrder);
                    System.out.println("⚠️ [OrdersService] Re-setting order reference on item after save");
                }
            }
            
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            System.err.println("❌ [OrdersService] Database constraint violation:");
            System.err.println("   Error: " + e.getMessage());
            System.err.println("   Root cause: " + (e.getRootCause() != null ? e.getRootCause().getMessage() : "Unknown"));
            System.err.println("   Order items: " + order.getOrderItems().size());
            System.err.println("   Order total: " + order.getTotalAmount());
            System.err.println("   Store ID: " + order.getStoreId());
            System.err.println("   Seller ID: " + order.getSellerId());
            e.printStackTrace();
            String errorMsg = e.getRootCause() != null ? e.getRootCause().getMessage() : e.getMessage();
            throw new RuntimeException("Database constraint violation. The foreign key column may not exist. Please restart the server to let Hibernate create it. Error: " + errorMsg, e);
        } catch (Exception e) {
            System.err.println("❌ [OrdersService] Error saving order to database:");
            System.err.println("   Error: " + e.getMessage());
            System.err.println("   Error type: " + e.getClass().getSimpleName());
            System.err.println("   Order items: " + order.getOrderItems().size());
            System.err.println("   Order total: " + order.getTotalAmount());
            System.err.println("   Store ID: " + order.getStoreId());
            System.err.println("   Seller ID: " + order.getSellerId());
            e.printStackTrace();
            throw new RuntimeException("Failed to save order to database: " + e.getMessage(), e);
        }

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
