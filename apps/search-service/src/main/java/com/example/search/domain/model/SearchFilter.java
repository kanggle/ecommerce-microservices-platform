package com.example.search.domain.model;

public class SearchFilter {

    private final String keyword;
    private final String categoryId;
    private final Long minPrice;
    private final Long maxPrice;
    private final String status;

    private SearchFilter(String keyword, String categoryId, Long minPrice, Long maxPrice, String status) {
        this.keyword = keyword;
        this.categoryId = categoryId;
        this.minPrice = minPrice;
        this.maxPrice = maxPrice;
        this.status = status;
    }

    public static SearchFilter of(String keyword, String categoryId, Long minPrice, Long maxPrice, String status) {
        if (keyword == null || keyword.isBlank()) {
            throw new IllegalArgumentException("keyword must not be blank");
        }
        if (minPrice != null && minPrice < 0) {
            throw new IllegalArgumentException("minPrice must be >= 0");
        }
        if (maxPrice != null && maxPrice < 0) {
            throw new IllegalArgumentException("maxPrice must be >= 0");
        }
        if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
            throw new IllegalArgumentException("minPrice must not exceed maxPrice");
        }
        String resolvedStatus = (status == null || status.isBlank()) ? ProductStatus.ON_SALE.name() : status;
        return new SearchFilter(keyword.trim(), categoryId, minPrice, maxPrice, resolvedStatus);
    }

    public String keyword() {
        return keyword;
    }

    public String categoryId() {
        return categoryId;
    }

    public Long minPrice() {
        return minPrice;
    }

    public Long maxPrice() {
        return maxPrice;
    }

    public String status() {
        return status;
    }
}
