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

const styles = {
  container: { border: '1px solid #ddd', borderRadius: '8px', padding: '24px', marginBottom: '16px' } as const,
  title: { fontSize: '18px', marginBottom: '16px' } as const,
  error: { color: 'red', marginBottom: '12px' } as const,
  fieldColumn: { display: 'flex', flexDirection: 'column', gap: '12px' } as const,
  input: { display: 'block' as const, width: '100%', padding: '8px', marginTop: '4px' },
  fieldError: { color: 'red', fontSize: '14px', margin: '4px 0 0' } as const,
  checkboxRow: { display: 'flex', alignItems: 'center', gap: '8px' } as const,
  buttonRow: { display: 'flex', gap: '8px', marginTop: '20px' } as const,
  cancelBtn: { padding: '12px 24px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer' } as const,
  submitBtn: { flex: 1, padding: '12px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' } as const,
  submitBtnDisabled: { flex: 1, padding: '12px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#ccc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'not-allowed' } as const,
};

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
    <div style={styles.container}>
      <h2 style={styles.title}>{isEditMode ? '배송지 수정' : '새 배송지 추가'}</h2>
      {error && <p role="alert" style={styles.error}>{error}</p>}

      <form onSubmit={handleSubmit} noValidate>
        <div style={styles.fieldColumn}>
          <div>
            <label htmlFor="label">배송지명</label>
            <input id="label" type="text" value={label} onChange={(e) => { setLabel(e.target.value); clearFieldError('label'); }} placeholder="집, 회사 등" style={styles.input} />
            {fieldErrors.label && <p role="alert" style={styles.fieldError}>{fieldErrors.label}</p>}
          </div>
          <div>
            <label htmlFor="recipientName">수령인</label>
            <input id="recipientName" type="text" value={recipientName} onChange={(e) => { setRecipientName(e.target.value); clearFieldError('recipientName'); }} style={styles.input} />
            {fieldErrors.recipientName && <p role="alert" style={styles.fieldError}>{fieldErrors.recipientName}</p>}
          </div>
          <div>
            <label htmlFor="addressPhone">연락처</label>
            <input id="addressPhone" type="tel" value={phone} onChange={(e) => { setPhone(e.target.value); clearFieldError('phone'); }} placeholder="010-0000-0000" style={styles.input} />
            {fieldErrors.phone && <p role="alert" style={styles.fieldError}>{fieldErrors.phone}</p>}
          </div>
          <div>
            <label htmlFor="zipCode">우편번호</label>
            <input id="zipCode" type="text" value={zipCode} onChange={(e) => { setZipCode(e.target.value); clearFieldError('zipCode'); }} style={styles.input} />
            {fieldErrors.zipCode && <p role="alert" style={styles.fieldError}>{fieldErrors.zipCode}</p>}
          </div>
          <div>
            <label htmlFor="address1">주소</label>
            <input id="address1" type="text" value={address1} onChange={(e) => { setAddress1(e.target.value); clearFieldError('address1'); }} style={styles.input} />
            {fieldErrors.address1 && <p role="alert" style={styles.fieldError}>{fieldErrors.address1}</p>}
          </div>
          <div>
            <label htmlFor="address2">상세주소</label>
            <input id="address2" type="text" value={address2} onChange={(e) => setAddress2(e.target.value)} placeholder="상세주소 (선택)" style={styles.input} />
          </div>
          {!isEditMode && (
            <div style={styles.checkboxRow}>
              <input id="isDefault" type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
              <label htmlFor="isDefault">기본 배송지로 설정</label>
            </div>
          )}
        </div>

        <div style={styles.buttonRow}>
          <button type="submit" disabled={isSubmitting}
            style={isSubmitting ? styles.submitBtnDisabled : styles.submitBtn}>
            {isSubmitting ? '저장 중...' : isEditMode ? '수정 완료' : '추가'}
          </button>
          <button type="button" onClick={onCancel} style={styles.cancelBtn}>취소</button>
        </div>
      </form>
    </div>
  );
}
