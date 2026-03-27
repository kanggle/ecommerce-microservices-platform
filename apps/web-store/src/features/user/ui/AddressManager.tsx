'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Address } from '@repo/types';
import { LoadingSpinner, ErrorMessage, EmptyState } from '@repo/ui';
import { AddressList } from './AddressList';
import { AddressForm } from './AddressForm';
import { getMyAddresses } from '../api/address-api';

type ViewMode = 'list' | 'add' | 'edit';

export function AddressManager() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const loadAddresses = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getMyAddresses();
      setAddresses(data.addresses);
    } catch {
      setError('배송지 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  function handleAddClick() {
    setViewMode('add');
    setEditingAddress(null);
  }

  function handleEditClick(address: Address) {
    setViewMode('edit');
    setEditingAddress(address);
  }

  function handleSaved() {
    setViewMode('list');
    setEditingAddress(null);
    loadAddresses();
  }

  function handleCancel() {
    setViewMode('list');
    setEditingAddress(null);
  }

  return (
    <main style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>배송지 관리</h1>

      {isLoading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} onRetry={loadAddresses} />}

      {!isLoading && !error && (
        <>
          {viewMode !== 'list' && (
            <AddressForm
              address={viewMode === 'edit' ? (editingAddress ?? undefined) : undefined}
              onSaved={handleSaved}
              onCancel={handleCancel}
            />
          )}

          {viewMode === 'list' && addresses.length === 0 && (
            <div>
              <EmptyState message="등록된 배송지가 없습니다." />
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={handleAddClick}
                  style={{
                    padding: '12px 24px',
                    fontSize: '16px',
                    backgroundColor: '#333',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  첫 배송지 추가하기
                </button>
              </div>
            </div>
          )}

          {viewMode === 'list' && addresses.length > 0 && (
            <AddressList
              addresses={addresses}
              onAddClick={handleAddClick}
              onEditClick={handleEditClick}
              onChanged={loadAddresses}
            />
          )}
        </>
      )}
    </main>
  );
}
