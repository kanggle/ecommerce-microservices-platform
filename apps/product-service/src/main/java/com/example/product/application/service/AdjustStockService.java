package com.example.product.application.service;

import com.example.product.application.command.AdjustStockCommand;
import com.example.product.application.dto.AdjustStockResult;
import com.example.product.domain.event.ProductEvent;
import com.example.product.domain.event.ProductEventPublisher;
import com.example.product.domain.event.StockChangedPayload;
import com.example.product.domain.exception.ProductNotFoundException;
import com.example.product.domain.exception.VariantNotFoundException;
import com.example.product.domain.model.Inventory;
import com.example.product.domain.model.Product;
import com.example.product.domain.repository.InventoryRepository;
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
public class AdjustStockService {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final ProductEventPublisher productEventPublisher;
    private final ProductMetrics productMetrics;

    @Transactional
    public AdjustStockResult adjust(AdjustStockCommand command) {
        if (command.quantity() == 0) {
            throw new IllegalArgumentException("Stock adjustment quantity must not be zero");
        }

        Product product = productRepository.findById(command.productId())
                .orElseThrow(() -> new ProductNotFoundException(command.productId()));

        UUID variantId = command.variantId();
        boolean variantBelongsToProduct = product.getVariants().stream()
                .anyMatch(v -> v.getId().equals(variantId));
        if (!variantBelongsToProduct) {
            throw new VariantNotFoundException(variantId);
        }

        Inventory inventory = inventoryRepository.findByVariantId(variantId)
                .orElseThrow(() -> new VariantNotFoundException(variantId));

        int previousStock = inventory.currentStock().value();
        inventory.adjustStock(command.quantity());
        int currentStock = inventory.currentStock().value();

        inventoryRepository.save(inventory);

        String adjustType = command.quantity() > 0 ? "increase" : "decrease";
        if (command.reason() != null && command.reason().contains("reserve")) {
            adjustType = "reserve";
        }
        productMetrics.incrementStockAdjusted(adjustType);

        boolean statusChanged = product.adjustStatusByStock(currentStock);
        if (statusChanged) {
            if (currentStock == 0) {
                productMetrics.incrementOutOfStock();
            }
            productRepository.save(product);
        }

        try {
            productEventPublisher.publish(ProductEvent.stockChanged(new StockChangedPayload(
                    command.productId().toString(),
                    variantId.toString(),
                    previousStock,
                    currentStock,
                    command.quantity(),
                    command.reason(),
                    null // orderId: 수동 재고 조정에는 해당 없음
            )));
        } catch (Exception e) {
            log.warn("Failed to publish StockChanged event for variant: {}", variantId, e);
        }

        return new AdjustStockResult(variantId, currentStock);
    }
}
