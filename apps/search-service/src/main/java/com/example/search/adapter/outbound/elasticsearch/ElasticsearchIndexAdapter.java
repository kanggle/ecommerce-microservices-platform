package com.example.search.adapter.outbound.elasticsearch;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch.core.DeleteRequest;
import co.elastic.clients.elasticsearch.core.GetResponse;
import co.elastic.clients.elasticsearch.core.IndexRequest;
import co.elastic.clients.elasticsearch.core.UpdateRequest;
import com.example.search.domain.model.SearchDocument;
import com.example.search.application.port.out.SearchIndexPort;
import com.example.search.infrastructure.config.IndexProperties;
import com.example.search.infrastructure.exception.SearchException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class ElasticsearchIndexAdapter implements SearchIndexPort {

    private final ElasticsearchClient elasticsearchClient;
    private final IndexProperties indexProperties;

    @Override
    public void upsert(SearchDocument document) {
        try {
            Map<String, Object> doc = Map.of(
                    "productId", document.productId(),
                    "name", document.name() != null ? document.name() : "",
                    "description", document.description() != null ? document.description() : "",
                    "price", document.price(),
                    "status", document.status() != null ? document.status() : "",
                    "categoryId", document.categoryId() != null ? document.categoryId() : "",
                    "totalStock", document.totalStock()
            );
            elasticsearchClient.index(IndexRequest.of(i -> i
                    .index(indexProperties.name())
                    .id(document.productId())
                    .document(doc)
            ));
        } catch (Exception e) {
            log.error("Failed to upsert document for productId={}", document.productId(), e);
            throw new SearchException("Failed to upsert search index for productId=" + document.productId(), e);
        }
    }

    @Override
    public void delete(String productId) {
        try {
            elasticsearchClient.delete(DeleteRequest.of(d -> d
                    .index(indexProperties.name())
                    .id(productId)
            ));
        } catch (Exception e) {
            log.warn("Failed to delete document for productId={} (may not exist)", productId, e);
        }
    }

    @Override
    public void updateStock(String productId, int totalStock, String status) {
        try {
            Map<String, Object> partial = Map.of(
                    "totalStock", totalStock,
                    "status", status
            );
            elasticsearchClient.update(UpdateRequest.of(u -> u
                    .index(indexProperties.name())
                    .id(productId)
                    .docAsUpsert(true)
                    .doc(partial)
            ), Map.class);
        } catch (Exception e) {
            log.error("Failed to update stock for productId={}", productId, e);
            throw new SearchException("Failed to update stock for productId=" + productId, e);
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public Optional<SearchDocument> findById(String productId) {
        try {
            GetResponse<Map> response = elasticsearchClient.get(g -> g
                    .index(indexProperties.name())
                    .id(productId), Map.class);

            if (!response.found() || response.source() == null) {
                return Optional.empty();
            }

            Map<String, Object> source = response.source();
            return Optional.of(ElasticsearchFieldMapper.toSearchDocument(source, null));
        } catch (Exception e) {
            log.warn("Failed to find document for productId={}", productId, e);
            return Optional.empty();
        }
    }
}
