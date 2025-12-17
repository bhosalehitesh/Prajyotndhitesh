package com.smartbiz.sakhistore.modules.order.service;

import com.smartbiz.sakhistore.modules.cart.model.Cart;
import com.smartbiz.sakhistore.modules.order.repository.OrdersRepository;
import com.smartbiz.sakhistore.modules.order.repository.OrderItemsRepository;
import com.smartbiz.sakhistore.modules.cart.repository.CartRepository;
import com.smartbiz.sakhistore.modules.customer_user.model.User;
import com.smartbiz.sakhistore.modules.order.model.Orders;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.smartbiz.sakhistore.modules.order.model.OrderStatus;
import com.smartbiz.sakhistore.modules.order.model.OrderItems;
import com.smartbiz.sakhistore.modules.payment.model.PaymentStatus;
import com.smartbiz.sakhistore.modules.store.repository.StoreDetailsRepo;
import com.smartbiz.sakhistore.modules.store.model.StoreDetails;




import java.util.List;

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

    // ===============================
    // Create Order From Cart
    // ===============================
    public Orders placeOrder(User user, String address, Long mobile, Long storeId, Long sellerId) {

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Cart not found for user"));

        Orders order = new Orders();
        order.setUser(user);
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

        // Save order (+ items)
        Orders savedOrder = ordersRepository.save(order);

        // Empty cart after order creation
        cart.getItems().clear();
        cartRepository.save(cart);

        return savedOrder;
    }

    // ===============================
    // Fetch Order by ID
    // ===============================
    public Orders getOrder(Long id) {
        return ordersRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
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
    public Orders updateOrderStatus(Long id, OrderStatus status) {
        Orders order = getOrder(id);
        order.setOrderStatus(status);
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
}
