package com.smartbiz.sakhistore.modules.customer_user.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendWelcomeEmail(String toEmail, String fullName, String phone) throws Exception {

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(toEmail);
        helper.setSubject("🎉 Welcome to Sakhi Store!");

        // ⭐ EMAIL TEMPLATE WITH NAME + PHONE ⭐
        String html = """
                <html>
                <body style="font-family:Arial, sans-serif;">

                    <h2 style="color:#4CAF50;">Welcome to Sakhi Store 🎉</h2>

                    <p>Hello <b>%s</b>,</p>

                    <p>Thank you for creating your account with <b>Sakhi Store</b>.</p>

                    <h3>Your Account Details:</h3>
                    <ul>
                        <li><b>Full Name:</b> %s</li>
                        <li><b>Phone Number:</b> %s</li>
                        <li><b>Email:</b> %s</li>
                    </ul>

                    <p>You can now explore our products and place your orders easily.</p>

                    <br/>
                    <hr/>

                    <p style="font-size:12px; color:gray;">
                        © 2025 Sakhi Store. All Rights Reserved.
                    </p>

                </body>
                </html>
                """.formatted(fullName, fullName, phone, toEmail);

        helper.setText(html, true);
        mailSender.send(message);
    }
}
