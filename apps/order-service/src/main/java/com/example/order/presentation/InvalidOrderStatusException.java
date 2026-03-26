package com.example.order.presentation;

public class InvalidOrderStatusException extends RuntimeException {

    public InvalidOrderStatusException(String status) {
        super("Invalid order status: " + status);
    }
}
