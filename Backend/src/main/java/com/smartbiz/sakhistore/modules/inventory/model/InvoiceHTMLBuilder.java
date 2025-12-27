package com.smartbiz.sakhistore.modules.inventory.model;

public class InvoiceHTMLBuilder {

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

    public static String build(UserInvoice invoice) {

        if (invoice == null)
            return "<html><body>Invoice not found</body></html>";

        /* ⭐ ADD QR CODE HERE ⭐ */
        String qrBase64 = QrUtil.generateBase64QRCode(
                "Invoice: " + invoice.getInvoiceNumber() +
                " | Order: " + invoice.getOrderId() +
                " | User: " + invoice.getUserName()
        );

        // Build items
        StringBuilder itemsHtml = new StringBuilder();
        if (invoice.getItems() != null) {
            invoice.getItems().forEach(item -> {
                itemsHtml.append("<tr>")
                        .append("<td>").append(escapeHtml(item.getProductName())).append("</td>")
                        .append("<td>").append(escapeHtml(item.getSize())).append("</td>")
                        .append("<td style='text-align:center;'>").append(escapeHtml(item.getQuantity())).append("</td>")
                        .append("<td style='text-align:right;'>").append(escapeHtml(item.getPrice())).append("</td>")
                        .append("<td style='text-align:right;'>").append(escapeHtml(item.getGstPercent())).append("%</td>")
                        .append("<td style='text-align:right;'>").append(escapeHtml(item.getTotal())).append("</td>")
                        .append("</tr>");
            });
        }

        String html = ""
            + "<html><head>"
            + "<meta charset='utf-8'/>"
            + "<style>"
            + "body{font-family: Arial, sans-serif; font-size:12px; color:#333}"
            + "table{width:100%;border-collapse:collapse}"
            + "th,td{border:1px solid #ddd;padding:8px}"
            + "th{background:#f5f5f5}"
            + "</style>"
            + "</head><body><div class='wrap'>"

            /* ⭐ QR CODE AT TOP ⭐ */
            + "<div style='text-align:right; margin-bottom:10px;'>"
            + "<img style='width:120px' src='data:image/png;base64," + qrBase64 + "' />"
            + "</div>"

            + "<h2>INVOICE</h2>"

            + "<div style='display:flex;justify-content:space-between'>"
            + "<div>"
            + "<strong>Bill To:</strong><br/>"
            + escapeHtml(invoice.getUserName()) + "<br/>"
            + escapeHtml(invoice.getUserPhone()) + "<br/>"
            + escapeHtml(invoice.getUserEmail()) + "<br/>"
            + "</div>"

            + "<div style='text-align:right'>"
            + "<strong>Invoice No:</strong> " + escapeHtml(invoice.getInvoiceNumber()) + "<br/>"
            + "<strong>Invoice Date:</strong> " + escapeHtml(invoice.getInvoiceDate()) + "<br/>"
            + "<strong>Order Id:</strong> " + escapeHtml(invoice.getOrderId()) + "<br/>"
            + "</div>"
            + "</div>"

            + "<h4>Billing Address</h4>"
            + escapeHtml(invoice.getBillingAddress())

            + "<h4 style='margin-top:16px'>Items</h4>"
            + "<table>"
            + "<thead><tr>"
            + "<th>Product</th><th>Size</th><th>Qty</th>"
            + "<th>Price</th><th>GST</th><th>Total</th>"
            + "</tr></thead><tbody>"
            + itemsHtml
            + "</tbody></table>"

            + "<div class='summary'>"
            + "<table>"
            + "<tr><td>Subtotal</td><td>" + escapeHtml(invoice.getSubTotal()) + "</td></tr>"
            + "<tr><td>Tax</td><td>" + escapeHtml(invoice.getTaxAmount()) + "</td></tr>"
            + "<tr><td>Discount</td><td>" + escapeHtml(invoice.getDiscountAmount()) + "</td></tr>"
            + "<tr><td>Delivery</td><td>" + escapeHtml(invoice.getDeliveryCharges()) + "</td></tr>"
            + "<tr><th>Grand Total</th><th>" + escapeHtml(invoice.getGrandTotal()) + "</th></tr>"
            + "</table></div>"

            + "<p style='color:#777; font-size:10px; margin-top:40px;'>This is a computer-generated invoice.</p>"

            + "</div></body></html>";

        return html;
    }
}
