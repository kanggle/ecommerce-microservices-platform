'use client';

import type { ProductVariant } from '@repo/types';
import { useVariantManagement } from '../hooks/use-variant-management';

interface Props {
  productId: string;
  variants: ProductVariant[];
  onChanged: () => void;
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
                <>
                  <td style={{ padding: '8px 16px' }}>
                    <input
                      value={editing.optionName}
                      onChange={(e) => setEditing({ ...editing, optionName: e.target.value })}
                      style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem', width: '100%', boxSizing: 'border-box' }}
                    />
                  </td>
                  <td style={{ padding: '8px 16px' }}>
                    <input
                      type="number"
                      value={editing.additionalPrice}
                      onChange={(e) => setEditing({ ...editing, additionalPrice: Number(e.target.value) })}
                      min={0}
                      style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem', width: '100px' }}
                    />
                  </td>
                  <td style={{ padding: '8px 16px', fontSize: '0.875rem', color: '#6b7280' }}>{v.stock}</td>
                  <td style={{ padding: '8px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button onClick={handleUpdate} disabled={isMutating}
                        style={{ padding: '5px 12px', fontSize: '0.75rem', border: 'none', borderRadius: '6px', backgroundColor: '#1A1A2E', color: '#fff', cursor: 'pointer', fontWeight: 500 }}>
                        저장
                      </button>
                      <button onClick={() => setEditing(null)}
                        style={{ padding: '5px 12px', fontSize: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#fff', cursor: 'pointer' }}>
                        취소
                      </button>
                    </div>
                  </td>
                </>
              ) : (
                <>
                  <td style={{ padding: '10px 16px', fontSize: '0.875rem' }}>{v.optionName}</td>
                  <td style={{ padding: '10px 16px', fontSize: '0.875rem' }}>
                    {v.additionalPrice > 0 ? `+${v.additionalPrice.toLocaleString()}원` : '-'}
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: '0.875rem' }}>{v.stock}</td>
                  <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setEditing({ variantId: v.id, optionName: v.optionName, additionalPrice: v.additionalPrice })}
                        style={{ padding: '5px 12px', fontSize: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#fff', cursor: 'pointer' }}>
                        수정
                      </button>
                      {variants.length > 1 && (
                        <button
                          onClick={() => handleDelete(v.id)}
                          disabled={isMutating}
                          style={{ padding: '5px 12px', fontSize: '0.75rem', border: '1px solid #ccc', borderRadius: '6px', backgroundColor: '#fff', color: '#333', cursor: 'pointer' }}>
                          삭제
                        </button>
                      )}
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}

          {adding && (
            <tr style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: '#fafafa' }}>
              <td style={{ padding: '8px 16px' }}>
                <input
                  value={adding.optionName}
                  onChange={(e) => setAdding({ ...adding, optionName: e.target.value })}
                  placeholder="옵션명"
                  style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem', width: '100%', boxSizing: 'border-box' }}
                />
              </td>
              <td style={{ padding: '8px 16px' }}>
                <input
                  type="number"
                  value={adding.additionalPrice}
                  onChange={(e) => setAdding({ ...adding, additionalPrice: Number(e.target.value) })}
                  min={0}
                  style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem', width: '100px' }}
                />
              </td>
              <td style={{ padding: '8px 16px' }}>
                <input
                  type="number"
                  value={adding.stock}
                  onChange={(e) => setAdding({ ...adding, stock: Number(e.target.value) })}
                  min={0}
                  style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem', width: '80px' }}
                />
              </td>
              <td style={{ padding: '8px 16px', textAlign: 'right' }}>
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                  <button onClick={handleAdd} disabled={isMutating || !adding.optionName.trim()}
                    style={{ padding: '5px 12px', fontSize: '0.75rem', border: 'none', borderRadius: '6px', backgroundColor: '#1A1A2E', color: '#fff', cursor: 'pointer', fontWeight: 500 }}>
                    추가
                  </button>
                  <button onClick={() => setAdding(null)}
                    style={{ padding: '5px 12px', fontSize: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#fff', cursor: 'pointer' }}>
                    취소
                  </button>
                </div>
              </td>
            </tr>
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
