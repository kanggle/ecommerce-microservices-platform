package com.example.product.application.service;

import com.example.product.domain.event.ProductDeletedPayload;
import com.example.product.domain.event.ProductEvent;
import com.example.product.domain.event.ProductEventPublisher;
import com.example.product.domain.exception.ProductNotFoundException;
import com.example.product.domain.repository.ProductRepository;
import com.example.product.infrastructure.metrics.ProductMetrics;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeleteProductService {

    private final ProductRepository productRepository;
    private final ProductEventPublisher productEventPublisher;
    private final ProductMetrics productMetrics;

    @Transactional
    public void delete(UUID productId) {
        productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));

        productRepository.softDelete(productId);
        productMetrics.incrementProductDeleted();

        try {
            productEventPublisher.publish(ProductEvent.deleted(new ProductDeletedPayload(productId.toString())));
        } catch (Exception e) {
            log.warn("Failed to publish ProductDeleted event for product: {}", productId, e);
        }
    }
}
