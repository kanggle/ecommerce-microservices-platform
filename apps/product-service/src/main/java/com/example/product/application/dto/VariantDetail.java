package com.example.product.application.dto;

import java.util.UUID;

public record VariantDetail(
        UUID id,
        String optionName,
        int stock,
        long additionalPrice
) {}
