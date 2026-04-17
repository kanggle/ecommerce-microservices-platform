package com.example.product.presentation.controller;

import com.example.product.application.service.ProductImageService;
import com.example.product.domain.model.ProductImage;
import com.example.product.domain.port.MediaUrlResolver;
import com.example.product.presentation.dto.ImageResponse;
import com.example.product.presentation.dto.PresignedUrlRequest;
import com.example.product.presentation.dto.PresignedUrlResponse;
import com.example.product.presentation.dto.RegisterImageRequest;
import com.example.product.presentation.dto.RegisterImageResponse;
import com.example.product.presentation.dto.UpdateImageRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URL;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/products/{productId}/images")
@RequiredArgsConstructor
public class AdminProductImageController {

    private final ProductImageService productImageService;
    private final MediaUrlResolver mediaUrlResolver;

    @PostMapping("/upload-url")
    public ResponseEntity<PresignedUrlResponse> generateUploadUrl(
            @PathVariable UUID productId,
            @Valid @RequestBody PresignedUrlRequest request) {
        URL url = productImageService.generateUploadUrl(productId, request.contentType(), request.contentLength());
        return ResponseEntity.ok(PresignedUrlResponse.from(url.toString()));
    }

    @PostMapping
    public ResponseEntity<RegisterImageResponse> registerImage(
            @PathVariable UUID productId,
            @Valid @RequestBody RegisterImageRequest request) {
        ProductImage image = productImageService.registerImage(
                productId, request.objectKey(), request.sortOrder(), request.isPrimary());
        String resolvedUrl = mediaUrlResolver.resolve(image.getObjectKey());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(RegisterImageResponse.from(image, resolvedUrl));
    }

    @PatchMapping("/{imageId}")
    public ResponseEntity<ImageResponse> updateImage(
            @PathVariable UUID productId,
            @PathVariable UUID imageId,
            @RequestBody UpdateImageRequest request) {
        ProductImage image = productImageService.updateImage(
                productId, imageId, request.sortOrder(), request.isPrimary());
        String resolvedUrl = mediaUrlResolver.resolve(image.getObjectKey());
        return ResponseEntity.ok(ImageResponse.from(image, resolvedUrl));
    }

    @DeleteMapping("/{imageId}")
    public ResponseEntity<Void> deleteImage(
            @PathVariable UUID productId,
            @PathVariable UUID imageId) {
        productImageService.deleteImage(productId, imageId);
        return ResponseEntity.noContent().build();
    }
}
