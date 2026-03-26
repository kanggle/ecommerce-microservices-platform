package com.example.product.application.service;

import com.example.product.application.dto.ProductDetail;
import com.example.product.application.dto.ProductListResult;
import com.example.product.application.dto.VariantDetail;
import com.example.product.application.port.ProductQueryPort;
import com.example.product.domain.exception.ProductNotFoundException;
import com.example.product.domain.model.Product;
import com.example.product.domain.model.ProductStatus;
import com.example.product.domain.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QueryProductService {

    private final ProductRepository productRepository;
    private final ProductQueryPort productQueryPort;

    @Transactional(readOnly = true)
    public ProductListResult findAll(UUID categoryId, ProductStatus status, int page, int size) {
        return productQueryPort.findSummaries(categoryId, status, page, size);
    }

    @Transactional(readOnly = true)
    public ProductDetail findById(UUID productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));
        return toDetail(product);
    }

    private ProductDetail toDetail(Product product) {
        List<VariantDetail> variants = product.getVariants().stream()
                .map(v -> new VariantDetail(
                        v.getId(),
                        v.getOptionName(),
                        v.getStock().value(),
                        v.getAdditionalPrice().value()))
                .toList();

        return new ProductDetail(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getStatus(),
                product.getPrice().value(),
                product.getCategoryId(),
                variants);
    }
}
