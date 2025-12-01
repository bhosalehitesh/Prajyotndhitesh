package com.smartbiz.sakhistore.modules.inventory.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartbiz.sakhistore.modules.inventory.model.Inventory;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

}
