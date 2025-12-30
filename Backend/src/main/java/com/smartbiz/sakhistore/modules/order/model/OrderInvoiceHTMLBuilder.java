package com.smartbiz.sakhistore.modules.order.model;

import com.smartbiz.sakhistore.modules.inventory.model.QrUtil;
import java.time.format.DateTimeFormatter;

public class OrderInvoiceHTMLBuilder {

    private static String escapeHtml(Object value) {
        if (value == null) return "";
        String s = String.valueOf(value);
        StringBuilder out = new StringBuilder(Math.max(16, s.length()));
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
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

        // Generate QR Code
        String qrBase64 = QrUtil.generateBase64QRCode(
                "Order ID: " + order.getOrdersId() +
                " | Customer: " + (order.getUser() != null ? order.getUser().getFullName() : "N/A") +
                " | Amount: Rs. " + (order.getTotalAmount() != null ? order.getTotalAmount() : "0.00")
        );

        // Build order items HTML
        StringBuilder itemsHtml = new StringBuilder();
        if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
            int itemNumber = 1;
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

                itemsHtml.append("<tr>")
                        .append("<td>").append(itemNumber++).append("</td>")
                        .append("<td>").append(escapeHtml(productName)).append("</td>")
                        .append("<td style='text-align:center;'>").append(escapeHtml(quantity)).append("</td>")
                        .append("<td style='text-align:right;'>Rs. ").append(String.format("%.2f", itemPrice)).append("</td>")
                        .append("<td style='text-align:right;'>Rs. ").append(String.format("%.2f", itemTotal)).append("</td>")
                        .append("</tr>");
            }
        }

        // Format order date
        String orderDate = "";
        if (order.getCreationTime() != null) {
            orderDate = order.getCreationTime().format(DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm"));
        }

        // Get user details
        String userName = "Customer";
        String userPhone = "";
        String userEmail = "";
        if (order.getUser() != null) {
            userName = order.getUser().getFullName() != null ? order.getUser().getFullName() : "Customer";
            userPhone = order.getUser().getPhone() != null ? order.getUser().getPhone() : "";
            userEmail = order.getUser().getEmail() != null ? order.getUser().getEmail() : "";
        }

        // Get order status and payment status
        String orderStatus = order.getOrderStatus() != null ? order.getOrderStatus().toString() : "PLACED";
        String paymentStatus = order.getPaymentStatus() != null ? order.getPaymentStatus().toString() : "PENDING";

        // Calculate totals
        Double totalAmount = order.getTotalAmount() != null ? order.getTotalAmount() : 0.0;

        String html = ""
            + "<html><head>"
            + "<meta charset='utf-8'/>"
            + "<style>"
            + "body{font-family: Arial, sans-serif; font-size:12px; color:#333; margin:20px;}"
            + "table{width:100%;border-collapse:collapse; margin-top:10px;}"
            + "th,td{border:1px solid #ddd;padding:8px; text-align:left;}"
            + "th{background:#f5f5f5; font-weight:bold;}"
            + ".header{display:flex;justify-content:space-between; margin-bottom:20px;}"
            + ".summary{float:right; width:300px; margin-top:20px;}"
            + ".summary table{width:100%;}"
            + ".summary th{text-align:right;}"
            + ".summary td{text-align:right;}"
            + "h2{color:#e61580; margin-bottom:10px;}"
            + "h4{margin-top:20px; margin-bottom:10px;}"
            + "</style>"
            + "</head><body>"
            
            // QR Code
            + "<div style='text-align:right; margin-bottom:20px;'>"
            + "<img style='width:120px' src='data:image/png;base64," + qrBase64 + "' />"
            + "</div>"

            + "<h2>ORDER INVOICE</h2>"

            // Header with customer and order info
            + "<div class='header'>"
            + "<div>"
            + "<strong>Bill To:</strong><br/>"
            + escapeHtml(userName) + "<br/>"
            + (userPhone.isEmpty() ? "" : escapeHtml(userPhone) + "<br/>")
            + (userEmail.isEmpty() ? "" : escapeHtml(userEmail) + "<br/>")
            + "</div>"
            + "<div style='text-align:right'>"
            + "<strong>Order ID:</strong> #" + escapeHtml(String.valueOf(order.getOrdersId())) + "<br/>"
            + "<strong>Order Date:</strong> " + escapeHtml(orderDate) + "<br/>"
            + "<strong>Order Status:</strong> " + escapeHtml(orderStatus) + "<br/>"
            + "<strong>Payment Status:</strong> " + escapeHtml(paymentStatus) + "<br/>"
            + "</div>"
            + "</div>"

            // Shipping Address
            + "<h4>Shipping Address</h4>"
            + "<div style='margin-bottom:15px; padding:10px; background:#f9f9f9; border-radius:5px;'>"
            + escapeHtml(order.getAddress() != null ? order.getAddress() : "N/A")
            + (order.getMobile() != null ? "<br/>Phone: " + escapeHtml(String.valueOf(order.getMobile())) : "")
            + "</div>"

            // Order Items
            + "<h4>Order Items</h4>"
            + "<table>"
            + "<thead><tr>"
            + "<th>#</th><th>Product Name</th><th>Quantity</th>"
            + "<th>Unit Price</th><th>Total</th>"
            + "</tr></thead><tbody>"
            + itemsHtml
            + "</tbody></table>"

            // Summary
            + "<div class='summary'>"
            + "<table>"
            + "<tr><td><strong>Subtotal:</strong></td><td>Rs. " + String.format("%.2f", totalAmount) + "</td></tr>"
            + "<tr><td><strong>Total Amount:</strong></td><td><strong>Rs. " + String.format("%.2f", totalAmount) + "</strong></td></tr>"
            + "</table></div>"

            + "<div style='clear:both; margin-top:40px; padding-top:20px; border-top:1px solid #ddd;'>"
            + "<p style='color:#777; font-size:10px;'>"
            + "Thank you for your order! This is a computer-generated invoice.<br/>"
            + "For any queries, please contact our customer support."
            + "</p>"
            + "</div>"

            + "</body></html>";

        return html;
    }
}

