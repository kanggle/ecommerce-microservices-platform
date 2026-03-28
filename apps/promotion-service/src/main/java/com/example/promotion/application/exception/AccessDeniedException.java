package com.example.promotion.application.exception;

public class AccessDeniedException extends RuntimeException {

    public AccessDeniedException() {
        super("Insufficient permissions to access resource");
    }
}
