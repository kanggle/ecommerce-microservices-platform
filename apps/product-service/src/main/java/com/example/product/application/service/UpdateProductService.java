package com.example.product.application.service;

import com.example.product.application.command.UpdateProductCommand;
import com.example.product.domain.event.ProductEvent;
import com.example.product.domain.event.ProductEventPublisher;
import com.example.product.domain.event.ProductUpdatedPayload;
import com.example.product.domain.exception.ProductNotFoundException;
import com.example.product.domain.model.Price;
import com.example.product.domain.model.Product;
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
public class UpdateProductService {

    private final ProductRepository productRepository;
    private final ProductEventPublisher productEventPublisher;
    private final ProductMetrics productMetrics;

    @Transactional
    public UUID update(UpdateProductCommand command) {
        Product product = productRepository.findById(command.productId())
                .orElseThrow(() -> new ProductNotFoundException(command.productId()));

        if (command.name() != null) {
            product.updateName(command.name());
        }
        if (command.description() != null) {
            product.updateDescription(command.description());
        }
        if (command.price() != null) {
            product.updatePrice(new Price(command.price()));
        }
        if (command.status() != null) {
            product.changeStatus(command.status());
        }

        productRepository.save(product);
        productMetrics.incrementProductUpdated();

        try {
            productEventPublisher.publish(ProductEvent.updated(buildPayload(product)));
        } catch (Exception e) {
            log.warn("Failed to publish ProductUpdated event for product: {}", product.getId(), e);
        }

        return product.getId();
    }

    private ProductUpdatedPayload buildPayload(Product product) {
        return new ProductUpdatedPayload(
                product.getId().toString(),
                product.getName(),
                product.getDescription(),
                product.getPrice().value(),
                product.getStatus().name(),
                product.getCategoryId() != null ? product.getCategoryId().toString() : null
        );
    }
}
