package com.example.gateway.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("RateLimiterConfig 단위 테스트")
class RateLimiterConfigTest {

    @Test
    @DisplayName("ipKeyResolver가 null이 아닌 빈을 반환한다")
    void ipKeyResolver_returnsNonNull() {
        RateLimiterConfig config = new RateLimiterConfig();

        assertThat(config.ipKeyResolver()).isNotNull();
    }
}
