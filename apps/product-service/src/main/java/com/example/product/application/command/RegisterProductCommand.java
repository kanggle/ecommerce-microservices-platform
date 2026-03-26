package com.example.product.application.command;

import java.util.List;
import java.util.UUID;

public record RegisterProductCommand(
        String name,
        String description,
        long price,
        UUID categoryId,
        List<VariantCommand> variants
) {}
