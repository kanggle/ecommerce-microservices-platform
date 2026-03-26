package com.example.product.application.service;

import com.example.product.application.command.RegisterProductCommand;
import com.example.product.application.command.VariantCommand;
import com.example.product.domain.event.ProductEvent;
import com.example.product.domain.event.ProductEventPublisher;
import com.example.product.domain.exception.InvalidCategoryException;
import com.example.product.domain.model.Category;
import com.example.product.domain.model.Product;
import com.example.product.domain.repository.CategoryRepository;
import com.example.product.domain.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@DisplayName("RegisterProductService 단위 테스트")
class RegisterProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ProductEventPublisher productEventPublisher;

    @InjectMocks
    private RegisterProductService registerProductService;

    private RegisterProductCommand validCommand;

    @BeforeEach
    void setUp() {
        validCommand = new RegisterProductCommand(
                "테스트 상품",
                "상품 설명",
                10000L,
                null,
                List.of(new VariantCommand("기본", 10, 0)));
    }

    @Test
    @DisplayName("상품 등록 성공 시 상품 ID를 반환한다")
    void register_success_returnsId() {
        given(productRepository.save(any(Product.class))).willAnswer(inv -> inv.getArgument(0));

        UUID id = registerProductService.register(validCommand);

        assertThat(id).isNotNull();
        verify(productRepository).save(any(Product.class));
    }

    @Test
    @DisplayName("등록 성공 시 ProductCreated 이벤트가 발행된다")
    void register_success_publishesEvent() {
        given(productRepository.save(any(Product.class))).willAnswer(inv -> inv.getArgument(0));

        registerProductService.register(validCommand);

        ArgumentCaptor<ProductEvent> captor = ArgumentCaptor.forClass(ProductEvent.class);
        verify(productEventPublisher).publish(captor.capture());

        ProductEvent event = captor.getValue();
        assertThat(event.eventType()).isEqualTo("ProductCreated");
        assertThat(event.source()).isEqualTo("product-service");
        assertThat(event.eventId()).isNotNull();
    }

    @Test
    @DisplayName("variants가 없으면 IllegalArgumentException이 발생한다")
    void register_noVariants_throwsException() {
        RegisterProductCommand commandWithNoVariants = new RegisterProductCommand(
                "상품명", "설명", 10000L, null, List.of());

        assertThatThrownBy(() -> registerProductService.register(commandWithNoVariants))
                .isInstanceOf(IllegalArgumentException.class);

        verify(productRepository, never()).save(any());
        verify(productEventPublisher, never()).publish(any());
    }

    @Test
    @DisplayName("이벤트 발행 실패해도 상품은 등록된다")
    void register_eventPublishFails_productStillSaved() {
        given(productRepository.save(any(Product.class))).willAnswer(inv -> inv.getArgument(0));
        doThrow(new RuntimeException("Event publish failed")).when(productEventPublisher).publish(any());

        UUID id = registerProductService.register(validCommand);

        assertThat(id).isNotNull();
        verify(productRepository).save(any(Product.class));
    }

    @Test
    @DisplayName("존재하지 않는 categoryId로 등록 시 IllegalArgumentException 발생")
    void register_invalidCategoryId_throwsException() {
        UUID fakeCategoryId = UUID.randomUUID();
        RegisterProductCommand commandWithCategory = new RegisterProductCommand(
                "상품명", "설명", 10000L, fakeCategoryId,
                List.of(new VariantCommand("기본", 10, 0)));

        given(categoryRepository.findById(fakeCategoryId)).willReturn(Optional.empty());

        assertThatThrownBy(() -> registerProductService.register(commandWithCategory))
                .isInstanceOf(InvalidCategoryException.class)
                .hasMessageContaining("Category not found");

        verify(productRepository, never()).save(any());
    }

    @Test
    @DisplayName("유효한 categoryId로 등록 성공")
    void register_validCategoryId_success() {
        UUID categoryId = UUID.randomUUID();
        Category category = Category.create("전자제품", null);
        RegisterProductCommand commandWithCategory = new RegisterProductCommand(
                "상품명", "설명", 10000L, categoryId,
                List.of(new VariantCommand("기본", 10, 0)));

        given(categoryRepository.findById(categoryId)).willReturn(Optional.of(category));
        given(productRepository.save(any(Product.class))).willAnswer(inv -> inv.getArgument(0));

        UUID id = registerProductService.register(commandWithCategory);

        assertThat(id).isNotNull();
    }

    @Test
    @DisplayName("price가 음수면 도메인에서 예외 발생")
    void register_negativePrice_throwsException() {
        RegisterProductCommand commandWithNegativePrice = new RegisterProductCommand(
                "상품명", "설명", -1000L, null,
                List.of(new VariantCommand("기본", 10, 0)));

        assertThatThrownBy(() -> registerProductService.register(commandWithNegativePrice))
                .isInstanceOf(IllegalArgumentException.class);

        verify(productRepository, never()).save(any());
    }
}
