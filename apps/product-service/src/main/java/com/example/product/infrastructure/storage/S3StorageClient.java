package com.example.product.infrastructure.storage;

import com.example.product.domain.exception.StorageUnavailableException;
import com.example.product.domain.port.StorageClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.net.URL;
import java.time.Duration;

@Slf4j
@Component
@Profile("!standalone & !test")
@RequiredArgsConstructor
public class S3StorageClient implements StorageClient {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final StorageProperties storageProperties;

    @Override
    public URL generatePresignedPutUrl(String bucket, String objectKey, String contentType, long contentLength) {
        try {
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(objectKey)
                    .contentType(contentType)
                    .contentLength(contentLength)
                    .build();

            PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                    .putObjectRequest(putRequest)
                    .signatureDuration(Duration.ofMinutes(storageProperties.getS3().getPresignedUrlExpirationMinutes()))
                    .build();

            PresignedPutObjectRequest presigned = s3Presigner.presignPutObject(presignRequest);
            return presigned.url();
        } catch (S3Exception e) {
            log.error("Failed to generate presigned URL for bucket={}, key={}", bucket, objectKey, e);
            throw new StorageUnavailableException("Failed to generate presigned URL", e);
        }
    }

    @Override
    public boolean headObject(String bucket, String objectKey) {
        try {
            s3Client.headObject(HeadObjectRequest.builder()
                    .bucket(bucket)
                    .key(objectKey)
                    .build());
            return true;
        } catch (NoSuchKeyException e) {
            return false;
        } catch (S3Exception e) {
            log.error("Failed to HEAD object bucket={}, key={}", bucket, objectKey, e);
            throw new StorageUnavailableException("Failed to check object existence", e);
        }
    }

    @Override
    public void deleteObject(String bucket, String objectKey) {
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucket)
                    .key(objectKey)
                    .build());
        } catch (S3Exception e) {
            log.warn("Failed to delete object bucket={}, key={} — orphan will be cleaned by lifecycle", bucket, objectKey, e);
        }
    }
}
