package com.example.gateway.security;

import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.util.AntPathMatcher;

@Service
public class RouteService {

    private static final AntPathMatcher PATH_MATCHER = new AntPathMatcher();

    public boolean isPublicRoute(HttpMethod method, String path) {
        if (HttpMethod.POST.equals(method)) {
            if ("/api/auth/signup".equals(path)) return true;
            if ("/api/auth/login".equals(path)) return true;
            if ("/api/auth/refresh".equals(path)) return true;
        }
        if (HttpMethod.GET.equals(method)) {
            if (PATH_MATCHER.match("/api/products/**", path)) return true;
            if (PATH_MATCHER.match("/api/search/**", path)) return true;
            if ("/actuator/health".equals(path)) return true;
        }
        return false;
    }

    public String resolveTargetService(String path) {
        if (path.startsWith("/api/auth")) return "auth-service";
        if (path.startsWith("/api/users") || path.startsWith("/api/admin/users")) return "user-service";
        if (path.startsWith("/api/products") || path.startsWith("/api/admin/products")) return "product-service";
        if (path.startsWith("/api/search")) return "search-service";
        if (path.startsWith("/api/orders")) return "order-service";
        if (path.startsWith("/api/payments")) return "payment-service";
        return "unknown";
    }
}
