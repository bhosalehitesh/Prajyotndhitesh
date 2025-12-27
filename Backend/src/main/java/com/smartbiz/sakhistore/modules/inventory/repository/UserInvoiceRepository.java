package com.smartbiz.sakhistore.modules.inventory.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartbiz.sakhistore.modules.inventory.model.UserInvoice;

public interface UserInvoiceRepository extends JpaRepository<UserInvoice, Long> {}
