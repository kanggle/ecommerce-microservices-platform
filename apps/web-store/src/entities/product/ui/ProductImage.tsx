'use client';

import Image from 'next/image';
import { useState } from 'react';

interface ProductImageProps {
  src: string;
  alt: string;
}

export function ProductImage({ src, alt }: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <div style={{ aspectRatio: '1', backgroundColor: '#f5f5f5', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
      {hasError ? (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
          이미지를 불러올 수 없습니다
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{ objectFit: 'cover' }}
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}
