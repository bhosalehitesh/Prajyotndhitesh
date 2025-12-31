package com.smartbiz.sakhistore.modules.inventory.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartbiz.sakhistore.config.EmailServicePdf;
import com.smartbiz.sakhistore.modules.customer_user.model.User;
import com.smartbiz.sakhistore.modules.inventory.model.InvoiceHTMLBuilder;
import com.smartbiz.sakhistore.modules.inventory.model.InvoiceItem;
import com.smartbiz.sakhistore.modules.inventory.model.InvoiceStatus;
import com.smartbiz.sakhistore.modules.inventory.model.PdfGenerator;
import com.smartbiz.sakhistore.modules.inventory.model.UserInvoice;
import com.smartbiz.sakhistore.modules.inventory.repository.UserInvoiceItemRepository;
import com.smartbiz.sakhistore.modules.inventory.repository.UserInvoiceRepository;
import com.smartbiz.sakhistore.modules.order.model.OrderItems;
import com.smartbiz.sakhistore.modules.order.model.Orders;
import com.smartbiz.sakhistore.modules.order.repository.OrdersRepository;
import com.smartbiz.sakhistore.modules.payment.model.Payment;

@Service
@Transactional
public class InvoiceServiceImpl {

    private final UserInvoiceRepository invoiceRepo;
    private final UserInvoiceItemRepository itemRepo;
    private final OrdersRepository orderRepo;
    private final EmailServicePdf emailService;

    public InvoiceServiceImpl(UserInvoiceRepository invoiceRepo,
                              UserInvoiceItemRepository itemRepo,
                              OrdersRepository orderRepo,
                              EmailServicePdf emailService) {
        this.invoiceRepo = invoiceRepo;
        this.itemRepo = itemRepo;
        this.orderRepo = orderRepo;
        this.emailService = emailService;
    }

