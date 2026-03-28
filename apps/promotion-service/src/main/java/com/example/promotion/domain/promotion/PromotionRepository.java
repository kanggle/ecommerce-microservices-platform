package com.example.promotion.domain.promotion;

import java.util.Optional;

public interface PromotionRepository {

    Promotion save(Promotion promotion);

    Optional<Promotion> findById(String promotionId);

    Optional<Promotion> findByIdForUpdate(String promotionId);

    void deleteById(String promotionId);

    PageResult<Promotion> findAll(int page, int size);

    PageResult<Promotion> findAllByStatus(PromotionStatus status, int page, int size, java.time.Clock clock);
}
