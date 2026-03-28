package com.example.user.infrastructure.adapter;

import com.example.user.domain.service.ProductInfoProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Component
public class RestProductInfoProvider implements ProductInfoProvider {

    private final RestTemplate restTemplate;
    private final String productServiceBaseUrl;

    public RestProductInfoProvider(
            @Value("${product-service.base-url:http://localhost:8082}") String productServiceBaseUrl) {
        this.restTemplate = new RestTemplate();
        this.productServiceBaseUrl = productServiceBaseUrl;
    }

    @Override
    public Map<UUID, ProductInfo> getProductInfos(Set<UUID> productIds) {
        Map<UUID, ProductInfo> result = new HashMap<>();

        for (UUID productId : productIds) {
            try {
                ProductDetailResponse response = restTemplate.getForObject(
                        productServiceBaseUrl + "/api/products/{productId}",
                        ProductDetailResponse.class,
                        productId
                );
                if (response != null) {
                    result.put(productId, new ProductInfo(
                            productId,
                            response.name(),
                            response.price(),
                            response.status()
                    ));
                } else {
                    result.put(productId, deletedProductInfo(productId));
                }
            } catch (Exception e) {
                log.warn("Failed to fetch product info for productId={}: {}", productId, e.getMessage());
                result.put(productId, deletedProductInfo(productId));
            }
        }

        return result;
    }

    private ProductInfo deletedProductInfo(UUID productId) {
        return new ProductInfo(productId, null, 0, "DELETED");
    }

    private record ProductDetailResponse(
            String productId,
            String name,
            String description,
            String status,
            int price,
            String categoryId
    ) {
    }
}
