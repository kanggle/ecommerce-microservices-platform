'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type {
  ProductDetail,
  ProductStatus,
  CreateProductRequest,
  UpdateProductRequest,
} from '@repo/types';
import { getErrorMessage } from '@repo/types/guards';
import { useCreateProduct } from '../hooks/use-create-product';
import { useUpdateProduct } from '../hooks/use-update-product';
import { VariantEditor, type VariantInput } from './VariantEditor';

interface Props {
  product?: ProductDetail;
}

const styles = {
  error: { color: 'red', marginBottom: '16px' } as const,
  sectionTitle: { fontSize: '1.125rem', fontWeight: 600, marginBottom: '12px' } as const,
  fieldGrid: { display: 'grid', gap: '12px', maxWidth: '480px' } as const,
  label: { display: 'block', marginBottom: '4px', fontWeight: 500 } as const,
  input: { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' } as const,
  textarea: { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', resize: 'vertical' } as const,
  section: { marginBottom: '24px' } as const,
  buttonRow: { display: 'flex', gap: '8px' } as const,
  cancelBtn: { padding: '10px 24px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#fff', cursor: 'pointer' } as const,
  categoryInputEditing: { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#f3f4f6' } as const,
  categoryInputCreating: { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#fff' } as const,
  submitBtn: { padding: '10px 24px', borderRadius: '6px', border: 'none', backgroundColor: '#2563eb', color: '#fff', cursor: 'pointer', opacity: 1, fontWeight: 600 } as const,
  submitBtnDisabled: { padding: '10px 24px', borderRadius: '6px', border: 'none', backgroundColor: '#2563eb', color: '#fff', cursor: 'not-allowed', opacity: 0.5, fontWeight: 600 } as const,
};

export function ProductForm({ product }: Props) {
  const isEdit = !!product;
  const router = useRouter();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [price, setPrice] = useState(product?.price ?? 0);
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? '');
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? 'ON_SALE');
  const [variants, setVariants] = useState<VariantInput[]>(
    product?.variants.map((v, i) => ({
      _key: i, optionName: v.optionName, stock: v.stock, additionalPrice: v.additionalPrice,
    })) ?? [{ _key: 0, optionName: '', stock: 0, additionalPrice: 0 }],
  );
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = name.trim().length > 0 && price > 0 && categoryId.trim().length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setError('');
    setIsSubmitting(true);

    try {
      if (isEdit) {
        const data: UpdateProductRequest = { name: name.trim(), description: description.trim(), price, status };
        await updateProduct.mutateAsync({ productId: product.id, data });
        router.push(`/products/${product.id}`);
      } else {
        const data: CreateProductRequest = {
          name: name.trim(), description: description.trim(), price, categoryId: categoryId.trim(),
          variants: variants.filter((v) => v.optionName.trim().length > 0)
            .map((v) => ({ optionName: v.optionName.trim(), stock: v.stock, additionalPrice: v.additionalPrice })),
        };
        const created = await createProduct.mutateAsync(data);
        router.push(`/products/${created.id}`);
      }
    } catch (err) {
      setError(getErrorMessage(err, '저장에 실패했습니다.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <p role="alert" style={styles.error}>{error}</p>}

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>기본 정보</h2>
        <div style={styles.fieldGrid}>
          <div>
            <label htmlFor="name" style={styles.label}>상품명 *</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required style={styles.input} />
          </div>
          <div>
            <label htmlFor="description" style={styles.label}>설명</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} style={styles.textarea} />
          </div>
          <div>
            <label htmlFor="price" style={styles.label}>가격 *</label>
            <input id="price" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} min={0} required style={styles.input} />
          </div>
          <div>
            <label htmlFor="categoryId" style={styles.label}>카테고리 ID *</label>
            <input id="categoryId" type="text" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required disabled={isEdit}
              style={isEdit ? styles.categoryInputEditing : styles.categoryInputCreating} />
          </div>
          {isEdit && (
            <div>
              <label htmlFor="status" style={styles.label}>상태</label>
              <select id="status" value={status} onChange={(e) => setStatus(e.target.value as ProductStatus)} style={styles.input}>
                <option value="ON_SALE">판매중</option>
                <option value="SOLD_OUT">품절</option>
                <option value="HIDDEN">숨김</option>
              </select>
            </div>
          )}
        </div>
      </section>

      {!isEdit && (
        <VariantEditor variants={variants} onChange={setVariants} initialKeyCount={product?.variants.length ?? 1} />
      )}

      <div style={styles.buttonRow}>
        <button type="submit" disabled={!isValid || isSubmitting}
          style={isValid ? styles.submitBtn : styles.submitBtnDisabled}>
          {isSubmitting ? '저장 중...' : isEdit ? '수정' : '등록'}
        </button>
        <button type="button" onClick={() => router.back()} style={styles.cancelBtn}>취소</button>
      </div>
    </form>
  );
}
