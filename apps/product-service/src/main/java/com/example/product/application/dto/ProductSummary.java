package com.example.product.application.dto;

import com.example.product.domain.model.ProductStatus;

import java.util.UUID;

public record ProductSummary(
        UUID id,
        String name,
        ProductStatus status,
        long price,
        UUID categoryId
) {}
