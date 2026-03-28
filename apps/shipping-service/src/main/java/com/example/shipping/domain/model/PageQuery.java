package com.example.shipping.domain.model;

public record PageQuery(
        int page,
        int size,
        String sortBy,
        String sortDirection
) {}
