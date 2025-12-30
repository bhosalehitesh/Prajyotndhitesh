package com.smartbiz.sakhistore.modules.order.model;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

public class OrderInvoiceEmailHTMLBuilder {

    private static String escapeHtml(Object value) {
        if (value == null) return "";
        String s = String.valueOf(value);
        StringBuilder out = new StringBuilder();
        for (char c : s.toCharArray()) {
            switch (c) {
                case '&' -> out.append("&amp;");
                case '<' -> out.append("&lt;");
                case '>' -> out.append("&gt;");
                case '"' -> out.append("&quot;");
                case '\'' -> out.append("&#x27;");
                case '/' -> out.append("&#x2F;");
                default -> out.append(c);
            }
        }
        return out.toString();
    }

    public static String build(Orders order) {
        if (order == null) {
            return "<html><body>Order not found</body></html>";
        }

        // Get user details
        String customerName = "Customer";
        
        if (order.getUser() != null) {
            customerName = order.getUser().getFullName() != null 
                ? order.getUser().getFullName() 
                : "Customer";
        }

        // Format order date
        String invoiceDate = "";
        if (order.getCreationTime() != null) {
            invoiceDate = order.getCreationTime().format(DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm"));
        } else {
            invoiceDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm"));
        }

        // Get order details
        String orderId = String.valueOf(order.getOrdersId() != null ? order.getOrdersId() : "");
        String invoiceNumber = "INV-" + orderId;
        String grandTotal = String.format("%.2f", order.getTotalAmount() != null ? order.getTotalAmount() : 0.0);
        
        // Generate QR code data
        String qrData = String.format(
            "orderId:%s|customer:%s|amount:Rs.%s|date:%s",
            escapeHtml(orderId),
            escapeHtml(customerName),
            escapeHtml(grandTotal),
            escapeHtml(invoiceDate)
        );
        String encodedPdfUrl = URLEncoder.encode(qrData, StandardCharsets.UTF_8);

        // Build the email HTML template
        String template = """
<!DOCTYPE html>
<html>
<body style="margin:0; padding:0; background:#ffffff; font-family:Arial,Helvetica,sans-serif;">

<!-- Outer Wrapper -->
<table width="100%" cellpadding="0" cellspacing="0" style="padding:0; background:#ffffff;">
  <tr>
    <td align="center">   

      <!-- Main Card -->
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:0;">

        <!-- Logo -->
        <tr>
          <td align="center" style="padding:25px; background:#ffffff; border-bottom:1px solid #e5e5e5;">
            <img src="http://res.cloudinary.com/dgrxmavho/image/upload/v1765521041/ecommerce/i4og08lx9ft3ffy1su9n.jpg" 
                 alt="Sakhi Store Logo" 
                 style="width:160px; height:auto;">
          </td>
        </tr>

        <!-- Title Section -->
        <tr>
          <td style="padding:30px 35px 10px; text-align:center; background:#ffffff;">
            <h2 style="margin:0; font-size:24px; color:#111; font-weight:700;">
              Your Invoice is Ready
            </h2>
            <p style="margin:12px 0; font-size:15px; color:#333; line-height:1.6;">
              Hello <strong>%s</strong>,<br>
              Thank you for shopping with <strong>Sakhi Store</strong>.<br>
              Your invoice has been successfully generated.
            </p>
          </td>
        </tr>

        <!-- Invoice Summary -->
        <tr>
          <td style="padding:20px 35px; background:#ffffff;">
            <table width="100%" style="border-radius:8px; border:1px solid #e5e5e5; padding:18px; background:#ffffff;">
              
              <tr><td style="font-size:15px; padding:6px 0; color:#222;">
                <strong>Invoice Number:</strong> %s
              </td></tr>

              <tr><td style="font-size:15px; padding:6px 0; color:#222;">
                <strong>Order ID:</strong> #%s
              </td></tr>

              <tr><td style="font-size:15px; padding:6px 0; color:#222;">
                <strong>Total Amount:</strong>
                <span style="color:#E3007A; font-weight:bold;">Rs. %s</span>
              </td></tr>

              <tr><td style="font-size:15px; padding:6px 0; color:#222;">
                <strong>Date:</strong> %s
              </td></tr>

              <tr><td style="font-size:15px; padding:6px 0; color:#222;">
                <strong>Order Status:</strong> %s
              </td></tr>

              <tr><td style="font-size:15px; padding:6px 0; color:#222;">
                <strong>Payment Status:</strong> %s
              </td></tr>

            </table>
          </td>
        </tr>

        <!-- Order Items Summary -->
        <tr>
          <td style="padding:20px 35px; background:#ffffff;">
            <h3 style="margin:0 0 15px; font-size:18px; color:#111; font-weight:600;">
              Order Items
            </h3>
            <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse; border:1px solid #e5e5e5;">
              <thead>
                <tr style="background:#f5f5f5;">
                  <th align="left" style="padding:10px; border:1px solid #e5e5e5; font-size:13px; color:#222;">Product</th>
                  <th align="center" style="padding:10px; border:1px solid #e5e5e5; font-size:13px; color:#222;">Qty</th>
                  <th align="right" style="padding:10px; border:1px solid #e5e5e5; font-size:13px; color:#222;">Price</th>
                  <th align="right" style="padding:10px; border:1px solid #e5e5e5; font-size:13px; color:#222;">Total</th>
                </tr>
              </thead>
              <tbody>
                %s
              </tbody>
            </table>
          </td>
        </tr>

        <!-- Download Button -->
        <tr>
          <td align="center" style="padding:20px 35px 10px; background:#ffffff;">
            <p style="margin:0 0 15px; font-size:14px; color:#666;">
              Your detailed invoice PDF is attached to this email.
            </p>
            <p style="margin:0; font-size:13px; color:#888;">
              Please check the attachment: <strong>Order_%s_Invoice.pdf</strong>
            </p>
          </td>
        </tr>

        <!-- QR Code -->
        <tr>
          <td align="center" style="padding:0 30px 25px; background:#ffffff;">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=%s"
                 alt="Invoice QR"
                 style="width:130px; height:130px; border-radius:8px; border:1px solid #ccc;">
            <p style="font-size:13px; color:#666; margin-top:10px;">
              Scan to verify your order details
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="padding:20px; background:#ffffff; border-top:1px solid #e5e5e5;">
            <p style="margin:0; font-size:13px; color:#555;">
              © <strong>Sakhi Store</strong>, Pune, Maharashtra
            </p>
            <p style="margin:6px 0 0; font-size:12px; color:#777;">
              Need help? Contact  
              <a href="mailto:support@sakhistore.com" style="color:#E3007A; text-decoration:none;">support@sakhistore.com</a>
            </p>
            <p style="margin:5px 0 0; font-size:11px; color:#aaa;">
              This is an automated email – do not reply.
            </p>
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>

</body>
</html>
""";
        
        // Format the template with actual values - use try-catch to handle format errors
        try {
            String orderStatusStr = order.getOrderStatus() != null ? order.getOrderStatus().toString() : "PLACED";
            String paymentStatusStr = order.getPaymentStatus() != null ? order.getPaymentStatus().toString() : "PENDING";
            String itemsTable = buildOrderItemsTable(order);
            
            return String.format(template,
                escapeHtml(customerName),      // %s for customer name
                escapeHtml(invoiceNumber),     // %s for invoice number
                escapeHtml(orderId),           // %s for order ID
                escapeHtml(grandTotal),        // %s for grand total
                escapeHtml(invoiceDate),       // %s for invoice date
                escapeHtml(orderStatusStr),    // %s for order status
                escapeHtml(paymentStatusStr), // %s for payment status
                itemsTable,                    // %s for order items table (already HTML, don't escape)
                escapeHtml(orderId),           // %s for order ID in attachment name
                encodedPdfUrl                  // %s for QR code URL
            );
        } catch (java.util.IllegalFormatException e) {
            // If format fails, return a simple fallback template
            System.err.println("❌ Error formatting email template: " + e.getMessage());
            e.printStackTrace();
            return buildFallbackEmailTemplate(order, customerName, invoiceNumber, orderId, grandTotal, invoiceDate);
        }
    }

    private static String buildOrderItemsTable(Orders order) {
        StringBuilder itemsHtml = new StringBuilder();
        
        if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
            for (OrderItems item : order.getOrderItems()) {
                String productName = "Product";
                if (item.getProduct() != null) {
                    productName = item.getProduct().getProductName() != null 
                        ? item.getProduct().getProductName() 
                        : "Product";
                }
                
                // Get unit price directly from database: prefer variant price, fallback to product price
                // DO NOT use item.getPrice() as it is already total (unitPrice * quantity)
                Double unitPrice = null;
                if (item.getVariant() != null && item.getVariant().getSellingPrice() != null) {
                    unitPrice = item.getVariant().getSellingPrice();
                } else if (item.getProduct() != null && item.getProduct().getSellingPrice() != null) {
                    unitPrice = item.getProduct().getSellingPrice();
                } else if (item.getPrice() != null && item.getQuantity() != null && item.getQuantity() > 0) {
                    // Fallback: calculate unit price from stored total (if relationships not loaded)
                    unitPrice = item.getPrice() / item.getQuantity();
                }
                
                Double itemPrice = unitPrice != null ? unitPrice : 0.0;
                Integer quantity = item.getQuantity() != null ? item.getQuantity() : 0;
                Double itemTotal = itemPrice * quantity; // Calculate total correctly: unitPrice * quantity

                itemsHtml.append("                <tr>")
                        .append("<td style=\"padding:10px; border:1px solid #e5e5e5; font-size:13px; color:#222;\">")
                        .append(escapeHtml(productName))
                        .append("</td>")
                        .append("<td align=\"center\" style=\"padding:10px; border:1px solid #e5e5e5; font-size:13px; color:#222;\">")
                        .append(escapeHtml(String.valueOf(quantity)))
                        .append("</td>")
                        .append("<td align=\"right\" style=\"padding:10px; border:1px solid #e5e5e5; font-size:13px; color:#222;\">")
                        .append("Rs. ").append(String.format("%.2f", itemPrice))
                        .append("</td>")
                        .append("<td align=\"right\" style=\"padding:10px; border:1px solid #e5e5e5; font-size:13px; color:#222; font-weight:600;\">")
                        .append("Rs. ").append(String.format("%.2f", itemTotal))
                        .append("</td>")
                        .append("</tr>\n");
            }
        } else {
            itemsHtml.append("                <tr>")
                    .append("<td colspan=\"4\" align=\"center\" style=\"padding:15px; color:#888; font-size:13px;\">")
                    .append("No items found")
                    .append("</td>")
                    .append("</tr>\n");
        }
        
        return itemsHtml.toString();
    }
    
    private static String buildFallbackEmailTemplate(Orders order, String customerName, String invoiceNumber, 
                                                     String orderId, String grandTotal, String invoiceDate) {
        return """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; padding: 20px;">
    <h2>Your Invoice is Ready</h2>
    <p>Hello <strong>%s</strong>,</p>
    <p>Thank you for shopping with <strong>Sakhi Store</strong>.</p>
    <p>Your invoice has been successfully generated.</p>
    <hr>
    <p><strong>Invoice Number:</strong> %s</p>
    <p><strong>Order ID:</strong> #%s</p>
    <p><strong>Total Amount:</strong> Rs. %s</p>
    <p><strong>Date:</strong> %s</p>
    <hr>
    <p>Your detailed invoice PDF is attached to this email.</p>
    <p>Please check the attachment: <strong>Order_%s_Invoice.pdf</strong></p>
    <hr>
    <p>© Sakhi Store, Pune, Maharashtra</p>
</body>
</html>
""".formatted(
            escapeHtml(customerName),
            escapeHtml(invoiceNumber),
            escapeHtml(orderId),
            escapeHtml(grandTotal),
            escapeHtml(invoiceDate),
            escapeHtml(orderId)
        );
    }
}

