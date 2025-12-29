package com.smartbiz.sakhistore.modules.inventory.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

import com.smartbiz.sakhistore.modules.inventory.model.Inventory;
import com.smartbiz.sakhistore.modules.product.model.Product;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByProduct(Product product);
}
