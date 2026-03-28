package com.example.review.presentation.dto;

import com.example.review.application.result.CreateReviewResult;

public record CreateReviewResponse(String reviewId) {

    public static CreateReviewResponse from(CreateReviewResult result) {
        return new CreateReviewResponse(result.reviewId().toString());
    }
}
