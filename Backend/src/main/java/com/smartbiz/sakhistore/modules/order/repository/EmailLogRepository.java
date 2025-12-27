package com.smartbiz.sakhistore.modules.order.repository;

import com.smartbiz.sakhistore.modules.order.model.EmailLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmailLogRepository extends JpaRepository<EmailLog, Long> {
    
    List<EmailLog> findByOrderId(Long orderId);
    
    List<EmailLog> findByRecipientEmail(String recipientEmail);
    
    List<EmailLog> findByStatus(String status);
    
    List<EmailLog> findByOrderIdOrderBySentAtDesc(Long orderId);
}

