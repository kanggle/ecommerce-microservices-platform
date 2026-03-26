package com.example.user.presentation.dto.response;

import com.example.user.application.result.UserProfileSummaryResult;
import org.springframework.data.domain.Page;

import java.util.List;

public record AdminUserListResponse(
        List<UserProfileSummaryResponse> content,
        int page,
        int size,
        long totalElements
) {
    public static AdminUserListResponse from(Page<UserProfileSummaryResult> pageResult) {
        List<UserProfileSummaryResponse> content = pageResult.getContent().stream()
                .map(UserProfileSummaryResponse::from)
                .toList();
        return new AdminUserListResponse(
                content,
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalElements()
        );
    }
}
