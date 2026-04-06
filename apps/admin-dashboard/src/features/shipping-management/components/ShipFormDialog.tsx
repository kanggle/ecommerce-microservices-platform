'use client';

import { useState } from 'react';
import { overlayStyle, dialogStyle } from '@/shared/lib/overlay-styles';

interface ShipFormDialogProps {
  open: boolean;
  isPending: boolean;
  onConfirm: (trackingNumber: string, carrier: string) => void;
  onCancel: () => void;
}

export function ShipFormDialog({ open, isPending, onConfirm, onCancel }: ShipFormDialogProps) {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');

  if (!open) return null;

  const isValid = trackingNumber.trim().length > 0 && carrier.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || isPending) return;
    onConfirm(trackingNumber.trim(), carrier.trim());
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="발송 처리"
      style={{ ...overlayStyle, backdropFilter: 'blur(2px)' }}
    >
      <div style={dialogStyle}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '8px', color: '#111827' }}>
          발송 처리
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '0.875rem', lineHeight: '1.5' }}>
          운송장 번호와 택배사를 입력하세요.
        </p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '12px' }}>
            <label
              htmlFor="carrier"
              style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: '#374151', marginBottom: '4px' }}
            >
              택배사
            </label>
            <input
              id="carrier"
              type="text"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              placeholder="예: CJ대한통운"
              style={{
                width: '100%',
                padding: '9px 14px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '0.875rem',
                backgroundColor: '#f9fafb',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="trackingNumber"
              style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: '#374151', marginBottom: '4px' }}
            >
              운송장 번호
            </label>
            <input
              id="trackingNumber"
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="운송장 번호를 입력하세요"
              style={{
                width: '100%',
                padding: '9px 14px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '0.875rem',
                backgroundColor: '#f9fafb',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '9px 20px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                backgroundColor: '#fff',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: '#374151',
                fontWeight: 500,
              }}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!isValid || isPending}
              style={{
                padding: '9px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#1A1A2E',
                color: '#fff',
                cursor: !isValid || isPending ? 'not-allowed' : 'pointer',
                opacity: !isValid || isPending ? 0.5 : 1,
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              {isPending ? '처리 중...' : '발송 처리'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
