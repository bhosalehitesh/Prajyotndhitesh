package com.smartbiz.sakhistore.modules.inventory.model;


import java.awt.image.BufferedImage; 
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.util.Base64;

import javax.imageio.ImageIO;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

public class QrUtil {

	 public static String generateBase64QRCode(String text) {
	        try {
	            QRCodeWriter writer = new QRCodeWriter();
	            var bitMatrix = writer.encode(text, BarcodeFormat.QR_CODE, 200, 200);

	            BufferedImage qrImage = new BufferedImage(200, 200, BufferedImage.TYPE_INT_RGB);

	            for (int x = 0; x < 200; x++) {
	                for (int y = 0; y < 200; y++) {
	                    qrImage.setRGB(x, y, bitMatrix.get(x, y) ? 0x000000 : 0xFFFFFF);
	                }
	            }

	            ByteArrayOutputStream baos = new ByteArrayOutputStream();
	            ImageIO.write(qrImage, "png", baos);

	            return Base64.getEncoder().encodeToString(baos.toByteArray());

	        } catch (Exception e) {
	            throw new RuntimeException("QR generation failed", e);
	        }
	    }
}
