package com.example.product.application.service;

import com.example.product.application.command.AdjustStockCommand;
import com.example.product.application.dto.AdjustStockResult;
import com.example.product.domain.event.ProductEvent;
import com.example.product.domain.event.StockChangedPayload;
import com.example.product.domain.exception.ProductNotFoundException;
import com.example.product.domain.exception.VariantNotFoundException;
import com.example.product.domain.model.Inventory;
import com.example.product.domain.model.Product;
import com.example.product.domain.repository.InventoryRepository;
import com.example.product.domain.repository.ProductRepository;
import com.example.product.infrastructure.metrics.ProductMetrics;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdjustStockService {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final EventPublishingHelper eventPublishingHelper;
    private final ProductMetrics productMetrics;

    @Transactional
    public AdjustStockResult adjust(AdjustStockCommand command) {
        validateQuantity(command);
        Product product = findProductAndValidateVariant(command.productId(), command.variantId());
        int[] stocks = adjustInventoryStock(command.variantId(), command.quantity());
        int previousStock = stocks[0];
        int currentStock = stocks[1];
        recordStockMetrics(command, currentStock, product);
        publishStockChangedEvent(command, command.variantId(), previousStock, currentStock);
        return new AdjustStockResult(command.variantId(), currentStock);
    }

    private void validateQuantity(AdjustStockCommand command) {
        if (command.quantity() == 0) {
            throw new IllegalArgumentException("Stock adjustment quantity must not be zero");
        }
    }

    private Product findProductAndValidateVariant(UUID productId, UUID variantId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));
        boolean variantBelongsToProduct = product.getVariants().stream()
                .anyMatch(v -> v.getId().equals(variantId));
        if (!variantBelongsToProduct) {
            throw new VariantNotFoundException(variantId);
        }
        return product;
    }

    private int[] adjustInventoryStock(UUID variantId, int quantity) {
        Inventory inventory = inventoryRepository.findByVariantId(variantId)
                .orElseThrow(() -> new VariantNotFoundException(variantId));
        int previousStock = inventory.currentStock().value();
        inventory.adjustStock(quantity);
        int currentStock = inventory.currentStock().value();
        inventoryRepository.save(inventory);
        return new int[]{previousStock, currentStock};
    }

    private void recordStockMetrics(AdjustStockCommand command, int currentStock, Product product) {
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
    }

    private void publishStockChangedEvent(AdjustStockCommand command, UUID variantId,
                                          int previousStock, int currentStock) {
        eventPublishingHelper.publishSafely(
                ProductEvent.stockChanged(new StockChangedPayload(
                        command.productId().toString(),
                        variantId.toString(),
                        previousStock,
                        currentStock,
                        command.quantity(),
                        command.reason(),
                        null // orderId: 수동 재고 조정에는 해당 없음
                )),
                "variant", variantId);
    }
}
