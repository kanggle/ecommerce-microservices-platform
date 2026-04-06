'use client';

import type { ProductVariant } from '@repo/types';
import { useVariantManagement } from '../hooks/use-variant-management';

interface Props {
  productId: string;
  variants: ProductVariant[];
  onChanged: () => void;
}

interface EditingState {
  variantId: string;
  optionName: string;
  additionalPrice: number;
}

interface AddingState {
  optionName: string;
  stock: number;
  additionalPrice: number;
}

function VariantViewRow({
  variant, showDelete, isMutating, onEdit, onDelete,
}: {
  variant: ProductVariant;
  showDelete: boolean;
  isMutating: boolean;
  onEdit: (state: EditingState) => void;
  onDelete: (variantId: string) => void;
}) {
  return (
    <>
      <td style={{ padding: '10px 16px', fontSize: '0.875rem' }}>{variant.optionName}</td>
      <td style={{ padding: '10px 16px', fontSize: '0.875rem' }}>
        {variant.additionalPrice > 0 ? `+${variant.additionalPrice.toLocaleString()}원` : '-'}
      </td>
      <td style={{ padding: '10px 16px', fontSize: '0.875rem' }}>{variant.stock}</td>
      <td style={{ padding: '10px 16px', textAlign: 'right' }}>
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => onEdit({ variantId: variant.id, optionName: variant.optionName, additionalPrice: variant.additionalPrice })}
            style={{ padding: '5px 12px', fontSize: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#fff', cursor: 'pointer' }}>
            수정
          </button>
          {showDelete && (
            <button
              onClick={() => onDelete(variant.id)}
              disabled={isMutating}
              style={{ padding: '5px 12px', fontSize: '0.75rem', border: '1px solid #ccc', borderRadius: '6px', backgroundColor: '#fff', color: '#333', cursor: 'pointer' }}>
              삭제
            </button>
          )}
        </div>
      </td>
    </>
  );
}

function VariantEditRow({
  editing, variant, isMutating, onEditChange, onSave, onCancel,
}: {
  editing: EditingState;
  variant: ProductVariant;
  isMutating: boolean;
  onEditChange: (state: EditingState) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      <td style={{ padding: '8px 16px' }}>
        <input
          value={editing.optionName}
          onChange={(e) => onEditChange({ ...editing, optionName: e.target.value })}
          style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem', width: '100%', boxSizing: 'border-box' as const }}
        />
      </td>
      <td style={{ padding: '8px 16px' }}>
        <input
          type="number"
          value={editing.additionalPrice}
          onChange={(e) => onEditChange({ ...editing, additionalPrice: Number(e.target.value) })}
          min={0}
          style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem', width: '100px' }}
        />
      </td>
      <td style={{ padding: '8px 16px', fontSize: '0.875rem', color: '#6b7280' }}>{variant.stock}</td>
      <td style={{ padding: '8px 16px', textAlign: 'right' }}>
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          <button onClick={onSave} disabled={isMutating}
            style={{ padding: '5px 12px', fontSize: '0.75rem', border: 'none', borderRadius: '6px', backgroundColor: '#1A1A2E', color: '#fff', cursor: 'pointer', fontWeight: 500 }}>
            저장
          </button>
          <button onClick={onCancel}
            style={{ padding: '5px 12px', fontSize: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#fff', cursor: 'pointer' }}>
            취소
          </button>
        </div>
      </td>
    </>
  );
}

function VariantAddRow({
  adding, isMutating, onAddChange, onAdd, onCancel,
}: {
  adding: AddingState;
  isMutating: boolean;
  onAddChange: (state: AddingState) => void;
  onAdd: () => void;
  onCancel: () => void;
}) {
  return (
    <tr style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: '#fafafa' }}>
      <td style={{ padding: '8px 16px' }}>
        <input
          value={adding.optionName}
          onChange={(e) => onAddChange({ ...adding, optionName: e.target.value })}
          placeholder="옵션명"
          style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem', width: '100%', boxSizing: 'border-box' as const }}
        />
      </td>
      <td style={{ padding: '8px 16px' }}>
        <input
          type="number"
          value={adding.additionalPrice}
          onChange={(e) => onAddChange({ ...adding, additionalPrice: Number(e.target.value) })}
          min={0}
          style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem', width: '100px' }}
        />
      </td>
      <td style={{ padding: '8px 16px' }}>
        <input
          type="number"
          value={adding.stock}
          onChange={(e) => onAddChange({ ...adding, stock: Number(e.target.value) })}
          min={0}
          style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem', width: '80px' }}
        />
      </td>
      <td style={{ padding: '8px 16px', textAlign: 'right' }}>
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          <button onClick={onAdd} disabled={isMutating || !adding.optionName.trim()}
            style={{ padding: '5px 12px', fontSize: '0.75rem', border: 'none', borderRadius: '6px', backgroundColor: '#1A1A2E', color: '#fff', cursor: 'pointer', fontWeight: 500 }}>
            추가
          </button>
          <button onClick={onCancel}
            style={{ padding: '5px 12px', fontSize: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#fff', cursor: 'pointer' }}>
            취소
          </button>
        </div>
      </td>
    </tr>
  );
}

export function VariantManagement({ productId, variants, onChanged }: Props) {
  const {
    editing,
    setEditing,
    adding,
    setAdding,
    error,
    isMutating,
    handleUpdate,
    handleDelete,
    handleAdd,
  } = useVariantManagement(productId, onChanged);

  return (
    <div>
      {error && (
        <div style={{ color: '#333', backgroundColor: '#f5f5f5', border: '1px solid #ddd', borderRadius: '8px', padding: '8px 12px', marginBottom: '12px', fontSize: '0.8125rem' }}>
          {error}
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f9fafb' }}>
            <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.8125rem', color: '#6b7280', fontWeight: 600 }}>옵션명</th>
            <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.8125rem', color: '#6b7280', fontWeight: 600 }}>추가 가격</th>
            <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.8125rem', color: '#6b7280', fontWeight: 600 }}>재고</th>
            <th style={{ padding: '10px 16px', textAlign: 'right', fontSize: '0.8125rem', color: '#6b7280', fontWeight: 600 }}>작업</th>
          </tr>
        </thead>
        <tbody>
          {variants.map((v) => (
            <tr key={v.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
              {editing?.variantId === v.id ? (
                <VariantEditRow
                  editing={editing}
                  variant={v}
                  isMutating={isMutating}
                  onEditChange={setEditing}
                  onSave={handleUpdate}
                  onCancel={() => setEditing(null)}
                />
              ) : (
                <VariantViewRow
                  variant={v}
                  showDelete={variants.length > 1}
                  isMutating={isMutating}
                  onEdit={setEditing}
                  onDelete={handleDelete}
                />
              )}
            </tr>
          ))}

          {adding && (
            <VariantAddRow
              adding={adding}
              isMutating={isMutating}
              onAddChange={setAdding}
              onAdd={handleAdd}
              onCancel={() => setAdding(null)}
            />
          )}
        </tbody>
      </table>

      {!adding && (
        <button
          onClick={() => setAdding({ optionName: '', stock: 0, additionalPrice: 0 })}
          style={{
            marginTop: '12px',
            padding: '8px 16px',
            fontSize: '0.8125rem',
            border: '1px dashed #d1d5db',
            borderRadius: '8px',
            backgroundColor: '#fff',
            cursor: 'pointer',
            color: '#6b7280',
            width: '100%',
          }}
        >
          + 옵션 추가
        </button>
      )}
    </div>
  );
}
