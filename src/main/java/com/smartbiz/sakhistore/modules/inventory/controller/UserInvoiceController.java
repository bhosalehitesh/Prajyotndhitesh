package com.smartbiz.sakhistore.modules.inventory.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartbiz.sakhistore.config.EmailServicePdf;
import com.smartbiz.sakhistore.modules.inventory.dto.*;
import com.smartbiz.sakhistore.modules.inventory.model.InvoiceHTMLBuilder;
import com.smartbiz.sakhistore.modules.inventory.model.PdfGenerator;
import com.smartbiz.sakhistore.modules.inventory.model.UserInvoice;
import com.smartbiz.sakhistore.modules.inventory.repository.UserInvoiceRepository;
import com.smartbiz.sakhistore.modules.inventory.service.InvoiceServiceImpl;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/invoice")
public class UserInvoiceController {

    private final EmailServicePdf emailServicePdf;

    private final InvoiceServiceImpl invoiceService;
    private final UserInvoiceRepository invoiceRepo;
    
    @Autowired
    private InventoryMapper inventoryMapper;

    public UserInvoiceController(InvoiceServiceImpl invoiceService,
                             UserInvoiceRepository invoiceRepo, EmailServicePdf emailServicePdf) {
        this.invoiceService = invoiceService;
        this.invoiceRepo = invoiceRepo;
        this.emailServicePdf = emailServicePdf;
    }

    // -----------------------------------------------------------
    // ✔ 1. Generate Invoice from Order ID (Using DTO)
    // -----------------------------------------------------------
    @PostMapping("/generate/{orderId}")
    public ResponseEntity<InvoiceResponseDTO> generateInvoice(@PathVariable Long orderId) {
        UserInvoice invoice = invoiceService.generateInvoice(orderId);
        InvoiceResponseDTO responseDTO = inventoryMapper.toInvoiceResponseDTO(invoice);
        return ResponseEntity.ok(responseDTO);
    }
    
    // Alternative endpoint using DTO request
    @PostMapping("/generate")
    public ResponseEntity<InvoiceResponseDTO> generateInvoiceWithDTO(@Valid @RequestBody InvoiceRequestDTO request) {
        if (!request.isValid()) {
            return ResponseEntity.badRequest().build();
        }
        
        UserInvoice invoice = invoiceService.generateInvoice(request.getOrderId());
        InvoiceResponseDTO responseDTO = inventoryMapper.toInvoiceResponseDTO(invoice);
        return ResponseEntity.ok(responseDTO);
    }


    // -----------------------------------------------------------
    // ✔ 2. Download PDF for Invoice
    // -----------------------------------------------------------
    @GetMapping("/pdf/{invoiceId}")
    public ResponseEntity<?> downloadInvoice(@PathVariable Long invoiceId) {

        UserInvoice invoice = invoiceRepo.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice Not Found"));

        byte[] pdfBytes = invoiceService.downloadInvoicePDF(invoiceId);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=" + invoice.getInvoiceNumber() + ".pdf")
                .body(pdfBytes);
    }


    // -----------------------------------------------------------
    // ✔ 3. Get Invoice Details (Using DTO)
    // -----------------------------------------------------------
    @GetMapping("/{invoiceId}")
    public ResponseEntity<InvoiceResponseDTO> getInvoiceDetails(@PathVariable Long invoiceId) {
        UserInvoice invoice = invoiceRepo.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice Not Found"));
        
        InvoiceResponseDTO responseDTO = inventoryMapper.toInvoiceResponseDTO(invoice);
        return ResponseEntity.ok(responseDTO);
    }
    
    // 📌 NEW: send invoice email manually
    @PostMapping("/send-email/{invoiceId}")
    public ResponseEntity<?> sendInvoiceEmail(@PathVariable Long invoiceId) {

        UserInvoice invoice = invoiceRepo.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice Not Found"));

        String html = InvoiceHTMLBuilder.build(invoice);
        byte[] pdfBytes = PdfGenerator.generatePdfBytes(html);

        // LOGS
        System.out.println("\n================== MANUAL EMAIL SEND ==================");
        System.out.println("Sending invoice email manually...");
        System.out.println("Invoice ID : " + invoiceId);
        System.out.println("Invoice No : " + invoice.getInvoiceNumber());
        System.out.println("Customer   : " + invoice.getUserName());
        System.out.println("Email      : " + invoice.getUserEmail());
        System.out.println("=======================================================\n");

        emailServicePdf.sendInvoiceEmail(invoice, pdfBytes);

        System.out.println("✅ Manual Email Sent Successfully");
        
        return ResponseEntity.ok("Invoice Email sent successfully");
    }
}

