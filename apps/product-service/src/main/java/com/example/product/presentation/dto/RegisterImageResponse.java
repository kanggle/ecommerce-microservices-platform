package com.example.product.presentation.dto;

import com.example.product.domain.model.ProductImage;

public record RegisterImageResponse(
        String imageId,
        String objectKey,
        int sortOrder,
        boolean isPrimary,
        String url
) {
    public static RegisterImageResponse from(ProductImage image, String resolvedUrl) {
        return new RegisterImageResponse(
                image.getId().toString(),
                image.getObjectKey(),
                image.getSortOrder(),
                image.isPrimary(),
                resolvedUrl
        );
    }
}