    public UserInvoice generateInvoice(Long orderId) {
        System.out.println("\n" + "=".repeat(60));
        System.out.println("🔄 STARTING INVOICE GENERATION");
        System.out.println("=".repeat(60));
        System.out.println("Order ID: " + orderId);
        System.out.println("=".repeat(60) + "\n");

        Orders order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order Not Found with ID: " + orderId));

        if (order == null) {
            throw new RuntimeException("Order is null for ID: " + orderId);
        }

        User user = order.getUser();
        if (user == null) {
            throw new RuntimeException("User is null for order ID: " + orderId);
        }

        Payment payment = order.getPayment();

        UserInvoice invoice = new UserInvoice();
        invoice.setInvoiceNumber("INV-" + System.currentTimeMillis());
        invoice.setInvoiceDate(LocalDateTime.now());
        invoice.setStatus(InvoiceStatus.IN_PROGRESS);

        invoice.setOrderId(orderId);
        invoice.setUserId(user.getId());

        // Set payment ID if payment exists (use paymentAutoId which is the Long primary key)
        if (payment != null && payment.getPaymentAutoId() != null) {
            invoice.setPaymentId(payment.getPaymentAutoId());
        }

        invoice.setUserName(user.getFullName() != null ? user.getFullName() : "Customer");
        invoice.setUserPhone(user.getPhone() != null ? user.getPhone() : "");
        invoice.setUserEmail(user.getEmail() != null ? user.getEmail() : "");

        // Build address safely (handle null values)
        StringBuilder addressBuilder = new StringBuilder();
        if (user.getFlatOrHouseNo() != null && !user.getFlatOrHouseNo().trim().isEmpty()) {
            addressBuilder.append(user.getFlatOrHouseNo().trim());
        }
        if (user.getAreaOrStreet() != null && !user.getAreaOrStreet().trim().isEmpty()) {
            if (addressBuilder.length() > 0) addressBuilder.append(", ");
            addressBuilder.append(user.getAreaOrStreet().trim());
        }
        if (user.getCity() != null && !user.getCity().trim().isEmpty()) {
            if (addressBuilder.length() > 0) addressBuilder.append(", ");
            addressBuilder.append(user.getCity().trim());
        }
        if (user.getState() != null && !user.getState().trim().isEmpty()) {
            if (addressBuilder.length() > 0) addressBuilder.append(", ");
            addressBuilder.append(user.getState().trim());
        }
        if (user.getPincode() != null && !user.getPincode().trim().isEmpty()) {
            if (addressBuilder.length() > 0) addressBuilder.append(" - ");
            addressBuilder.append(user.getPincode().trim());
        }

        String address = addressBuilder.length() > 0 ? addressBuilder.toString() : "Address not provided";
        invoice.setBillingAddress(address);
        invoice.setShippingAddress(address);

        // Calculate totals - use product sellingPrice directly from database
        double subtotal = 0.0;

        if (order.getOrderItems() == null || order.getOrderItems().isEmpty()) {
            throw new RuntimeException("Order has no items. Cannot generate invoice.");
        }

        for (OrderItems oi : order.getOrderItems()) {
            if (oi == null) continue;
            if (oi.getQuantity() == null) {
                System.err.println("⚠️ Warning: Order item has null quantity, skipping...");
                continue;
            }
            
            // Get unit price directly from database: prefer variant price, fallback to product price
            double unitPrice = 0.0;
            if (oi.getVariant() != null && oi.getVariant().getSellingPrice() != null) {
                unitPrice = oi.getVariant().getSellingPrice();
            } else if (oi.getProduct() != null && oi.getProduct().getSellingPrice() != null) {
                unitPrice = oi.getProduct().getSellingPrice();
            } else {
                System.err.println("⚠️ Warning: Order item has no valid price (variant or product), skipping...");
                continue;
            }
            
            int quantity = oi.getQuantity();
            // Calculate item subtotal: unitPrice * quantity (from database values)
            double itemSubtotal = unitPrice * quantity;
            subtotal += itemSubtotal;
        }

        if (subtotal == 0.0) {
            throw new RuntimeException("Cannot generate invoice: Order subtotal is zero.");
        }

        // Set all totals to be the same (subtotal only, no tax/discount/delivery)
        invoice.setSubTotal(subtotal);
        invoice.setTaxAmount(0.0);
        invoice.setDiscountAmount(0.0);
        invoice.setDeliveryCharges(0.0);
        invoice.setGrandTotal(subtotal); // Same as subtotal

        // Set payment info safely
        if (payment != null) {
            invoice.setPaymentStatus(payment.getStatus() != null ? payment.getStatus().name() : "PENDING");
            invoice.setPaymentAmount(payment.getAmount() != null ? payment.getAmount() : subtotal);
        } else {
            invoice.setPaymentStatus("PAID");
            invoice.setPaymentAmount(subtotal);
            System.out.println("⚠️ Warning: Payment is null for order, setting default payment status");
        }

        // Create invoice items
        List<InvoiceItem> items = new ArrayList<>();

        for (OrderItems oi : order.getOrderItems()) {
            if (oi == null) continue;
            if (oi.getQuantity() == null) {
                System.err.println("⚠️ Warning: Order item has null quantity, skipping...");
                continue;
            }

            InvoiceItem it = new InvoiceItem();
            it.setInvoice(invoice);

            it.setOrderItemId(oi.getOrderItemsId());
            
            // Get product info - use product if available, otherwise try to get from variant
            if (oi.getProduct() != null) {
                it.setProductId(oi.getProduct().getProductsId());
                it.setProductName(oi.getProduct().getProductName() != null ? oi.getProduct().getProductName() : "Product");
                it.setSize(oi.getProduct().getSize() != null ? oi.getProduct().getSize() : "");
            } else if (oi.getVariant() != null && oi.getVariant().getProduct() != null) {
                it.setProductId(oi.getVariant().getProduct().getProductsId());
                it.setProductName(oi.getVariant().getProduct().getProductName() != null ? oi.getVariant().getProduct().getProductName() : "Product");
                // Use product's size since variant stores attributes in JSON
                it.setSize(oi.getVariant().getProduct().getSize() != null ? oi.getVariant().getProduct().getSize() : "");
            } else {
                System.err.println("⚠️ Warning: Order item has no product or variant, skipping...");
                continue;
            }
            
            // Get quantity directly from database
            int itemQuantity = oi.getQuantity();
            it.setQuantity(itemQuantity);
            
            // Get unit price directly from database: prefer variant price, fallback to product price
            // DO NOT use OrderItems.price as it may already be calculated (unitPrice * quantity)
            double unitPrice = 0.0;
            if (oi.getVariant() != null && oi.getVariant().getSellingPrice() != null) {
                unitPrice = oi.getVariant().getSellingPrice();
            } else if (oi.getProduct() != null && oi.getProduct().getSellingPrice() != null) {
                unitPrice = oi.getProduct().getSellingPrice();
            } else {
                System.err.println("⚠️ Warning: Order item has no valid price, skipping...");
                continue;
            }
            it.setPrice(unitPrice);
            
            // Calculate total directly: unitPrice * quantity (from database values)
            double itemTotal = unitPrice * itemQuantity;
            it.setTotal(itemTotal);
            
            // No GST - set to 0
            it.setGstPercent(0.0);
            it.setGstAmount(0.0);

            items.add(it);
        }

        if (items.isEmpty()) {
            throw new RuntimeException("Cannot generate invoice: No valid items found in order.");
        }

        invoice.setItems(items);

        // Save invoice first
        System.out.println("💾 Saving invoice to database...");
        UserInvoice savedInvoice = invoiceRepo.save(invoice);
        System.out.println("✅ Invoice saved with ID: " + savedInvoice.getInvoiceId());

        // Save invoice items
        System.out.println("💾 Saving " + items.size() + " invoice items to database...");
        itemRepo.saveAll(items);
        System.out.println("✅ Invoice items saved successfully");

        // Update invoice status
        savedInvoice.setStatus(InvoiceStatus.COMPLETED);
        savedInvoice = invoiceRepo.save(savedInvoice);

        // Refresh to get all relationships
        UserInvoice finalInvoice = invoiceRepo.findById(savedInvoice.getInvoiceId()).orElseThrow();

        // ========= LOGGING ==========
        System.out.println("\n================= INVOICE GENERATED =================");
        System.out.println("Invoice ID    : " + finalInvoice.getInvoiceId());
        System.out.println("Invoice No    : " + finalInvoice.getInvoiceNumber());
        System.out.println("Order ID      : " + finalInvoice.getOrderId());
        System.out.println("Customer Name : " + finalInvoice.getUserName());
        System.out.println("Customer Phone: " + finalInvoice.getUserPhone());
        System.out.println("Customer Email: " + finalInvoice.getUserEmail());
        System.out.println("-----------------------------------------------------");
        System.out.println("Subtotal      : ₹" + finalInvoice.getSubTotal());
        System.out.println("GST           : ₹0.0");
        System.out.println("Discount      : ₹0.0");
        System.out.println("Delivery      : ₹0.0");
        System.out.println("GRAND TOTAL   : ₹" + finalInvoice.getSubTotal());
        System.out.println("-----------------------------------------------------");
        System.out.println("Items Count   : " + (finalInvoice.getItems() != null ? finalInvoice.getItems().size() : 0));
        System.out.println("=====================================================\n");

        // ================== PDF GENERATION ==================
        try {
            String html = InvoiceHTMLBuilder.build(finalInvoice);
            byte[] pdfBytes = PdfGenerator.generatePdfBytes(html);
            System.out.println("PDF Generated (" + pdfBytes.length + " bytes)");

            // ================== SEND EMAIL ==================
            if (finalInvoice.getUserEmail() != null && !finalInvoice.getUserEmail().trim().isEmpty()) {
                System.out.println("\n================= SENDING EMAIL =================");
                System.out.println("To            : " + finalInvoice.getUserEmail());
                System.out.println("Customer      : " + finalInvoice.getUserName());
                System.out.println("Invoice No    : " + finalInvoice.getInvoiceNumber());
                System.out.println("==================================================");

                emailService.sendInvoiceEmail(finalInvoice, pdfBytes);

                System.out.println("✅ EMAIL SENT SUCCESSFULLY to " + finalInvoice.getUserEmail());
                System.out.println("==================================================\n");
            } else {
                System.out.println("⚠️ User email is empty, skipping email send");
            }
        } catch (Exception e) {
            System.err.println("⚠️ Failed to generate PDF or send email: " + e.getMessage());
            e.printStackTrace();
            // Don't fail invoice generation if PDF/email fails
        }

        return finalInvoice;
    }

    public byte[] downloadInvoicePDF(Long invoiceId) {

        UserInvoice invoice = invoiceRepo.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice Not Found"));

        String html = InvoiceHTMLBuilder.build(invoice);
        return PdfGenerator.generatePdfBytes(html);
    }
}
