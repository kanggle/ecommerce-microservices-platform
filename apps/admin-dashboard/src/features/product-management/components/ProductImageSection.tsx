'use client';

import { Section } from '@/shared/ui';
import { useProductImages } from '../hooks/use-product-images';
import { ImageUploader } from './ImageUploader';
import { ImageGallery } from './ImageGallery';
import { formStyles } from '@/shared/lib/form-styles';

interface Props {
  productId?: string;
}

const MAX_IMAGE_COUNT = 10;

const styles = {
  noProductMessage: {
    padding: '20px',
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '0.875rem',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  } as const,
  uploaderWrapper: {
    marginBottom: '16px',
  } as const,
};

export function ProductImageSection({ productId }: Props) {
  const {
    images,
    uploadingImages,
    isLoading,
    isUploading,
    error,
    clearError,
    uploadImages,
    removeUploadingImage,
    setPrimary,
    removeImage,
    updateSortOrder,
  } = useProductImages(productId);

  if (!productId) {
    return (
      <Section title="상품 이미지">
        <p style={styles.noProductMessage}>
          상품을 먼저 저장한 후 이미지를 추가할 수 있습니다.
        </p>
      </Section>
    );
  }

  if (isLoading) {
    return (
      <Section title="상품 이미지">
        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>이미지 로딩 중...</p>
      </Section>
    );
  }

  const currentCount = images.length + uploadingImages.filter(
    (u) => u.status !== 'error',
  ).length;

  return (
    <Section title="상품 이미지">
      {error && (
        <div style={{ ...formStyles.errorAlert, marginBottom: '12px', whiteSpace: 'pre-line' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span>{error}</span>
            <button
              type="button"
              onClick={clearError}
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: '#dc2626',
                fontSize: '1rem',
                padding: '0 0 0 8px',
              }}
              aria-label="에러 닫기"
            >
              x
            </button>
          </div>
        </div>
      )}

      <div style={styles.uploaderWrapper}>
        <ImageUploader
          onFilesSelected={uploadImages}
          disabled={isUploading}
          currentCount={currentCount}
          maxCount={MAX_IMAGE_COUNT}
        />
      </div>

      <ImageGallery
        images={images}
        uploadingImages={uploadingImages}
        onSetPrimary={setPrimary}
        onDelete={removeImage}
        onUpdateSortOrder={updateSortOrder}
        onRemoveUploading={removeUploadingImage}
      />
    </Section>
  );
}
