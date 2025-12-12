package com.smartbiz.sakhistore.modules.inventory.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.smartbiz.sakhistore.config.EmailServicePdf;
import com.smartbiz.sakhistore.modules.customer_user.model.User;
import com.smartbiz.sakhistore.modules.inventory.model.InvoiceHTMLBuilder;
import com.smartbiz.sakhistore.modules.inventory.model.InvoiceItem;
import com.smartbiz.sakhistore.modules.inventory.model.PdfGenerator;
import com.smartbiz.sakhistore.modules.inventory.model.UserInvoice;
import com.smartbiz.sakhistore.modules.inventory.repository.UserInvoiceItemRepository;
import com.smartbiz.sakhistore.modules.inventory.repository.UserInvoiceRepository;
import com.smartbiz.sakhistore.modules.order.model.OrderItems;
import com.smartbiz.sakhistore.modules.order.model.Orders;
import com.smartbiz.sakhistore.modules.order.repository.OrdersRepository;
import com.smartbiz.sakhistore.modules.payment.model.Payment;

@Service
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

        Orders order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order Not Found"));

        User user = order.getUser();
        Payment payment = order.getPayment();

        UserInvoice invoice = new UserInvoice();
        invoice.setInvoiceNumber("INV-" + System.currentTimeMillis());
        invoice.setInvoiceDate(LocalDateTime.now());

        invoice.setOrderId(orderId);
        invoice.setUserId(user.getId());
  //      invoice.setPaymentId(payment.getPayment_idAuto());

        invoice.setUserName(user.getFullName());
        invoice.setUserPhone(user.getPhone());
        invoice.setUserEmail(user.getEmail());

        String address = user.getFlatOrHouseNo() + ", " +
                user.getAreaOrStreet() + ", " +
                user.getCity() + ", " +
                user.getState() + " - " + user.getPincode();

        invoice.setBillingAddress(address);
        invoice.setShippingAddress(address);

        double subtotal = 0.0;
        double gstTotal = 0.0;

        for (OrderItems oi : order.getOrderItems()) {
            double itemSubtotal = oi.getPrice() * oi.getQuantity();
            double gst = itemSubtotal * 0.05;

            subtotal += itemSubtotal;
            gstTotal += gst;
        }

        double discount = subtotal * 0.05;
        double delivery = 30.0;
        double grandTotal = subtotal + gstTotal + delivery - discount;

        invoice.setSubTotal(subtotal);
        invoice.setTaxAmount(gstTotal);
        invoice.setDiscountAmount(discount);
        invoice.setDeliveryCharges(delivery);
        invoice.setGrandTotal(grandTotal);
        invoice.setPaymentStatus(payment.getStatus().name());
        invoice.setPaymentAmount(payment.getAmount());

        List<InvoiceItem> items = new ArrayList<>();

        for (OrderItems oi : order.getOrderItems()) {

            InvoiceItem it = new InvoiceItem();
            it.setInvoice(invoice);

            it.setOrderItemId(oi.getOrderItemsId());
            it.setProductId(oi.getProduct().getProductsId());
            it.setProductName(oi.getProduct().getProductName());
            it.setSize(oi.getProduct().getSize());
            it.setQuantity(oi.getQuantity());
            it.setPrice(oi.getPrice());

            double gst = oi.getPrice() * oi.getQuantity() * 0.05;

            it.setGstPercent(5.0);
            it.setGstAmount(gst);
            it.setTotal(oi.getPrice() * oi.getQuantity() + gst);

            items.add(it);
        }

        invoice.setItems(items);

        invoiceRepo.save(invoice);
        itemRepo.saveAll(items);

        invoice = invoiceRepo.findById(invoice.getInvoiceId()).orElseThrow();

        // ========= LOGGING ==========
        System.out.println("\n================= INVOICE GENERATED =================");
        System.out.println("Invoice ID    : " + invoice.getInvoiceId());
        System.out.println("Invoice No    : " + invoice.getInvoiceNumber());
        System.out.println("Order ID      : " + invoice.getOrderId());
        System.out.println("Customer Name : " + invoice.getUserName());
        System.out.println("Customer Phone: " + invoice.getUserPhone());
        System.out.println("Customer Email: " + invoice.getUserEmail());
        System.out.println("-----------------------------------------------------");
        System.out.println("Subtotal      : ₹" + invoice.getSubTotal());
        System.out.println("GST (5%)      : ₹" + invoice.getTaxAmount());
        System.out.println("Discount (5%) : ₹" + invoice.getDiscountAmount());
        System.out.println("Delivery      : ₹" + invoice.getDeliveryCharges());
        System.out.println("GRAND TOTAL   : ₹" + invoice.getGrandTotal());
        System.out.println("-----------------------------------------------------");
        System.out.println("Items Count   : " + invoice.getItems().size());
        System.out.println("=====================================================\n");

        // ================== PDF GENERATION ==================
        String html = InvoiceHTMLBuilder.build(invoice);
        byte[] pdfBytes = PdfGenerator.generatePdfBytes(html);

        System.out.println("PDF Generated (" + pdfBytes.length + " bytes)");

        // ================== SEND EMAIL ==================
        System.out.println("\n================= SENDING EMAIL =================");
        System.out.println("To            : " + invoice.getUserEmail());
        System.out.println("Customer      : " + invoice.getUserName());
        System.out.println("Invoice No    : " + invoice.getInvoiceNumber());
        System.out.println("==================================================");

        emailService.sendInvoiceEmail(invoice, pdfBytes);

        System.out.println("✅ EMAIL SENT SUCCESSFULLY to " + invoice.getUserEmail());
        System.out.println("==================================================\n");

        return invoice;
    }

    public byte[] downloadInvoicePDF(Long invoiceId) {

        UserInvoice invoice = invoiceRepo.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice Not Found"));

        String html = InvoiceHTMLBuilder.build(invoice);
        return PdfGenerator.generatePdfBytes(html);
    }
}
