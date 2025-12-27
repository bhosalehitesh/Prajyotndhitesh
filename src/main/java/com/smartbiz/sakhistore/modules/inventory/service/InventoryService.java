package com.smartbiz.sakhistore.modules.inventory.service;

import com.smartbiz.sakhistore.modules.product.model.Product;
import com.smartbiz.sakhistore.modules.inventory.repository.InventoryRepository;
import com.smartbiz.sakhistore.modules.product.repository.ProductRepository;
import org.apache.poi.ss.usermodel.*;
        import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class InventoryService {

    @Autowired
    public ProductRepository productRepository;

    @Autowired
    InventoryRepository inventoryRepository;

    /**
     * 📤 DOWNLOAD current inventory (creates Excel file)
     */
    public byte[] downloadInventory() throws IOException {
        List<Product> products = productRepository.findAll();
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Inventory");

        // Header row
        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("Product Name");
        header.createCell(1).setCellValue("Size");
        header.createCell(2).setCellValue("Color Code");
        header.createCell(3).setCellValue("Color Name");
        header.createCell(4).setCellValue("SKU");
        header.createCell(5).setCellValue("Inventory Quantity");

        // Data rows
        int rowNum = 1;
        for (Product product : products) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(product.getProductName());
            row.createCell(1).setCellValue(product.getSize() != null ? product.getSize() : "");
            row.createCell(2).setCellValue(product.getHsnCode() != null ? product.getHsnCode() : ""); // using HSN as code
            row.createCell(3).setCellValue(product.getColor() != null ? product.getColor() : "");
            row.createCell(4).setCellValue(product.getCustomSku() != null ? product.getCustomSku() : "");
            row.createCell(5).setCellValue(product.getInventoryQuantity() != null ? product.getInventoryQuantity() : 0);
        }

        // Write to byte array
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        workbook.close();
        return out.toByteArray();
    }

    /**
     * 📥 UPLOAD edited inventory Excel file
     */
    public void uploadInventory(MultipartFile file) throws IOException {
        Workbook workbook = new XSSFWorkbook(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            String productName = getCellValue(row.getCell(0));
            String size = getCellValue(row.getCell(1));
            String colorCode = getCellValue(row.getCell(2));
            String colorName = getCellValue(row.getCell(3));
            String sku = getCellValue(row.getCell(4));
            String inventoryStr = getCellValue(row.getCell(5));

            // Find product by SKU (you can also find by name)
            Product product = productRepository.findByCustomSku(sku);
            if (product != null) {
                product.setProductName(productName);
                product.setSize(size);
                product.setHsnCode(colorCode);
                product.setColor(colorName);
                product.setInventoryQuantity(parseInteger(inventoryStr));
                productRepository.save(product);
            }
        }

        workbook.close();
    }

    private String getCellValue(Cell cell) {
        if (cell == null) return "";
        if (cell.getCellType() == CellType.NUMERIC)
            return String.valueOf((int) cell.getNumericCellValue());
        return cell.getStringCellValue();
    }

    private Integer parseInteger(String val) {
        try {
            return Integer.parseInt(val.trim());
        } catch (Exception e) {
            return 0;
        }
    }
}
