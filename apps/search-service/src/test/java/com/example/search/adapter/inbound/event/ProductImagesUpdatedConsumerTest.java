package com.example.search.adapter.inbound.event;

import com.example.search.application.service.IndexSyncService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProductImagesUpdatedConsumer 단위 테스트")
class ProductImagesUpdatedConsumerTest {

    @InjectMocks
    private ProductImagesUpdatedConsumer consumer;

    @Mock
    private IndexSyncService indexSyncService;

    @Mock
    private ObjectMapper objectMapper;

    private ProductImagesUpdatedEvent event(String productId, String thumbnailUrl) {
        return new ProductImagesUpdatedEvent(
                "event-id", "ProductImagesUpdated", "2026-04-16T00:00:00Z", "product-service",
                new ProductImagesUpdatedEvent.ProductImagesUpdatedPayload(productId, thumbnailUrl)
        );
    }

    @Test
    @DisplayName("정상 이벤트 수신 시 updateThumbnailUrl이 호출된다")
    void handle_validEvent_callsUpdateThumbnailUrl() {
        ProductImagesUpdatedEvent e = event("p1", "http://cdn.example.com/img.jpg");

        consumer.handle(e);

        verify(indexSyncService).updateThumbnailUrl("p1", "http://cdn.example.com/img.jpg");
    }

    @Test
    @DisplayName("thumbnailUrl이 null인 이벤트도 정상 처리된다")
    void handle_nullThumbnailUrl_callsUpdateThumbnailUrl() {
        ProductImagesUpdatedEvent e = event("p1", null);

        consumer.handle(e);

        verify(indexSyncService).updateThumbnailUrl("p1", null);
    }

    @Test
    @DisplayName("productId가 null인 이벤트는 무시된다")
    void handle_nullProductId_skips() {
        ProductImagesUpdatedEvent e = event(null, "http://cdn.example.com/img.jpg");

        consumer.handle(e);

        verify(indexSyncService, never()).updateThumbnailUrl(any(), any());
    }

    @Test
    @DisplayName("payload가 null인 이벤트는 무시된다")
    void handle_nullPayload_skips() {
        ProductImagesUpdatedEvent e = new ProductImagesUpdatedEvent(
                "event-id", "ProductImagesUpdated", "2026-04-16T00:00:00Z", "product-service", null);

        consumer.handle(e);

        verify(indexSyncService, never()).updateThumbnailUrl(any(), any());
    }

    @Test
    @DisplayName("역직렬화 실패 시 JsonProcessingException이 전파된다")
    void onMessage_invalidJson_throwsJsonProcessingException() throws JsonProcessingException {
        given(objectMapper.readValue("invalid", ProductImagesUpdatedEvent.class))
                .willThrow(new JsonProcessingException("parse error") {});

        assertThatThrownBy(() -> consumer.onMessage("invalid"))
                .isInstanceOf(JsonProcessingException.class);
    }

    @Test
    @DisplayName("updateThumbnailUrl 실패 시 예외가 전파된다")
    void handle_updateThrows_propagatesException() {
        ProductImagesUpdatedEvent e = event("p1", "http://cdn.example.com/img.jpg");
        doThrow(new RuntimeException("ES error")).when(indexSyncService).updateThumbnailUrl(any(), any());

        assertThatThrownBy(() -> consumer.handle(e))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("ES error");
    }
}
