package com.smartbiz.sakhistore.modules.inventory.model;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;

public class PdfGenerator {
	 public static byte[] generatePdfBytes(String html) {
	        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
	            PdfRendererBuilder builder = new PdfRendererBuilder();
	            builder.useFastMode();
	            builder.withHtmlContent(html, null);
	            builder.toStream(baos);
	            builder.run();
	            return baos.toByteArray();
	        } catch (Exception e) {
	            throw new RuntimeException("PDF generation failed", e);
	        }
	    }

	    public static void savePdfToFile(byte[] pdfBytes, String path) {
	        try (FileOutputStream fos = new FileOutputStream(new File(path))) {
	            fos.write(pdfBytes);
	        } catch (Exception e) {
	            throw new RuntimeException("Saving PDF failed", e);
	        }
	    }
}

