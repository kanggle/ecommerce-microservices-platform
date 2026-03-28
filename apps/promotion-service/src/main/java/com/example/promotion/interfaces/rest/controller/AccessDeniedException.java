package com.example.promotion.interfaces.rest.controller;

public class AccessDeniedException extends RuntimeException {

    public AccessDeniedException() {
        super("Insufficient permissions to access resource");
    }
}
