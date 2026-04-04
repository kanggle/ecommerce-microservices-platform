'use client';

import { useEffect, useState } from 'react';
import type { Address, ShippingAddress } from '@repo/types';

import { isApiError, ERROR_MESSAGES } from '@repo/types/guards';
import type { CheckoutFormProps } from '../model/types';
import { submitOrder } from '../api/place-order';
import { useTossPayment } from '../model/use-toss-payment';
import { AddressSearch } from '@/shared/ui/AddressSearch';
import { Skeleton } from '@/shared/ui/Skeleton';
import { useAddresses } from '@/entities/user';
import { isValidPhone } from '@/shared/lib/validate-phone';

function addressToShipping(addr: Address): ShippingAddress {
  return {
    recipient: addr.recipientName,
    phone: addr.phone,
    zipCode: addr.zipCode,
    address1: addr.address1,
    address2: addr.address2 ?? '',
  };
}

export function CheckoutForm({ items, totalAmount, onOrderComplete }: CheckoutFormProps) {
  const { isReady: paymentReady, requestPayment } = useTossPayment();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [address, setAddress] = useState<ShippingAddress>({
    recipient: '', phone: '', zipCode: '', address1: '', address2: '',
  });

  const { data: addressData, isLoading: addressLoading } = useAddresses();

  const savedAddresses = addressData?.addresses ?? [];

  useEffect(() => {
    if (addressData && !selectedAddressId) {
      const addrs = addressData.addresses;
      const defaultAddr = addrs.find((a) => a.isDefault) ?? addrs[0];
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
        setAddress(addressToShipping(defaultAddr));
      }
    }
  }, [addressData, selectedAddressId]);

  function handleAddressSelect(id: string) {
    setSelectedAddressId(id);
    if (id === 'new') {
      setAddress({ recipient: '', phone: '', zipCode: '', address1: '', address2: '' });
      return;
    }
    const found = savedAddresses.find((a) => a.id === id);
    if (found) {
      setAddress(addressToShipping(found));
    }
  }

  const phoneValid = isValidPhone(address.phone);
  const isValid =
    address.recipient.trim().length > 0 && phoneValid &&
    address.zipCode.trim().length > 0 && address.address1.trim().length > 0;
  const isNewAddress = selectedAddressId === 'new' || selectedAddressId === '';

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
        productId: item.productId, variantId: item.variantId,
        productName: item.productName, optionName: item.optionName,
        quantity: item.quantity, unitPrice: item.price,
      }));
      const result = await submitOrder({ items: orderItems, shippingAddress: address });
      const orderName = items[0].productName + (items.length > 1 ? ` 외 ${items.length - 1}건` : '');
      onOrderComplete();
      await requestPayment({ orderId: result.orderId, amount: totalAmount, orderName });
    } catch (err) {
      if (isApiError(err)) {
        setError(ERROR_MESSAGES[err.code] ?? err.message ?? '주문에 실패했습니다.');
      } else {
        setError('주문에 실패했습니다.');
      }
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h1 className="page-title">주문하기</h1>

      {error && <div role="alert" className="alert-error">{error}</div>}

      <section style={{ marginBottom: 'var(--space-8)' }}>
        <h2 className="section-title">주문 상품</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.variantId}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-3)',
                border: '1px solid var(--color-border-light)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                  {item.productName}
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                  {item.optionName} × {item.quantity}
                </div>
              </div>
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', whiteSpace: 'nowrap', flexShrink: 0 }} className="price">
                {(item.price * item.quantity).toLocaleString()}<span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-normal)', color: 'var(--color-text-secondary)', marginLeft: '2px' }}>원</span>
              </span>
            </div>
          ))}
        </div>
        <div
          style={{
            textAlign: 'right',
            marginTop: 'var(--space-4)',
            fontWeight: 'var(--font-weight-bold)',
            fontSize: 'var(--font-size-lg)',
          }}
        >
          합계: <span className="price">{totalAmount.toLocaleString()}<span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-normal)', color: 'var(--color-text-secondary)', marginLeft: '2px' }}>원</span></span>
        </div>
      </section>

      <section style={{ marginBottom: 'var(--space-8)' }}>
        <h2 className="section-title">배송지 정보</h2>

        {addressLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            <Skeleton width="100%" height="72px" borderRadius="var(--radius-md)" />
            <Skeleton width="100%" height="72px" borderRadius="var(--radius-md)" />
          </div>
        )}

        {!addressLoading && savedAddresses.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            {savedAddresses.map((addr) => (
              <label
                key={addr.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-3)',
                  border: selectedAddressId === addr.id ? '2px solid var(--color-primary)' : '1px solid var(--color-border-light)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  background: selectedAddressId === addr.id ? 'rgba(26, 26, 46, 0.03)' : 'var(--color-white)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <input
                  type="radio"
                  name="savedAddress"
                  checked={selectedAddressId === addr.id}
                  onChange={() => handleAddressSelect(addr.id)}
                  style={{ flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: '2px' }}>
                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>{addr.label}</span>
                    {addr.isDefault && (
                      <span style={{ display: 'inline-block', padding: '1px 6px', fontSize: '0.65rem', fontWeight: 'var(--font-weight-semibold)', backgroundColor: 'var(--color-primary)', color: '#fff', borderRadius: 'var(--radius-full)' }}>기본</span>
                    )}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                    {addr.recipientName} · {addr.phone}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                    ({addr.zipCode}) {addr.address1}{addr.address2 ? ` ${addr.address2}` : ''}
                  </div>
                </div>
              </label>
            ))}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-3)',
                border: selectedAddressId === 'new' ? '2px solid var(--color-primary)' : '1px solid var(--color-border-light)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                background: selectedAddressId === 'new' ? 'rgba(26, 26, 46, 0.03)' : 'var(--color-white)',
                transition: 'all var(--transition-fast)',
              }}
            >
              <input
                type="radio"
                name="savedAddress"
                checked={selectedAddressId === 'new'}
                onChange={() => handleAddressSelect('new')}
                style={{ flexShrink: 0 }}
              />
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>새 배송지 직접 입력</span>
            </label>
          </div>
        )}

        {!addressLoading && (isNewAddress || savedAddresses.length === 0) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="recipient" className="label">수령인</label>
              <input id="recipient" type="text" className="input" value={address.recipient} onChange={(e) => updateField('recipient', e.target.value)} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="phone" className="label">전화번호</label>
              <input id="phone" type="tel" className="input" value={address.phone} onChange={(e) => updateField('phone', e.target.value)} required placeholder="010-0000-0000" />
              {address.phone.trim().length > 0 && !phoneValid && (
                <p style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-xs)', margin: 'var(--space-1) 0 0' }}>올바른 휴대폰 번호를 입력해주세요. (예: 010-1234-5678)</p>
              )}
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="label">주소</label>
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                <input id="address1" type="text" className="input" value={address.address1} readOnly placeholder="주소 검색을 눌러주세요" style={{ flex: 1, background: 'var(--color-bg-secondary)' }} />
                <AddressSearch onSelect={({ zipCode, address1 }) => {
                  setAddress((prev) => ({ ...prev, zipCode, address1 }));
                }} />
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <input id="address2" type="text" className="input" value={address.address2 ?? ''} onChange={(e) => updateField('address2', e.target.value)} placeholder="상세주소 입력" style={{ flex: 1 }} />
                <input id="zipCode" type="text" className="input" value={address.zipCode} readOnly placeholder="우편번호" style={{ width: 100, background: 'var(--color-bg-secondary)', textAlign: 'center' }} />
              </div>
            </div>
          </div>
        )}
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
        {isSubmitting ? '주문 처리 중...' : <>{totalAmount.toLocaleString()}<span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-normal)', margin: '0 var(--space-2) 0 2px' }}>원</span>결제하기</>}
      </button>
    </form>
  );
}
