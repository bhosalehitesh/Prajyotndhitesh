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
import com.smartbiz.sakhistore.modules.product.model.ProductVariant;
import com.smartbiz.sakhistore.modules.product.repository.ProductRepository;
import com.smartbiz.sakhistore.modules.product.repository.ProductVariantRepository;
import com.smartbiz.sakhistore.modules.inventory.model.Inventory;
import com.smartbiz.sakhistore.modules.inventory.repository.InventoryRepository;

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

    @Autowired(required = false)
    private com.smartbiz.sakhistore.modules.payment.service.PaymentService paymentService;

    @Autowired(required = false)
    private com.smartbiz.sakhistore.modules.inventory.service.InvoiceServiceImpl invoiceService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired(required = false)
    private ProductVariantRepository productVariantRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    // ===============================
    // Create Order From Cart
    // ===============================
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

        // Always fetch the LATEST user object from database
        User fullUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + user.getId()));

        if (fullUser.getEmail() == null || fullUser.getEmail().trim().isEmpty()) {
            System.out.println("⚠️ User does not have an email. Invoice will not be sent.");
        }

        // Use eager fetching to load cart with all items
        Cart cart = cartRepository.findByUserWithItemsAndProducts(fullUser).orElse(null);
        if (cart == null) {
            cart = cartRepository.findByUser(fullUser)
                    .orElseThrow(() -> new RuntimeException("Cart not found for user ID: " + fullUser.getId()));
        }

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty. Cannot place order with no items.");
        }

        Orders order = new Orders();
        order.setUser(fullUser);
        order.setAddress(address);
        order.setMobile(mobile);
        order.setOrderStatus(OrderStatus.PLACED);
        order.setPaymentStatus(PaymentStatus.PENDING);
        order.setOrderItems(new java.util.ArrayList<>());

        double total = 0.0;
        Long extractedSellerId = sellerId;
        Long extractedStoreId = storeId;

        // Process cart items
        for (OrderItems item : cart.getItems()) {
            if (item == null)
                continue;

            Product product = null;
            if (item.getVariant() != null && item.getVariant().getProduct() != null) {
                product = item.getVariant().getProduct();
            } else if (item.getProduct() != null) {
                product = item.getProduct();
            }

            if (product == null) {
                throw new RuntimeException(
                        "Cart contains invalid item (missing product). Please clear cart and try again.");
            }

            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new RuntimeException("Cart item has invalid quantity");
            }

            if (item.getPrice() == null || item.getPrice() <= 0) {
                throw new RuntimeException("Cart item has invalid price");
            }

            OrderItems newOrderItem = new OrderItems();
            newOrderItem.setProduct(product);
            if (item.getVariant() != null) {
                newOrderItem.setVariant(item.getVariant());
            }
            newOrderItem.setQuantity(item.getQuantity());
            newOrderItem.setPrice(item.getPrice());
            newOrderItem.setOrders(order);

            // FIX: Add price directly (assuming price is line total), or if unit price, fix
            // logic.
            // Based on previous fix: total += item.getPrice();
            total += item.getPrice();

            order.getOrderItems().add(newOrderItem);

            // Extract seller/store info if needed
            if (extractedSellerId == null && product.getSeller() != null) {
                extractedSellerId = product.getSeller().getSellerId();
            }

            if (extractedStoreId == null && product.getSeller() != null) {
                try {
                    Long pSellerId = product.getSeller().getSellerId();
                    if (pSellerId != null) {
                        List<StoreDetails> stores = storeDetailsRepo.findBySeller_SellerId(pSellerId);
                        if (stores != null && !stores.isEmpty() && stores.get(0).getStoreId() != null) {
                            extractedStoreId = stores.get(0).getStoreId();
                        }
                    }
                } catch (Exception e) {
                    // Ignore lazy loading or other issues
                }
            }
        }

        if (order.getOrderItems().isEmpty()) {
            throw new RuntimeException("No valid items to process");
        }

        if (extractedStoreId == null) {
            throw new RuntimeException("Store ID could not be determined for this order.");
        }

        order.setTotalAmount(total);
        order.setSellerId(extractedSellerId);
        order.setStoreId(extractedStoreId);

        // Save order
        Orders savedOrder;
        try {
            savedOrder = ordersRepository.save(order);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to save order: " + e.getMessage());
        }

        // Ensure inverse relationship is set (sometimes required by JPA/Hibernate
        // cache)
        for (OrderItems item : savedOrder.getOrderItems()) {
            if (item.getOrders() == null) {
                item.setOrders(savedOrder);
            }
        }

        // Update inventory - decrement stock for each ordered item
        try {
            System.out.println("\n" + "=".repeat(60));
            System.out.println("📦 UPDATING INVENTORY");
            System.out.println("=".repeat(60));
            
            for (OrderItems orderItem : savedOrder.getOrderItems()) {
                if (orderItem == null || orderItem.getQuantity() == null || orderItem.getQuantity() <= 0) {
                    continue;
                }

                Integer orderedQuantity = orderItem.getQuantity();
                Product product = orderItem.getProduct();
                ProductVariant variant = orderItem.getVariant();

                // Update variant stock if variant exists (preferred method)
                if (variant != null && variant.getVariantId() != null && productVariantRepository != null) {
                    ProductVariant dbVariant = productVariantRepository.findById(variant.getVariantId()).orElse(null);
                    if (dbVariant != null) {
                        Integer currentStock = dbVariant.getStock() != null ? dbVariant.getStock() : 0;
                        Integer newStock = Math.max(0, currentStock - orderedQuantity);
                        dbVariant.setStock(newStock);
                        
                        // Disable variant if stock reaches zero
                        if (newStock == 0) {
                            dbVariant.setIsActive(false);
                        }
                        
                        productVariantRepository.save(dbVariant);
                        System.out.println("✅ Updated variant stock: " + dbVariant.getSku() + 
                            " (Ordered: " + orderedQuantity + ", Stock: " + currentStock + " → " + newStock + ")");
                    }
                }

                // Also update product's legacy inventoryQuantity field for backward compatibility
                if (product != null && product.getProductsId() != null) {
                    Product dbProduct = productRepository.findById(product.getProductsId()).orElse(null);
                    if (dbProduct != null) {
                        Integer currentInventory = dbProduct.getInventoryQuantity() != null ? dbProduct.getInventoryQuantity() : 0;
                        Integer newInventory = Math.max(0, currentInventory - orderedQuantity);
                        dbProduct.setInventoryQuantity(newInventory);
                        productRepository.save(dbProduct);
                        System.out.println("✅ Updated product inventory: " + dbProduct.getProductName() + 
                            " (Ordered: " + orderedQuantity + ", Inventory: " + currentInventory + " → " + newInventory + ")");

                        // Create or update Inventory record in inventory table
                        try {
                            // Try to find existing inventory record for this product
                            Optional<Inventory> existingInventoryOpt = inventoryRepository.findByProduct(dbProduct);
                            
                            Inventory inventoryRecord;
                            if (existingInventoryOpt.isPresent()) {
                                // Update existing record
                                inventoryRecord = existingInventoryOpt.get();
                                System.out.println("📝 Updating existing inventory record for product: " + dbProduct.getProductName());
                            } else {
                                // Create new record
                                inventoryRecord = new Inventory();
                                inventoryRecord.setProduct(dbProduct);
                                System.out.println("➕ Creating new inventory record for product: " + dbProduct.getProductName());
                            }
                            
                            // Set inventory fields with meaningful values
                            // Download_currentinventory: Store current inventory quantity as string
                            String currentInventoryStr = String.valueOf(newInventory);
                            inventoryRecord.setDownload_currentinventory(currentInventoryStr);
                            
                            // Upload_edited_inventory: Store timestamp of last update
                            String lastUpdateTimestamp = java.time.LocalDateTime.now().toString();
                            inventoryRecord.setUpload_edited_inventory(lastUpdateTimestamp);
                            
                            // Ensure the product relationship is set
                            inventoryRecord.setProduct(dbProduct);
                            inventoryRepository.save(inventoryRecord);
                            System.out.println("✅ Inventory record saved to inventory table (ID: " + inventoryRecord.getInventoryId() + 
                                ", Product ID: " + dbProduct.getProductsId() + 
                                ", Current Inventory: " + currentInventoryStr + 
                                ", Last Updated: " + lastUpdateTimestamp + ")");
                        } catch (Exception invEx) {
                            System.err.println("⚠️ Failed to save inventory record: " + invEx.getMessage());
                            invEx.printStackTrace();
                            // Don't fail the whole process if inventory record save fails
                        }
                    }
                }
            }
            
            System.out.println("=".repeat(60));
            System.out.println("✅ Inventory update completed");
            System.out.println("=".repeat(60) + "\n");
        } catch (Exception e) {
            System.err.println("⚠️ Failed to update inventory: " + e.getMessage());
            e.printStackTrace();
            // Don't fail order placement if inventory update fails
        }

        // Empty cart
        cart.getItems().clear();
        cartRepository.save(cart);

        // Generate and save invoice to database
        try {
            System.out.println("\n" + "=".repeat(60));
            System.out.println("📄 GENERATING INVOICE FOR ORDER");
            System.out.println("=".repeat(60));
            System.out.println("Order ID: " + savedOrder.getOrdersId());
            System.out.println("=".repeat(60) + "\n");
            
            if (invoiceService != null) {
                com.smartbiz.sakhistore.modules.inventory.model.UserInvoice invoice = 
                    invoiceService.generateInvoice(savedOrder.getOrdersId());
                System.out.println("✅ Invoice generated and saved to database!");
                System.out.println("   Invoice ID: " + invoice.getInvoiceId());
                System.out.println("   Invoice Number: " + invoice.getInvoiceNumber());
                System.out.println("   Total Amount: ₹" + invoice.getGrandTotal());
            } else {
                System.err.println("⚠️ InvoiceService is not available. Invoice will not be generated.");
            }
        } catch (Exception e) {
            System.err.println("⚠️ Failed to generate invoice: " + e.getMessage());
            e.printStackTrace();
            // Don't fail order placement if invoice generation fails
        }

        // Send Email (async or safe block)
        try {
            // Refresh user for latest email
            User currentUser = userRepository.findById(fullUser.getId()).orElse(fullUser);
            if (currentUser.getEmail() != null && !currentUser.getEmail().isEmpty()) {
                fullUser.setEmail(currentUser.getEmail());
            }

            // Generate PDF and send
            // Re-fetch order with details to ensure everything is loaded for the PDF
            Orders orderForPdf = ordersRepository.findByIdWithUser(savedOrder.getOrdersId()).orElse(savedOrder);
            if (orderForPdf.getUser() != null && currentUser.getEmail() != null) {
                orderForPdf.getUser().setEmail(currentUser.getEmail());
            }

            String htmlContent = OrderInvoiceHTMLBuilder.build(orderForPdf);
            byte[] pdfBytes = PdfGenerator.generatePdfBytes(htmlContent);
            orderEmailService.sendOrderInvoiceEmail(orderForPdf, pdfBytes);
            System.out.println("✅ Invoice email sent for Order #" + savedOrder.getOrdersId());
        } catch (Exception e) {
            System.err.println("⚠️ Failed to send invoice email: " + e.getMessage());
        }

        return savedOrder;
    }

    // ===============================
    // Fetch Order by ID
    // Automatically syncs payment status if payment is PAID
    // ===============================
    public Orders getOrder(Long id) {
        // Use findByIdWithUser to eagerly load user for customerName/customerPhone
        // getters
        Optional<Orders> orderOpt = ordersRepository.findByIdWithUser(id);
        Orders order = orderOpt.orElseThrow(() -> new RuntimeException("Order not found"));

        // Auto-sync payment status if order shows PENDING but payment is PAID
        if (order.getPaymentStatus() == com.smartbiz.sakhistore.modules.payment.model.PaymentStatus.PENDING
                && paymentService != null) {
            try {
                boolean synced = paymentService.syncPaymentStatusForOrder(id);
                if (synced) {
                    // Re-fetch order to get updated status
                    orderOpt = ordersRepository.findByIdWithUser(id);
                    if (orderOpt.isPresent()) {
                        order = orderOpt.get();
                    }
                }
            } catch (Exception e) {
                // Silently fail - don't break order fetching if sync fails
                System.err.println("⚠️ Auto-sync failed for order #" + id + ": " + e.getMessage());
            }
        }

        return order;
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
        if (status == com.smartbiz.sakhistore.modules.order.model.OrderStatus.REJECTED && rejectionReason != null
                && !rejectionReason.trim().isEmpty()) {
            order.setRejectionReason(rejectionReason.trim());
        } else if (status != com.smartbiz.sakhistore.modules.order.model.OrderStatus.REJECTED) {
            // Clear rejection reason if order is not rejected
            order.setRejectionReason(null);
        }

        // CRITICAL: Auto-sync payment status when order is DELIVERED
        // If order is delivered, payment should be PAID (sync from Payment table)
        if (status == com.smartbiz.sakhistore.modules.order.model.OrderStatus.DELIVERED && paymentService != null) {
            try {
                // Sync payment status from Payment table to Orders table
                boolean synced = paymentService.syncPaymentStatusForOrder(id);
                if (synced) {
                    System.out.println("✅ Auto-synced payment status to PAID for delivered order #" + id);
                    // Re-fetch order to get updated payment status
                    order = ordersRepository.findById(id).orElse(order);
                } else {
                    // If sync didn't work, check if payment exists and is PAID
                    // If order payment status is still PENDING but order is DELIVERED,
                    // it's likely the payment was successful but status wasn't synced
                    if (order.getPaymentStatus() == PaymentStatus.PENDING) {
                        System.out.println(
                                "⚠️ Order #" + id + " is DELIVERED but payment status is PENDING. Attempting sync...");
                    }
                }
            } catch (Exception e) {
                // Don't fail the order status update if sync fails
                System.err.println("⚠️ Auto-sync payment status failed for order #" + id + ": " + e.getMessage());
            }
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

    // ===============================
    // Update Payment Status
    // ===============================
    public Orders updatePaymentStatus(Long id, PaymentStatus status) {
        Orders order = getOrder(id);
        order.setPaymentStatus(status);
        return ordersRepository.save(order);
    }
}
