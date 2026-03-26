'use client';

interface DeleteConfirmationProps {
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmation({ isDeleting, onConfirm, onCancel }: DeleteConfirmationProps) {
  return (
    <div
      style={{
        marginTop: '12px',
        padding: '12px',
        backgroundColor: '#fef2f2',
        borderRadius: '4px',
      }}
    >
      <p style={{ marginBottom: '8px' }}>
        이 배송지를 삭제하시겠습니까?
      </p>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={onConfirm}
          disabled={isDeleting}
          aria-label="삭제 확인"
          style={{
            padding: '6px 12px',
            backgroundColor: 'red',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: isDeleting ? 'not-allowed' : 'pointer',
          }}
        >
          {isDeleting ? '삭제 중...' : '삭제'}
        </button>
        <button
          onClick={onCancel}
          aria-label="삭제 취소"
          style={{
            padding: '6px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: '#fff',
            cursor: 'pointer',
          }}
        >
          취소
        </button>
      </div>
    </div>
  );
}
