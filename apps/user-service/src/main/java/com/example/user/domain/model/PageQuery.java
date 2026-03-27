package com.example.user.domain.model;

public record PageQuery(
        int page,
        int size,
        String sortField,
        String sortDirection
) {
}
