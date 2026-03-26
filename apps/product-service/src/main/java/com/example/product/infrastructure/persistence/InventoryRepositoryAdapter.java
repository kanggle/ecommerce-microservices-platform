package com.example.product.infrastructure.persistence;

import com.example.product.domain.exception.VariantNotFoundException;
import com.example.product.domain.model.Inventory;
import com.example.product.domain.model.StockQuantity;
import com.example.product.domain.repository.InventoryRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Repository
class InventoryRepositoryAdapter implements InventoryRepository {

    private final ProductVariantJpaRepository jpaRepository;

    InventoryRepositoryAdapter(ProductVariantJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    @Transactional
    public Inventory save(Inventory inventory) {
        jpaRepository.findById(inventory.getVariantId())
                .ifPresentOrElse(
                        entity -> {
                            entity.updateStock(inventory.currentStock().value());
                            jpaRepository.save(entity);
                        },
                        () -> { throw new VariantNotFoundException(inventory.getVariantId()); }
                );
        return inventory;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Inventory> findByVariantId(UUID variantId) {
        return jpaRepository.findById(variantId)
                .map(entity -> Inventory.create(entity.getId(), new StockQuantity(entity.getStock())));
    }
}
