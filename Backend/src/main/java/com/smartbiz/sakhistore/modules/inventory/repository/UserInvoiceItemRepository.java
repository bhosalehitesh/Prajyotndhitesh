package com.smartbiz.sakhistore.modules.inventory.repository;
import org.springframework.data.jpa.repository.JpaRepository;

import com.smartbiz.sakhistore.modules.inventory.model.InvoiceItem;

public interface UserInvoiceItemRepository extends JpaRepository<InvoiceItem, Long> {}
