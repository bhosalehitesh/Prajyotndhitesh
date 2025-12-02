package com.smartbiz.sakhistore.modules.inventory.model;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import com.smartbiz.sakhistore.modules.product.model.Product;

@Entity
@Table(name="inventory")
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long inventoryId;

    String Download_currentinventory;

    String Upload_edited_inventory;


    // ✅ Use @ManyToOne instead of @OneToOne
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id") // FK column in inventory table
    private Product product;





    public Product getProduct() {
        return product;
    }


    public void setProduct(Product product) {
        this.product = product;
    }


    public Long getInventoryId() {
        return inventoryId;
    }


    public void setInventoryId(Long inventoryId) {
        this.inventoryId = inventoryId;
    }


    public String getDownload_currentinventory() {
        return Download_currentinventory;
    }


    public void setDownload_currentinventory(String download_currentinventory) {
        Download_currentinventory = download_currentinventory;
    }


    public String getUpload_edited_inventory() {
        return Upload_edited_inventory;
    }


    public void setUpload_edited_inventory(String upload_edited_inventory) {
        Upload_edited_inventory = upload_edited_inventory;
    }
}