package com.example.search.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "search.index")
public record IndexProperties(String name) {
}
