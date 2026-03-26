package com.example.user.presentation.exception;

public class AccessDeniedException extends RuntimeException {

    public AccessDeniedException() {
        super("Access denied: admin role is required");
    }
}
