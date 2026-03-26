package com.example.order.application.service;

public class UnauthorizedOrderAccessException extends RuntimeException {

    public UnauthorizedOrderAccessException() {
        super("Unauthorized access to the order");
    }
}
