'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ShippingAddress } from '@repo/types';
import { isApiError, ERROR_MESSAGES } from '@repo/types/guards';
import type { CheckoutFormProps } from '../model/types';
import { submitOrder } from '../api/place-order';

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
      <h1 className="page-title">주문하기</h1>

      {error && <div role="alert" className="alert-error">{error}</div>}

      <section style={{ marginBottom: 'var(--space-8)' }}>
        <h2 className="section-title">주문 상품</h2>
        {items.map((item) => (
          <div
            key={`${item.productId}-${item.variantId}`}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: 'var(--space-2) 0',
              borderBottom: '1px solid var(--color-border-light)',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            <span>{item.productName} ({item.optionName}) &times; {item.quantity}</span>
            <span className="price">{(item.price * item.quantity).toLocaleString()}원</span>
          </div>
        ))}
        <div
          style={{
            textAlign: 'right',
            marginTop: 'var(--space-3)',
            fontWeight: 'var(--font-weight-bold)',
            fontSize: 'var(--font-size-lg)',
          }}
        >
          합계: {totalAmount.toLocaleString()}원
        </div>
      </section>

      <section style={{ marginBottom: 'var(--space-8)' }}>
        <h2 className="section-title">배송지 정보</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="recipient" className="label">수령인</label>
            <input id="recipient" type="text" className="input" value={address.recipient} onChange={(e) => updateField('recipient', e.target.value)} required />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="phone" className="label">전화번호</label>
            <input id="phone" type="tel" className="input" value={address.phone} onChange={(e) => updateField('phone', e.target.value)} required placeholder="010-0000-0000" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="zipCode" className="label">우편번호</label>
            <input id="zipCode" type="text" className="input" value={address.zipCode} onChange={(e) => updateField('zipCode', e.target.value)} required />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="address1" className="label">주소</label>
            <input id="address1" type="text" className="input" value={address.address1} onChange={(e) => updateField('address1', e.target.value)} required />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="address2" className="label">상세주소</label>
            <input id="address2" type="text" className="input" value={address.address2} onChange={(e) => updateField('address2', e.target.value)} />
          </div>
        </div>
      </section>

      <button
        type="submit"
        disabled={!isValid || isSubmitting || items.length === 0}
        className="btn btn-accent btn-lg"
        style={{
          width: '100%',
          opacity: !isValid || isSubmitting ? 0.5 : 1,
        }}
      >
        {isSubmitting ? '주문 처리 중...' : `${totalAmount.toLocaleString()}원 결제하기`}
      </button>
    </form>
  );
}
