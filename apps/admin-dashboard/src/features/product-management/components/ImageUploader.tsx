'use client';

import { useRef, useState, useCallback } from 'react';

interface Props {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  currentCount: number;
  maxCount: number;
}

const ACCEPT = 'image/jpeg,image/png,image/webp';

const styles = {
  dropZone: {
    border: '2px dashed #d1d5db',
    borderRadius: '8px',
    padding: '32px 20px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'border-color 0.2s, background-color 0.2s',
    backgroundColor: '#fafafa',
  } as const,
  dropZoneActive: {
    border: '2px dashed #1A1A2E',
    borderRadius: '8px',
    padding: '32px 20px',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: '#f0f0ff',
  } as const,
  dropZoneDisabled: {
    border: '2px dashed #e5e7eb',
    borderRadius: '8px',
    padding: '32px 20px',
    textAlign: 'center',
    cursor: 'not-allowed',
    backgroundColor: '#f9fafb',
    opacity: 0.6,
  } as const,
  icon: {
    fontSize: '2rem',
    marginBottom: '8px',
    color: '#9ca3af',
  } as const,
  mainText: {
    fontSize: '0.875rem',
    color: '#374151',
    marginBottom: '4px',
  } as const,
  subText: {
    fontSize: '0.75rem',
    color: '#9ca3af',
  } as const,
  selectBtn: {
    display: 'inline-block',
    marginTop: '12px',
    padding: '8px 20px',
    fontSize: '0.8125rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    color: '#374151',
    fontWeight: 500,
  } as const,
  hiddenInput: {
    display: 'none',
  } as const,
};

export function ImageUploader({
  onFilesSelected,
  disabled = false,
  currentCount,
  maxCount,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || disabled) return;
      const files = Array.from(fileList);
      if (files.length > 0) {
        onFilesSelected(files);
      }
    },
    [disabled, onFilesSelected],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (!disabled) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [disabled, handleFiles],
  );

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const isFull = currentCount >= maxCount;
  const isDisabled = disabled || isFull;

  const dropZoneStyle = isDisabled
    ? styles.dropZoneDisabled
    : isDragging
      ? styles.dropZoneActive
      : styles.dropZone;

  return (
    <div
      style={dropZoneStyle}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label="이미지 업로드 영역"
      data-testid="image-uploader"
    >
      <div style={styles.icon}>+</div>
      <p style={styles.mainText}>
        {isFull
          ? '이미지를 더 이상 추가할 수 없습니다'
          : '이미지를 드래그하거나 클릭하여 선택하세요'}
      </p>
      <p style={styles.subText}>
        JPEG, PNG, WebP / 최대 5MB / {currentCount}/{maxCount}장
      </p>
      {!isDisabled && (
        <button type="button" style={styles.selectBtn} tabIndex={-1}>
          파일 선택
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT}
        multiple
        style={styles.hiddenInput}
        onChange={(e) => {
          handleFiles(e.target.files);
          // Reset input so same file can be selected again
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }}
        data-testid="file-input"
      />
    </div>
  );
}
