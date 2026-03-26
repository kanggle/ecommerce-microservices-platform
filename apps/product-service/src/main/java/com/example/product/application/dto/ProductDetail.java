package com.example.product.application.dto;

import com.example.product.domain.model.ProductStatus;

import java.util.List;
import java.util.UUID;

public record ProductDetail(
        UUID id,
        String name,
        String description,
        ProductStatus status,
        long price,
        UUID categoryId,
        List<VariantDetail> variants
) {}
