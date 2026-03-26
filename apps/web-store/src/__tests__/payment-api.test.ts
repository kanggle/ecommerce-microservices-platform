import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGetPayment } = vi.hoisted(() => ({
  mockGetPayment: vi.fn(),
}));

vi.mock('@/shared/config/api', () => ({
  apiClient: {},
}));

vi.mock('@repo/api-client', () => ({
  createPaymentApi: vi.fn(() => ({
    getPayment: mockGetPayment,
  })),
}));

import { getPayment } from '@/entities/payment/api/payment-api';

describe('payment-api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPayment', () => {
    it('주문 ID로 결제 정보를 조회한다', async () => {
      const response = {
        paymentId: 'pay-1',
        orderId: 'order-1',
        userId: 'user-1',
        amount: 30000,
        status: 'COMPLETED',
        createdAt: '2026-03-23T10:00:00Z',
        paidAt: '2026-03-23T10:01:00Z',
        refundedAt: null,
      };
      mockGetPayment.mockResolvedValueOnce(response);

      const result = await getPayment('order-1');

      expect(mockGetPayment).toHaveBeenCalledWith('order-1');
      expect(result).toEqual(response);
    });

    it('결제 정보가 없으면 에러를 전파한다', async () => {
      const error = { code: 'PAYMENT_NOT_FOUND', message: 'Payment not found' };
      mockGetPayment.mockRejectedValueOnce(error);

      await expect(getPayment('order-1')).rejects.toEqual(error);
    });

    it('권한 없는 접근 시 에러를 전파한다', async () => {
      const error = { code: 'UNAUTHORIZED', message: 'Unauthorized' };
      mockGetPayment.mockRejectedValueOnce(error);

      await expect(getPayment('order-1')).rejects.toEqual(error);
    });
  });
});
