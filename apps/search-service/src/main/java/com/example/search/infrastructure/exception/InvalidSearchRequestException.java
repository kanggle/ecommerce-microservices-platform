package com.example.search.infrastructure.exception;

public class InvalidSearchRequestException extends RuntimeException {

    public InvalidSearchRequestException(String message) {
        super(message);
    }
}
