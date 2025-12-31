package com.smartbiz.sakhistore.modules.inventory.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartbiz.sakhistore.modules.inventory.model.UserInvoice;
import java.util.List;

public interface UserInvoiceRepository extends JpaRepository<UserInvoice, Long> {
    /**
     * Find all invoices for a given order ID
     */
    List<UserInvoice> findByOrderId(Long orderId);
}
