import type { ProductDetail as ProductDetailType } from '@repo/types';
import { ProductImage } from '@/entities/product';

interface ProductDetailProps {
  product: ProductDetailType;
}

export function ProductDetail({ product }: ProductDetailProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
      <ProductImage
        src={`/images/products/${product.id}.jpg`}
        alt={product.name}
      />
      <div>
        <h1 style={{ margin: '0 0 16px', fontSize: '24px' }}>{product.name}</h1>
        <p style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 16px' }}>
          {product.price.toLocaleString()}원
        </p>
        <p style={{ color: '#666', lineHeight: 1.6 }}>{product.description}</p>

        {product.variants.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>옵션</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {product.variants.map((variant) => (
                <li
                  key={variant.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid #eee',
                  }}
                >
                  <span>{variant.optionName}</span>
                  <span style={{ display: 'flex', gap: '12px' }}>
                    {variant.additionalPrice > 0 && (
                      <span>+{variant.additionalPrice.toLocaleString()}원</span>
                    )}
                    <span style={{ color: variant.stock === 0 ? '#e00' : '#666' }}>
                      {variant.stock === 0 ? '품절' : `재고 ${variant.stock}`}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
