'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ShippingAddress } from '@repo/types';
import { isApiError, ERROR_MESSAGES } from '@repo/types/guards';
import type { CheckoutFormProps } from '../model/types';
import { submitOrder } from '../api/place-order';

const styles = {
  section: { marginBottom: '24px' } as const,
  sectionTitle: { fontSize: '18px', marginBottom: '12px' } as const,
  error: { color: 'red', marginBottom: '16px' } as const,
  itemRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' } as const,
  totalRow: { textAlign: 'right', marginTop: '8px', fontWeight: 'bold', fontSize: '18px' } as const,
  fieldColumn: { display: 'flex', flexDirection: 'column', gap: '12px' } as const,
  input: { display: 'block', width: '100%', padding: '8px', marginTop: '4px' } as const,
  title: { marginBottom: '24px' } as const,
  submitBtn: { width: '100%', padding: '16px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' } as const,
  submitBtnDisabled: { width: '100%', padding: '16px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#ccc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'not-allowed' } as const,
};

export function CheckoutForm({ items, totalAmount, onOrderComplete }: CheckoutFormProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [address, setAddress] = useState<ShippingAddress>({
    recipient: '', phone: '', zipCode: '', address1: '', address2: '',
  });

  const isValid =
    address.recipient.trim().length > 0 && address.phone.trim().length > 0 &&
    address.zipCode.trim().length > 0 && address.address1.trim().length > 0;

  function updateField(field: keyof ShippingAddress, value: string) {
    setAddress((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || isSubmitting || items.length === 0) return;

    setError('');
    setIsSubmitting(true);

    try {
      const orderItems = items.map((item) => ({
        productId: item.productId, variantId: item.variantId, quantity: item.quantity,
      }));
      const result = await submitOrder({ items: orderItems, shippingAddress: address });
      onOrderComplete();
      router.push(`/orders/${result.orderId}`);
    } catch (err) {
      if (isApiError(err)) {
        setError(ERROR_MESSAGES[err.code] ?? err.message ?? '주문에 실패했습니다.');
      } else {
        setError('주문에 실패했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h1 style={styles.title}>주문하기</h1>

      {error && <p role="alert" style={styles.error}>{error}</p>}

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>주문 상품</h2>
        {items.map((item) => (
          <div key={`${item.productId}-${item.variantId}`} style={styles.itemRow}>
            <span>{item.productName} ({item.optionName}) × {item.quantity}</span>
            <span>{(item.price * item.quantity).toLocaleString()}원</span>
          </div>
        ))}
        <div style={styles.totalRow}>합계: {totalAmount.toLocaleString()}원</div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>배송지 정보</h2>
        <div style={styles.fieldColumn}>
          <div>
            <label htmlFor="recipient">수령인</label>
            <input id="recipient" type="text" value={address.recipient} onChange={(e) => updateField('recipient', e.target.value)} required style={styles.input} />
          </div>
          <div>
            <label htmlFor="phone">전화번호</label>
            <input id="phone" type="tel" value={address.phone} onChange={(e) => updateField('phone', e.target.value)} required placeholder="010-0000-0000" style={styles.input} />
          </div>
          <div>
            <label htmlFor="zipCode">우편번호</label>
            <input id="zipCode" type="text" value={address.zipCode} onChange={(e) => updateField('zipCode', e.target.value)} required style={styles.input} />
          </div>
          <div>
            <label htmlFor="address1">주소</label>
            <input id="address1" type="text" value={address.address1} onChange={(e) => updateField('address1', e.target.value)} required style={styles.input} />
          </div>
          <div>
            <label htmlFor="address2">상세주소</label>
            <input id="address2" type="text" value={address.address2} onChange={(e) => updateField('address2', e.target.value)} style={styles.input} />
          </div>
        </div>
      </section>

      <button type="submit" disabled={!isValid || isSubmitting || items.length === 0}
        style={!isValid || isSubmitting ? styles.submitBtnDisabled : styles.submitBtn}>
        {isSubmitting ? '주문 처리 중...' : `${totalAmount.toLocaleString()}원 결제하기`}
      </button>
    </form>
  );
}
