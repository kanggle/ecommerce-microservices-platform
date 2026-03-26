'use client';

import { useEffect } from 'react';

type ToastType = 'success' | 'error';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

const STYLE_MAP: Record<ToastType, { backgroundColor: string; borderColor: string }> = {
  success: { backgroundColor: '#f0fdf4', borderColor: '#22c55e' },
  error: { backgroundColor: '#fef2f2', borderColor: '#ef4444' },
};

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const style = STYLE_MAP[type];

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        padding: '12px 20px',
        borderRadius: '8px',
        border: `1px solid ${style.borderColor}`,
        backgroundColor: style.backgroundColor,
        color: '#333',
        fontSize: '14px',
        zIndex: 9999,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      }}
    >
      {message}
    </div>
  );
}
