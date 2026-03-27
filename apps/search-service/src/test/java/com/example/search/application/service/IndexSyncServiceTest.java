package com.example.search.application.service;

import com.example.search.domain.model.ProductStatus;
import com.example.search.domain.model.SearchDocument;
import com.example.search.application.port.out.SearchIndexPort;
import com.example.search.infrastructure.metrics.SearchMetrics;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@DisplayName("IndexSyncService 단위 테스트")
class IndexSyncServiceTest {

    @InjectMocks
    private IndexSyncService indexSyncService;

    @Mock
    private SearchIndexPort searchIndexPort;

    @Mock
    private SearchMetrics searchMetrics;

    @Test
    @DisplayName("upsert 호출 시 SearchIndexPort.upsert가 호출된다")
    void upsert_validDocument_callsPort() {
        SearchDocument document = SearchDocument.of("p1", "노트북", "설명", 100000L, "ON_SALE", "cat1", 10);

        indexSyncService.upsert(document);

        verify(searchIndexPort).upsert(document);
    }

    @Test
    @DisplayName("delete 호출 시 SearchIndexPort.delete가 호출된다")
    void delete_validProductId_callsPort() {
        indexSyncService.delete("p1");

        verify(searchIndexPort).delete("p1");
    }

    @Test
    @DisplayName("재고 > 0이면 ON_SALE 상태로 updateStock이 호출된다")
    void updateStock_positiveStock_callsPortWithOnSale() {
        ArgumentCaptor<String> statusCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Integer> stockCaptor = ArgumentCaptor.forClass(Integer.class);

        indexSyncService.updateStock("p1", 10);

        verify(searchIndexPort).updateStock(
                org.mockito.ArgumentMatchers.eq("p1"),
                stockCaptor.capture(),
                statusCaptor.capture()
        );
        assertThat(statusCaptor.getValue()).isEqualTo(ProductStatus.ON_SALE.name());
        assertThat(stockCaptor.getValue()).isEqualTo(10);
    }

    @Test
    @DisplayName("재고 == 0이면 SOLD_OUT 상태로 updateStock이 호출된다")
    void updateStock_zeroStock_callsPortWithSoldOut() {
        ArgumentCaptor<String> statusCaptor = ArgumentCaptor.forClass(String.class);

        indexSyncService.updateStock("p1", 0);

        verify(searchIndexPort).updateStock(
                org.mockito.ArgumentMatchers.eq("p1"),
                org.mockito.ArgumentMatchers.eq(0),
                statusCaptor.capture()
        );
        assertThat(statusCaptor.getValue()).isEqualTo(ProductStatus.SOLD_OUT.name());
    }

    @Test
    @DisplayName("upsertPreservingStock 호출 시 기존 인덱스의 재고가 유지된다")
    void upsertPreservingStock_existingDocument_preservesStock() {
        SearchDocument existing = SearchDocument.of("p1", "노트북", "설명", 100000L, "ON_SALE", "cat1", 50);
        given(searchIndexPort.findById("p1")).willReturn(Optional.of(existing));

        SearchDocument updated = SearchDocument.of("p1", "노트북 프로", "새 설명", 120000L, "ON_SALE", "cat1", 0);
        indexSyncService.upsertPreservingStock(updated);

        ArgumentCaptor<SearchDocument> captor = ArgumentCaptor.forClass(SearchDocument.class);
        verify(searchIndexPort).upsert(captor.capture());
        assertThat(captor.getValue().totalStock()).isEqualTo(50);
        assertThat(captor.getValue().name()).isEqualTo("노트북 프로");
    }

    @Test
    @DisplayName("upsertPreservingStock 시 기존 문서가 없으면 totalStock=0으로 처리된다")
    void upsertPreservingStock_noExistingDocument_fallsBackToZero() {
        given(searchIndexPort.findById("p2")).willReturn(Optional.empty());

        SearchDocument updated = SearchDocument.of("p2", "마우스", "설명", 50000L, "ON_SALE", "cat2", 0);
        indexSyncService.upsertPreservingStock(updated);

        ArgumentCaptor<SearchDocument> captor = ArgumentCaptor.forClass(SearchDocument.class);
        verify(searchIndexPort).upsert(captor.capture());
        assertThat(captor.getValue().totalStock()).isEqualTo(0);
    }

    @Test
    @DisplayName("upsertPreservingStock 시 인덱스 조회 실패하면 totalStock=0으로 fallback된다")
    void upsertPreservingStock_findByIdThrows_fallsBackToZero() {
        given(searchIndexPort.findById("p3")).willThrow(new RuntimeException("ES connection error"));

        SearchDocument updated = SearchDocument.of("p3", "키보드", "설명", 80000L, "ON_SALE", "cat2", 0);
        indexSyncService.upsertPreservingStock(updated);

        ArgumentCaptor<SearchDocument> captor = ArgumentCaptor.forClass(SearchDocument.class);
        verify(searchIndexPort).upsert(captor.capture());
        assertThat(captor.getValue().totalStock()).isEqualTo(0);
    }
}
