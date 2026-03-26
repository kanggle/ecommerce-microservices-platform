'use client';

import { useState } from 'react';
import type { Address } from '@repo/types';
import { isApiError, ERROR_MESSAGES } from '@repo/types/guards';
import { deleteAddress, updateAddress } from '../api/address-api';
import { DeleteConfirmation } from './DeleteConfirmation';
import { maskPhone } from '@/shared/lib/mask-phone';

const MAX_ADDRESSES = 10;

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' } as const,
  count: { color: '#666', fontSize: '14px' } as const,
  limitWarning: { color: '#e67e22', fontSize: '14px', marginBottom: '12px' } as const,
  error: { color: 'red', marginBottom: '12px' } as const,
  list: { display: 'flex', flexDirection: 'column', gap: '12px' } as const,
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' } as const,
  labelRow: { display: 'flex', alignItems: 'center', gap: '8px' } as const,
  badge: { fontSize: '12px', backgroundColor: '#333', color: '#fff', padding: '2px 8px', borderRadius: '4px' } as const,
  actionRow: { display: 'flex', gap: '8px' } as const,
  smallBtn: { padding: '4px 8px', fontSize: '13px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer' } as const,
  detailText: { margin: '4px 0', color: '#555' } as const,
  addButton: { padding: '8px 16px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' } as const,
  addButtonDisabled: { padding: '8px 16px', backgroundColor: '#ccc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'not-allowed' } as const,
  cardDefault: { border: '2px solid #333', borderRadius: '8px', padding: '16px' } as const,
  card: { border: '1px solid #ddd', borderRadius: '8px', padding: '16px' } as const,
  labelText: { fontWeight: 'bold' } as const,
  setDefaultBtn: { padding: '4px 8px', fontSize: '13px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer' } as const,
  setDefaultBtnDisabled: { padding: '4px 8px', fontSize: '13px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fff', cursor: 'not-allowed' } as const,
  deleteBtn: { padding: '4px 8px', fontSize: '13px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer', color: 'red' } as const,
};

interface AddressListProps {
  addresses: Address[];
  onAddClick: () => void;
  onEditClick: (address: Address) => void;
  onChanged: () => void;
}

export function AddressList({ addresses, onAddClick, onEditClick, onChanged }: AddressListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const isAtLimit = addresses.length >= MAX_ADDRESSES;

  async function handleDelete(addressId: string) {
    setError('');
    setDeletingId(addressId);
    try {
      await deleteAddress(addressId);
      setConfirmDeleteId(null);
      onChanged();
    } catch (err) {
      if (isApiError(err)) {
        setError(ERROR_MESSAGES[err.code] ?? err.message ?? '배송지 삭제에 실패했습니다.');
      } else {
        setError('배송지 삭제에 실패했습니다.');
      }
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSetDefault(addressId: string) {
    setError('');
    setSettingDefaultId(addressId);
    try {
      await updateAddress(addressId, { isDefault: true });
      onChanged();
    } catch (err) {
      if (isApiError(err)) {
        setError(err.message ?? '기본 배송지 변경에 실패했습니다.');
      } else {
        setError('기본 배송지 변경에 실패했습니다.');
      }
    } finally {
      setSettingDefaultId(null);
    }
  }

  return (
    <div>
      <div style={styles.header}>
        <p style={styles.count}>{addresses.length}개 / 최대 {MAX_ADDRESSES}개</p>
        <button onClick={onAddClick} disabled={isAtLimit}
          style={isAtLimit ? styles.addButtonDisabled : styles.addButton}>
          배송지 추가
        </button>
      </div>

      {isAtLimit && <p style={styles.limitWarning}>배송지는 최대 {MAX_ADDRESSES}개까지 등록 가능합니다.</p>}
      {error && <p role="alert" style={styles.error}>{error}</p>}

      <div style={styles.list}>
        {addresses.map((address) => (
          <div key={address.id}
            style={address.isDefault ? styles.cardDefault : styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.labelRow}>
                <span style={styles.labelText}>{address.label}</span>
                {address.isDefault && <span style={styles.badge}>기본</span>}
              </div>
              <div style={styles.actionRow}>
                {!address.isDefault && (
                  <button onClick={() => handleSetDefault(address.id)} disabled={settingDefaultId === address.id}
                    aria-label={`${address.label} 기본 배송지로 설정`}
                    style={settingDefaultId === address.id ? styles.setDefaultBtnDisabled : styles.setDefaultBtn}>
                    {settingDefaultId === address.id ? '설정 중...' : '기본으로 설정'}
                  </button>
                )}
                <button onClick={() => onEditClick(address)} aria-label={`${address.label} 수정`} style={styles.smallBtn}>수정</button>
                <button onClick={() => setConfirmDeleteId(address.id)} aria-label={`${address.label} 삭제`} style={styles.deleteBtn}>삭제</button>
              </div>
            </div>
            <p style={styles.detailText}>{address.recipientName} / {maskPhone(address.phone)}</p>
            <p style={styles.detailText}>({address.zipCode}) {address.address1}{address.address2 ? ` ${address.address2}` : ''}</p>

            {confirmDeleteId === address.id && (
              <DeleteConfirmation isDeleting={deletingId === address.id} onConfirm={() => handleDelete(address.id)} onCancel={() => setConfirmDeleteId(null)} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
