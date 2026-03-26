package com.example.product.application.port;

import com.example.product.application.dto.ProductSummary;
import com.example.product.domain.model.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ProductQueryPort {

    Page<ProductSummary> findSummaries(UUID categoryId, ProductStatus status, Pageable pageable);
}
