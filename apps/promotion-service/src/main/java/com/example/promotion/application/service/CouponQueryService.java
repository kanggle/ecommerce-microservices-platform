package com.example.promotion.application.service;

import com.example.promotion.application.result.CouponDetail;
import com.example.promotion.domain.coupon.Coupon;
import com.example.promotion.domain.coupon.CouponRepository;
import com.example.promotion.domain.coupon.CouponStatus;
import com.example.promotion.domain.promotion.PageResult;
import com.example.promotion.domain.promotion.Promotion;
import com.example.promotion.domain.promotion.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CouponQueryService {

    private final CouponRepository couponRepository;
    private final PromotionRepository promotionRepository;

    public PageResult<CouponDetail> getMyCoupons(String userId, int page, int size, CouponStatus status) {
        PageResult<Coupon> result;
        if (status != null) {
            result = couponRepository.findByUserIdAndStatus(userId, status, page, size);
        } else {
            result = couponRepository.findByUserId(userId, page, size);
        }

        return new PageResult<>(
                result.content().stream()
                        .map(this::toCouponDetail)
                        .toList(),
                result.page(),
                result.size(),
                result.totalElements()
        );
    }

    private CouponDetail toCouponDetail(Coupon coupon) {
        Promotion promotion = promotionRepository.findById(coupon.getPromotionId())
                .orElse(null);

        String promotionName = promotion != null ? promotion.getName() : "Unknown";
        var discountType = promotion != null ? promotion.getDiscountType() : null;
        long discountValue = promotion != null ? promotion.getDiscountValue() : 0;
        long maxDiscountAmount = promotion != null ? promotion.getMaxDiscountAmount() : 0;

        return CouponDetail.from(coupon, promotionName, discountType, discountValue, maxDiscountAmount);
    }
}
