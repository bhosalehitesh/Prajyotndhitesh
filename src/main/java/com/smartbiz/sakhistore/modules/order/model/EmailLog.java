package com.smartbiz.sakhistore.modules.order.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "email_logs")
@Getter
@Setter
public class EmailLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long orderId;
    
    @Column(nullable = false, length = 255)
    private String recipientEmail;
    
    @Column(nullable = false, length = 255)
    private String subject;
    
    @Column(nullable = false, length = 50)
    private String status; // SUCCESS, FAILED, PENDING
    
    @Column(length = 1000)
    private String errorMessage;
    
    @Column(nullable = false)
    private LocalDateTime sentAt;
    
    @Column(nullable = false)
    private Integer pdfSizeBytes = 0; // Default to 0, never null
    
    public EmailLog() {
        this.sentAt = LocalDateTime.now();
        this.pdfSizeBytes = 0; // Default to 0, never null
    }

    public EmailLog(Long orderId, String recipientEmail, String subject, String status) {
        this();
        this.orderId = orderId;
        this.recipientEmail = recipientEmail;
        this.subject = subject;
        this.status = status;
        this.pdfSizeBytes = 0; // Default to 0, never null
    }
}

