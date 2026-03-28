package com.example.review.interfaces.advice;

import com.example.review.domain.exception.ProductNotPurchasedException;
import com.example.review.domain.exception.ReviewAccessDeniedException;
import com.example.review.domain.exception.ReviewAlreadyExistsException;
import com.example.review.domain.exception.ReviewNotFoundException;
import com.example.review.interfaces.dto.ErrorResponse;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        return ErrorResponse.of("INVALID_REVIEW_REQUEST", message.isEmpty() ? "Validation failed" : message);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleConstraintViolation(ConstraintViolationException ex) {
        return ErrorResponse.of("INVALID_REVIEW_REQUEST", ex.getMessage());
    }

    @ExceptionHandler(MissingRequestHeaderException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ErrorResponse handleMissingHeader(MissingRequestHeaderException ex) {
        return ErrorResponse.of("UNAUTHORIZED", "Missing or invalid access token");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleIllegalArgument(IllegalArgumentException ex) {
        return ErrorResponse.of("INVALID_REVIEW_REQUEST", ex.getMessage());
    }

    @ExceptionHandler(ReviewNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleReviewNotFound(ReviewNotFoundException ex) {
        return ErrorResponse.of("REVIEW_NOT_FOUND", ex.getMessage());
    }

    @ExceptionHandler(ReviewAlreadyExistsException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ErrorResponse handleReviewAlreadyExists(ReviewAlreadyExistsException ex) {
        return ErrorResponse.of("REVIEW_ALREADY_EXISTS", ex.getMessage());
    }

    @ExceptionHandler(ProductNotPurchasedException.class)
    @ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
    public ErrorResponse handleProductNotPurchased(ProductNotPurchasedException ex) {
        return ErrorResponse.of("PRODUCT_NOT_PURCHASED", ex.getMessage());
    }

    @ExceptionHandler(ReviewAccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ErrorResponse handleAccessDenied(ReviewAccessDeniedException ex) {
        return ErrorResponse.of("ACCESS_DENIED", ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorResponse handleUnexpected(Exception ex) {
        log.error("Unexpected error", ex);
        return ErrorResponse.of("INTERNAL_ERROR", "An unexpected error occurred");
    }
}
