'use client';

import { useRouter } from 'next/navigation';
import type { PromotionDetail } from '@repo/types';
import { usePromotionForm } from '../hooks/use-promotion-form';
import { Section } from '@/shared/ui';

interface Props {
  promotion?: PromotionDetail;
}

const styles = {
  error: { color: 'red', marginBottom: '16px' } as const,
  fieldGrid: { display: 'grid', gap: '12px', maxWidth: '480px' } as const,
  label: { display: 'block', marginBottom: '4px', fontWeight: 500 } as const,
  input: { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' } as const,
  textarea: { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', resize: 'vertical' } as const,
  buttonRow: { display: 'flex', gap: '8px' } as const,
  cancelBtn: { padding: '10px 24px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#fff', cursor: 'pointer' } as const,
  submitBtn: { padding: '10px 24px', borderRadius: '6px', border: 'none', backgroundColor: '#1A1A2E', color: '#fff', cursor: 'pointer', opacity: 1, fontWeight: 600 } as const,
  submitBtnDisabled: { padding: '10px 24px', borderRadius: '6px', border: 'none', backgroundColor: '#1A1A2E', color: '#fff', cursor: 'not-allowed', opacity: 0.5, fontWeight: 600 } as const,
  dateRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' } as const,
};

export function PromotionForm({ promotion }: Props) {
  const router = useRouter();
  const {
    name, setName,
    description, setDescription,
    discountType, setDiscountType,
    discountValue, setDiscountValue,
    maxDiscountAmount, setMaxDiscountAmount,
    maxIssuanceCount, setMaxIssuanceCount,
    startDate, setStartDate,
    endDate, setEndDate,
    error,
    isSubmitting,
    isEdit,
    isValid,
    handleSubmit,
  } = usePromotionForm(promotion);

  return (
    <form onSubmit={handleSubmit}>
      {error && <p role="alert" style={styles.error}>{error}</p>}

      <Section title="기본 정보">
        <div style={styles.fieldGrid}>
          <div>
            <label htmlFor="name" style={styles.label}>프로모션명 *</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required style={styles.input} />
          </div>
          <div>
            <label htmlFor="description" style={styles.label}>설명</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={styles.textarea} />
          </div>
        </div>
      </Section>

      <Section title="할인 설정">
        <div style={styles.fieldGrid}>
          <div>
            <label htmlFor="discountType" style={styles.label}>할인 유형 *</label>
            <select id="discountType" value={discountType} onChange={(e) => setDiscountType(e.target.value as 'FIXED' | 'PERCENTAGE')} style={styles.input}>
              <option value="FIXED">정액</option>
              <option value="PERCENTAGE">정률 (%)</option>
            </select>
          </div>
          <div>
            <label htmlFor="discountValue" style={styles.label}>할인값 *</label>
            <input id="discountValue" type="number" value={discountValue} onChange={(e) => setDiscountValue(Number(e.target.value))} min={0} required style={styles.input} />
          </div>
          <div>
            <label htmlFor="maxDiscountAmount" style={styles.label}>최대 할인금액</label>
            <input id="maxDiscountAmount" type="number" value={maxDiscountAmount} onChange={(e) => setMaxDiscountAmount(Number(e.target.value))} min={0} style={styles.input} />
          </div>
          <div>
            <label htmlFor="maxIssuanceCount" style={styles.label}>최대 발급 수량 *</label>
            <input id="maxIssuanceCount" type="number" value={maxIssuanceCount} onChange={(e) => setMaxIssuanceCount(Number(e.target.value))} min={1} required style={styles.input} />
          </div>
        </div>
      </Section>

      <Section title="기간 설정">
        <div style={styles.fieldGrid}>
          <div style={styles.dateRow}>
            <div>
              <label htmlFor="startDate" style={styles.label}>시작일 *</label>
              <input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required style={styles.input} />
            </div>
            <div>
              <label htmlFor="endDate" style={styles.label}>종료일 *</label>
              <input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required style={styles.input} />
            </div>
          </div>
          {startDate && endDate && startDate >= endDate && (
            <p style={{ color: 'red', fontSize: '0.875rem' }}>종료일은 시작일 이후여야 합니다.</p>
          )}
        </div>
      </Section>

      <div style={styles.buttonRow}>
        <button type="submit" disabled={!isValid || isSubmitting}
          style={isValid ? styles.submitBtn : styles.submitBtnDisabled}>
          {isSubmitting ? '저장 중...' : isEdit ? '수정' : '등록'}
        </button>
        <button type="button" onClick={() => router.back()} style={styles.cancelBtn}>취소</button>
      </div>
    </form>
  );
}
