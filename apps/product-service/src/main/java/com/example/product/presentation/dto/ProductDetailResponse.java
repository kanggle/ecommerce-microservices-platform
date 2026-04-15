package com.example.product.presentation.dto;

import com.example.product.application.dto.ProductDetail;
import com.example.product.presentation.support.UuidUtils;

import java.util.List;

public record ProductDetailResponse(
        String id,
        String name,
        String description,
        String status,
        long price,
        String categoryId,
        String thumbnailUrl,
        List<VariantDetailItem> variants
) {
    public record VariantDetailItem(
            String id,
            String optionName,
            int stock,
            long additionalPrice
    ) {}

    public static ProductDetailResponse from(ProductDetail detail) {
        List<VariantDetailItem> variants = detail.variants().stream()
                .map(v -> new VariantDetailItem(
                        v.id().toString(),
                        v.optionName(),
                        v.stock(),
                        v.additionalPrice()))
                .toList();

        return new ProductDetailResponse(
                detail.id().toString(),
                detail.name(),
                detail.description(),
                detail.status().name(),
                detail.price(),
                UuidUtils.toString(detail.categoryId()),
                detail.thumbnailUrl(),
                variants);
    }
}
