import { apiClient } from '@/shared/config/api';
import { createOrderApi } from '@repo/api-client';
import type {
  PlaceOrderRequest,
  PlaceOrderResponse,
  OrderSummary,
  OrderDetail,
  OrderItemDetail,
  CancelOrderResponse,
} from '@repo/types';
import type { PaginatedResponse } from '@repo/types';

const orderApi = createOrderApi(apiClient);

interface MockOrder extends OrderSummary {
  items: OrderItemDetail[];
  shippingAddress: { recipient: string; phone: string; zipCode: string; address1: string; address2: string | null };
}

const MOCK_ORDERS: MockOrder[] = [
  {
    orderId: 'mock-order-1',
    status: 'DELIVERED',
    totalPrice: 108000,
    itemCount: 2,
    firstItemName: '클래식 화이트 티셔츠',
    createdAt: '2026-03-25T10:23:00Z',
    items: [
      { productId: 'mock-1', variantId: 'v1-2', productName: '클래식 화이트 티셔츠', optionName: 'M', quantity: 1, unitPrice: 29000 },
      { productId: 'mock-3', variantId: 'v3-2', productName: '캐주얼 후드 집업', optionName: 'M / 네이비', quantity: 1, unitPrice: 79000 },
    ],
    shippingAddress: { recipient: '홍길동', phone: '010-1234-5678', zipCode: '06234', address1: '서울특별시 강남구 테헤란로 427', address2: '위워크 타워 10층' },
  },
  {
    orderId: 'mock-order-2',
    status: 'SHIPPED',
    totalPrice: 79000,
    itemCount: 1,
    firstItemName: '캐주얼 후드 집업',
    createdAt: '2026-03-28T15:10:00Z',
    items: [
      { productId: 'mock-3', variantId: 'v3-1', productName: '캐주얼 후드 집업', optionName: 'S / 네이비', quantity: 1, unitPrice: 79000 },
    ],
    shippingAddress: { recipient: '홍길동', phone: '010-1234-5678', zipCode: '06234', address1: '서울특별시 강남구 테헤란로 427', address2: '위워크 타워 10층' },
  },
  {
    orderId: 'mock-order-3',
    status: 'CONFIRMED',
    totalPrice: 45000,
    itemCount: 1,
    firstItemName: '레더 크로스백',
    createdAt: '2026-04-01T09:00:00Z',
    items: [
      { productId: 'mock-4', variantId: 'v4-1', productName: '레더 크로스백', optionName: '블랙', quantity: 1, unitPrice: 45000 },
    ],
    shippingAddress: { recipient: '홍길동', phone: '010-1234-5678', zipCode: '03925', address1: '서울특별시 마포구 월드컵북로 21', address2: '' },
  },
];

export async function placeOrder(data: PlaceOrderRequest): Promise<PlaceOrderResponse> {
  try {
    return await orderApi.placeOrder(data);
  } catch {
    const orderId = `mock-order-${Date.now()}`;
    MOCK_ORDERS.unshift({
      orderId,
      status: 'CONFIRMED',
      totalPrice: data.items.reduce((sum, i) => sum + i.quantity * 10000, 0),
      itemCount: data.items.reduce((sum, i) => sum + i.quantity, 0),
      firstItemName: '주문 상품',
      createdAt: new Date().toISOString(),
      items: data.items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        productName: '주문 상품',
        optionName: '옵션',
        quantity: i.quantity,
        unitPrice: 10000,
      })),
      shippingAddress: data.shippingAddress,
    });
    return { orderId };
  }
}

export async function getOrders(page = 0, size = 20): Promise<PaginatedResponse<OrderSummary>> {
  try {
    const result = await orderApi.getOrders({ page, size });
    if (result.content.length > 0) return result;
    const content = MOCK_ORDERS.slice(page * size, page * size + size);
    return { content, page, size, totalElements: MOCK_ORDERS.length };
  } catch {
    const content = MOCK_ORDERS.slice(page * size, page * size + size);
    return { content, page, size, totalElements: MOCK_ORDERS.length };
  }
}

export async function getOrder(orderId: string): Promise<OrderDetail> {
  try {
    return await orderApi.getOrder(orderId);
  } catch {
    const mock = MOCK_ORDERS.find((o) => o.orderId === orderId);
    return {
      orderId,
      status: mock?.status ?? 'CONFIRMED',
      items: mock?.items ?? [],
      totalPrice: mock?.totalPrice ?? 0,
      shippingAddress: mock?.shippingAddress ?? { recipient: '', phone: '', zipCode: '', address1: '', address2: '' },
      createdAt: mock?.createdAt ?? new Date().toISOString(),
      updatedAt: mock?.createdAt ?? new Date().toISOString(),
    };
  }
}

export async function cancelOrder(orderId: string): Promise<CancelOrderResponse> {
  try {
    return await orderApi.cancelOrder(orderId);
  } catch {
    const mock = MOCK_ORDERS.find((o) => o.orderId === orderId);
    if (mock) mock.status = 'CANCELLED';
    return { orderId, status: 'CANCELLED' };
  }
}
