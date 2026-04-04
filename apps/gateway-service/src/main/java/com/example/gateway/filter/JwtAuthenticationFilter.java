package com.example.gateway.filter;

import com.example.web.dto.ErrorResponse;
import com.example.gateway.config.GatewayMetrics;
import com.example.gateway.security.RouteService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Slf4j
@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private static final int ORDER = -100;

    private final JwtParser jwtParser;
    private final ObjectMapper objectMapper;
    private final GatewayMetrics gatewayMetrics;
    private final RouteService routeService;

    private static final int MIN_SECRET_LENGTH = 32;

    public JwtAuthenticationFilter(
            @Value("${jwt.secret}") String secret,
            ObjectMapper objectMapper,
            GatewayMetrics gatewayMetrics,
            RouteService routeService) {
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < MIN_SECRET_LENGTH) {
            throw new IllegalArgumentException(
                    "JWT secret must be at least " + MIN_SECRET_LENGTH + " bytes for HMAC-SHA256");
        }
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.jwtParser = Jwts.parser().verifyWith(key).build();
        this.objectMapper = objectMapper;
        this.gatewayMetrics = gatewayMetrics;
        this.routeService = routeService;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        HttpMethod method = request.getMethod();
        String path = request.getPath().value();

        ServerHttpRequest strippedRequest = stripSpoofHeaders(request);

        if (routeService.isPublicRoute(method, path)) {
            String targetService = routeService.resolveTargetService(path);
            gatewayMetrics.incrementRequestsRouted(targetService);
            return chain.filter(exchange.mutate().request(strippedRequest).build());
        }

        String authHeader = strippedRequest.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            gatewayMetrics.incrementJwtValidationFailure("missing");
            return writeUnauthorized(exchange, "Access token is required");
        }

        String token = authHeader.substring(7);
        return validateTokenAndEnrichRequest(exchange, strippedRequest, chain, token, path);
    }

    private ServerHttpRequest stripSpoofHeaders(ServerHttpRequest request) {
        return request.mutate()
                .headers(h -> {
                    h.remove("X-User-Id");
                    h.remove("X-User-Email");
                    h.remove("X-User-Role");
                })
                .build();
    }

    private Mono<Void> validateTokenAndEnrichRequest(
            ServerWebExchange exchange,
            ServerHttpRequest strippedRequest,
            GatewayFilterChain chain,
            String token,
            String path) {
        try {
            Claims claims = jwtParser.parseSignedClaims(token).getPayload();
            String userId = claims.getSubject();
            String email = claims.get("email", String.class);
            String role = claims.get("role", String.class);

            if (userId == null || userId.isBlank() || email == null || email.isBlank()) {
                gatewayMetrics.incrementJwtValidationFailure("invalid");
                return writeUnauthorized(exchange, "Invalid or expired access token");
            }

            ServerHttpRequest.Builder requestBuilder = strippedRequest.mutate()
                    .header("X-User-Id", userId)
                    .header("X-User-Email", email);
            if (role != null && !role.isBlank()) {
                requestBuilder.header("X-User-Role", role);
            }
            ServerHttpRequest mutatedRequest = requestBuilder.build();

            String targetService = routeService.resolveTargetService(path);
            gatewayMetrics.incrementRequestsRouted(targetService);

            return chain.filter(exchange.mutate().request(mutatedRequest).build());
        } catch (ExpiredJwtException e) {
            log.debug("JWT expired: {}", e.getMessage());
            gatewayMetrics.incrementJwtValidationFailure("expired");
            return writeUnauthorized(exchange, "Invalid or expired access token");
        } catch (JwtException e) {
            log.debug("JWT validation failed: {}", e.getMessage());
            gatewayMetrics.incrementJwtValidationFailure("invalid");
            return writeUnauthorized(exchange, "Invalid or expired access token");
        }
    }

    @Override
    public int getOrder() {
        return ORDER;
    }

    private Mono<Void> writeUnauthorized(ServerWebExchange exchange, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        ErrorResponse body = ErrorResponse.of("UNAUTHORIZED", message);

        try {
            byte[] bytes = objectMapper.writeValueAsBytes(body);
            DataBuffer buffer = response.bufferFactory().wrap(bytes);
            return response.writeWith(Mono.just(buffer));
        } catch (JsonProcessingException e) {
            return response.setComplete();
        }
    }
}
