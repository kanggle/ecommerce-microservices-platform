package com.example.product.presentation.dto;

public record PresignedUrlResponse(
        String uploadUrl
) {
    public static PresignedUrlResponse from(String url) {
        return new PresignedUrlResponse(url);
    }
}
