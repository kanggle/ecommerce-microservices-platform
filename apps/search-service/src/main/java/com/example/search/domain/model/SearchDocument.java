package com.example.search.domain.model;

public record SearchDocument(
        String productId,
        String name,
        String description,
        long price,
        String status,
        String categoryId,
        int totalStock,
        Double score
) {
    public static SearchDocument of(
            String productId,
            String name,
            String description,
            long price,
            String status,
            String categoryId,
            int totalStock
    ) {
        return new SearchDocument(productId, name, description, price, status, categoryId, totalStock, null);
    }
}
