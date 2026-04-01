package com.example.auth.infrastructure.config;

import com.example.auth.domain.service.OAuthCallbackProperties;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "oauth.google")
public class GoogleOAuthProperties implements OAuthCallbackProperties {

    private String clientId;
    private String clientSecret;
    private String redirectUri;
    private String callbackAllowlist;

    @Override
    public List<String> allowedCallbackUrls() {
        if (callbackAllowlist == null || callbackAllowlist.isBlank()) {
            return List.of();
        }
        return Arrays.stream(callbackAllowlist.split(","))
            .map(String::trim)
            .filter(s -> !s.isBlank())
            .toList();
    }

    @Override
    public String googleRedirectUri() {
        return redirectUri;
    }
}
