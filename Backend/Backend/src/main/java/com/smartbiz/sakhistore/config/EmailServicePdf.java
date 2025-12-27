package com.smartbiz.sakhistore.config;

import org.springframework.core.io.ByteArrayResource; 
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.smartbiz.sakhistore.modules.inventory.model.UserInvoice;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailServicePdf {

    private final JavaMailSender mailSender;

    public EmailServicePdf(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendInvoiceEmail(UserInvoice invoice, byte[] pdfBytes) {

        try {
            System.out.println("\n============================");
            System.out.println("📧 SENDING INVOICE EMAIL...");
            System.out.println("============================");
            System.out.println("To: " + invoice.getUserEmail());
            System.out.println("Customer: " + invoice.getUserName());
            System.out.println("Invoice No: " + invoice.getInvoiceNumber());
            System.out.println("Order ID: " + invoice.getOrderId());
            System.out.println("Total Amount: ₹" + invoice.getGrandTotal());
            System.out.println("PDF Attachment Size: " + pdfBytes.length + " bytes");
            System.out.println("============================\n");

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(invoice.getUserEmail());
            helper.setSubject("Your Invoice - " + invoice.getInvoiceNumber());

            String htmlContent = """
                    <h2>Sakhi Store - Invoice</h2>
                    <p>Hello <b>%s</b>,</p>
                    <p>Your invoice <b>%s</b> is generated.</p>
                    <p>Total Amount: <b>₹%s</b></p>
                    <p>Your PDF invoice is attached.</p>
                    """.formatted(
                    invoice.getUserName(),
                    invoice.getInvoiceNumber(),
                    invoice.getGrandTotal()
            );

            helper.setText(htmlContent, true);

            helper.addAttachment(
                    invoice.getInvoiceNumber() + ".pdf",
                    new ByteArrayResource(pdfBytes)
            );

            mailSender.send(message);

            // SUCCESS LOG
            System.out.println("✅ EMAIL SENT SUCCESSFULLY to " + invoice.getUserEmail());
            System.out.println("============================\n");

        } catch (Exception e) {
            System.out.println("❌ ERROR SENDING EMAIL: " + e.getMessage());
            throw new RuntimeException("Failed to send invoice email", e);
        }
    }
}
