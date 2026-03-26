package com.example.product.application.service;

import com.example.product.application.command.RegisterProductCommand;
import com.example.product.domain.event.ProductCreatedPayload;
import com.example.product.domain.event.ProductEvent;
import com.example.product.domain.event.ProductEventPublisher;
import com.example.product.domain.model.Price;
import com.example.product.domain.model.Product;
import com.example.product.domain.model.ProductVariant;
import com.example.product.domain.model.StockQuantity;
import com.example.product.domain.exception.InvalidCategoryException;
import com.example.product.domain.repository.CategoryRepository;
import com.example.product.domain.repository.ProductRepository;
import com.example.product.infrastructure.metrics.ProductMetrics;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RegisterProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductEventPublisher productEventPublisher;
    private final ProductMetrics productMetrics;

    @Transactional
    public UUID register(RegisterProductCommand command) {
        if (command.categoryId() != null) {
            categoryRepository.findById(command.categoryId())
                    .orElseThrow(() -> new InvalidCategoryException(command.categoryId()));
        }

        List<ProductVariant> variants = command.variants().stream()
                .map(v -> ProductVariant.create(
                        v.optionName(),
                        new StockQuantity(v.stock()),
                        new Price(v.additionalPrice())))
                .toList();

        Product product = Product.create(
                command.name(),
                command.description(),
                new Price(command.price()),
                command.categoryId(),
                variants);

        productRepository.save(product);
        productMetrics.incrementProductCreated();

        try {
            ProductCreatedPayload payload = buildPayload(product);
            productEventPublisher.publish(ProductEvent.created(payload));
        } catch (Exception e) {
            log.warn("Failed to publish ProductCreated event for product: {}",
                    product.getId(), e);
        }

        return product.getId();
    }

    private ProductCreatedPayload buildPayload(Product product) {
        List<ProductCreatedPayload.VariantPayload> variantPayloads = product.getVariants().stream()
                .map(v -> new ProductCreatedPayload.VariantPayload(
                        v.getId().toString(),
                        v.getOptionName(),
                        v.getStock().value(),
                        v.getAdditionalPrice().value()))
                .toList();

        return new ProductCreatedPayload(
                product.getId().toString(),
                product.getName(),
                product.getDescription(),
                product.getPrice().value(),
                product.getStatus().name(),
                product.getCategoryId() != null ? product.getCategoryId().toString() : null,
                variantPayloads);
    }
}
