package com.smartbiz.sakhistore.common.exceptions;

public class SakhiException extends RuntimeException {
    
    public SakhiException(String message) {
        super(message);
    }
    
    public SakhiException(String message, Throwable cause) {
        super(message, cause);
    }
}
