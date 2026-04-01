'use client';

import { useState } from 'react';
import type { Address } from '@repo/types';
import { isApiError, ERROR_MESSAGES } from '@repo/types/guards';
import { createAddress, updateAddress } from '../api/address-api';
import { useAddressFormValidation } from '../model/use-address-form-validation';

interface AddressFormProps {
  address?: Address;
  onSaved: () => void;
  onCancel: () => void;
}

export function AddressForm({ address, onSaved, onCancel }: AddressFormProps) {
  const isEditMode = !!address;

  const [label, setLabel] = useState(address?.label ?? '');
  const [recipientName, setRecipientName] = useState(address?.recipientName ?? '');
  const [phone, setPhone] = useState(address?.phone ?? '');
  const [zipCode, setZipCode] = useState(address?.zipCode ?? '');
  const [address1, setAddress1] = useState(address?.address1 ?? '');
  const [address2, setAddress2] = useState(address?.address2 ?? '');
  const [isDefault, setIsDefault] = useState(address?.isDefault ?? false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { fieldErrors, validate, clearFieldError } = useAddressFormValidation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validate(label, recipientName, phone, zipCode, address1)) return;

    setError('');
    setIsSubmitting(true);

    try {
      const payload = {
        label: label.trim(), recipientName: recipientName.trim(), phone: phone.trim(),
        zipCode: zipCode.trim(), address1: address1.trim(), address2: address2.trim() || null, isDefault,
      };
      if (isEditMode) { await updateAddress(address.id, payload); }
      else { await createAddress(payload); }
      onSaved();
    } catch (err) {
      if (isApiError(err)) {
        setError(ERROR_MESSAGES[err.code] ?? err.message ?? '배송지 저장에 실패했습니다.');
      } else {
        setError('배송지 저장에 실패했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-4)' }}>
      <h2 className="section-title">{isEditMode ? '배송지 수정' : '새 배송지 추가'}</h2>
      {error && <div role="alert" className="alert-error">{error}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="label" className="label">배송지명</label>
            <input id="label" type="text" className="input" value={label} onChange={(e) => { setLabel(e.target.value); clearFieldError('label'); }} placeholder="집, 회사 등" />
            {fieldErrors.label && <p role="alert" style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-xs)', margin: 'var(--space-1) 0 0' }}>{fieldErrors.label}</p>}
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="recipientName" className="label">수령인</label>
            <input id="recipientName" type="text" className="input" value={recipientName} onChange={(e) => { setRecipientName(e.target.value); clearFieldError('recipientName'); }} />
            {fieldErrors.recipientName && <p role="alert" style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-xs)', margin: 'var(--space-1) 0 0' }}>{fieldErrors.recipientName}</p>}
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="addressPhone" className="label">연락처</label>
            <input id="addressPhone" type="tel" className="input" value={phone} onChange={(e) => { setPhone(e.target.value); clearFieldError('phone'); }} placeholder="010-0000-0000" />
            {fieldErrors.phone && <p role="alert" style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-xs)', margin: 'var(--space-1) 0 0' }}>{fieldErrors.phone}</p>}
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="zipCode" className="label">우편번호</label>
            <input id="zipCode" type="text" className="input" value={zipCode} onChange={(e) => { setZipCode(e.target.value); clearFieldError('zipCode'); }} />
            {fieldErrors.zipCode && <p role="alert" style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-xs)', margin: 'var(--space-1) 0 0' }}>{fieldErrors.zipCode}</p>}
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="address1" className="label">주소</label>
            <input id="address1" type="text" className="input" value={address1} onChange={(e) => { setAddress1(e.target.value); clearFieldError('address1'); }} />
            {fieldErrors.address1 && <p role="alert" style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-xs)', margin: 'var(--space-1) 0 0' }}>{fieldErrors.address1}</p>}
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="address2" className="label">상세주소</label>
            <input id="address2" type="text" className="input" value={address2} onChange={(e) => setAddress2(e.target.value)} placeholder="상세주소 (선택)" />
          </div>
          {!isEditMode && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <input id="isDefault" type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
              <label htmlFor="isDefault" style={{ fontSize: 'var(--font-size-sm)' }}>기본 배송지로 설정</label>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary btn-lg"
            style={{ flex: 1 }}
          >
            {isSubmitting ? '저장 중...' : isEditMode ? '수정 완료' : '추가'}
          </button>
          <button type="button" onClick={onCancel} className="btn btn-lg">
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
