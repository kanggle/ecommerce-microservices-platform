package com.example.order.domain.model;

public record PageQuery(
        int page,
        int size,
        String sortBy,
        String sortDirection
) {}
