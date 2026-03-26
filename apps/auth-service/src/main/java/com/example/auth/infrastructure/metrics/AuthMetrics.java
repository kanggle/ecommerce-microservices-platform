package com.example.auth.infrastructure.metrics;

import com.example.auth.domain.service.AuthMetricsRecorder;
import com.example.observability.metrics.EventMetricNames;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Component
public class AuthMetrics implements AuthMetricsRecorder {

    private final MeterRegistry registry;
    private final Counter signupTotal;
    private final Counter loginSuccessTotal;
    private final Counter loginFailureTotal;
    private final Counter loginFailureInvalidCredentials;
    private final Counter loginFailureRateLimited;
    private final Counter logoutTotal;
    private final Counter tokenRefreshSuccessTotal;
    private final Counter tokenRefreshFailureTotal;
    private final Counter sessionEvictionTotal;

    public AuthMetrics(MeterRegistry registry) {
        Objects.requireNonNull(registry, "MeterRegistry must not be null");
        this.registry = registry;
        this.signupTotal = Counter.builder("auth_signup_total")
                .description("Total successful signups")
                .register(registry);

        this.loginSuccessTotal = Counter.builder("auth_login_total")
                .description("Total login attempts")
                .tag("result", "success")
                .register(registry);

        this.loginFailureTotal = Counter.builder("auth_login_total")
                .description("Total login attempts")
                .tag("result", "failure")
                .register(registry);

        this.loginFailureInvalidCredentials = Counter.builder("auth_login_failure_total")
                .description("Total failed login attempts by reason")
                .tag("reason", "invalid_credentials")
                .register(registry);

        this.loginFailureRateLimited = Counter.builder("auth_login_failure_total")
                .description("Total failed login attempts by reason")
                .tag("reason", "rate_limited")
                .register(registry);

        this.logoutTotal = Counter.builder("auth_logout_total")
                .description("Total logout requests")
                .register(registry);

        this.tokenRefreshSuccessTotal = Counter.builder("auth_token_refresh_total")
                .description("Total token refresh attempts")
                .tag("result", "success")
                .register(registry);

        this.tokenRefreshFailureTotal = Counter.builder("auth_token_refresh_total")
                .description("Total token refresh attempts")
                .tag("result", "failure")
                .register(registry);

        this.sessionEvictionTotal = Counter.builder("auth_session_eviction_total")
                .description("Total sessions evicted due to concurrent session limit")
                .register(registry);
    }

    @Override
    public void incrementSignup() {
        signupTotal.increment();
    }

    @Override
    public void incrementLoginSuccess() {
        loginSuccessTotal.increment();
    }

    @Override
    public void incrementLoginFailure(String reason) {
        loginFailureTotal.increment();
        switch (reason) {
            case "invalid_credentials" -> loginFailureInvalidCredentials.increment();
            case "rate_limited" -> loginFailureRateLimited.increment();
            default -> loginFailureInvalidCredentials.increment();
        }
    }

    @Override
    public void incrementLogout() {
        logoutTotal.increment();
    }

    @Override
    public void incrementTokenRefreshSuccess() {
        tokenRefreshSuccessTotal.increment();
    }

    @Override
    public void incrementTokenRefreshFailure() {
        tokenRefreshFailureTotal.increment();
    }

    @Override
    public void incrementSessionEviction() {
        sessionEvictionTotal.increment();
    }

    public void incrementEventPublishFailure(String eventType) {
        registry.counter(EventMetricNames.EVENT_PUBLISH_FAILURE_TOTAL,
                EventMetricNames.TAG_SERVICE, "auth-service",
                EventMetricNames.TAG_EVENT_TYPE, eventType)
                .increment();
    }
}
