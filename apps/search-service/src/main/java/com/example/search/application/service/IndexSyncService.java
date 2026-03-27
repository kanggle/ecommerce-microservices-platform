package com.example.search.application.service;

import com.example.search.domain.model.ProductStatus;
import com.example.search.domain.model.SearchDocument;
import com.example.search.application.port.out.SearchIndexPort;
import com.example.search.infrastructure.metrics.SearchMetrics;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class IndexSyncService {

    private final SearchIndexPort searchIndexPort;
    private final SearchMetrics searchMetrics;

    public void upsert(SearchDocument document) {
        log.info("Upserting search index for productId={}", document.productId());
        try {
            searchIndexPort.upsert(document);
            searchMetrics.incrementIndexSync("created");
        } catch (Exception e) {
            searchMetrics.incrementIndexSyncFailure();
            throw e;
        }
    }

    public void delete(String productId) {
        log.info("Deleting search index for productId={}", productId);
        try {
            searchIndexPort.delete(productId);
            searchMetrics.incrementIndexSync("deleted");
        } catch (Exception e) {
            searchMetrics.incrementIndexSyncFailure();
            throw e;
        }
    }

    public void upsertPreservingStock(SearchDocument document) {
        log.info("Upserting search index (preserving stock) for productId={}", document.productId());
        try {
            int existingStock = 0;
            try {
                Optional<SearchDocument> existing = searchIndexPort.findById(document.productId());
                existingStock = existing.map(SearchDocument::totalStock).orElse(0);
            } catch (Exception e) {
                log.warn("Failed to retrieve existing stock for productId={}, falling back to 0", document.productId(), e);
            }

            SearchDocument withStock = SearchDocument.of(
                    document.productId(),
                    document.name(),
                    document.description(),
                    document.price(),
                    document.status(),
                    document.categoryId(),
                    existingStock
            );
            searchIndexPort.upsert(withStock);
            searchMetrics.incrementIndexSync("updated");
        } catch (Exception e) {
            searchMetrics.incrementIndexSyncFailure();
            throw e;
        }
    }

    public void updateStock(String productId, int currentStock) {
        String status = currentStock == 0 ? ProductStatus.SOLD_OUT.name() : ProductStatus.ON_SALE.name();
        log.info("Updating stock for productId={}, currentStock={}, status={}", productId, currentStock, status);
        try {
            searchIndexPort.updateStock(productId, currentStock, status);
            searchMetrics.incrementIndexSync("updated");
        } catch (Exception e) {
            searchMetrics.incrementIndexSyncFailure();
            throw e;
        }
    }
}
