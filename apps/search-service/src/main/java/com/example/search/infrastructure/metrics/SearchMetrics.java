package com.example.search.infrastructure.metrics;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.stereotype.Component;

@Component
public class SearchMetrics {

    private final Counter searchQueryTotal;
    private final Timer searchQueryDuration;
    private final Counter searchZeroResultsTotal;
    private final Counter indexSyncCreated;
    private final Counter indexSyncUpdated;
    private final Counter indexSyncDeleted;
    private final Counter indexSyncFailureTotal;

    public SearchMetrics(MeterRegistry registry) {
        this.searchQueryTotal = Counter.builder("search_query_total")
                .description("Total search queries executed")
                .register(registry);

        this.searchQueryDuration = Timer.builder("search_query_duration_seconds")
                .description("Search query latency")
                .register(registry);

        this.searchZeroResultsTotal = Counter.builder("search_zero_results_total")
                .description("Total queries returning zero results")
                .register(registry);

        this.indexSyncCreated = Counter.builder("search_index_sync_total")
                .description("Total index sync operations by event type")
                .tag("event_type", "created")
                .register(registry);

        this.indexSyncUpdated = Counter.builder("search_index_sync_total")
                .description("Total index sync operations by event type")
                .tag("event_type", "updated")
                .register(registry);

        this.indexSyncDeleted = Counter.builder("search_index_sync_total")
                .description("Total index sync operations by event type")
                .tag("event_type", "deleted")
                .register(registry);

        this.indexSyncFailureTotal = Counter.builder("search_index_sync_failure_total")
                .description("Total index sync failures")
                .register(registry);
    }

    public void incrementSearchQuery() {
        searchQueryTotal.increment();
    }

    public Timer getSearchQueryDuration() {
        return searchQueryDuration;
    }

    public void incrementZeroResults() {
        searchZeroResultsTotal.increment();
    }

    public void incrementIndexSync(String eventType) {
        switch (eventType) {
            case "created" -> indexSyncCreated.increment();
            case "deleted" -> indexSyncDeleted.increment();
            default -> indexSyncUpdated.increment();
        }
    }

    public void incrementIndexSyncFailure() {
        indexSyncFailureTotal.increment();
    }
}
