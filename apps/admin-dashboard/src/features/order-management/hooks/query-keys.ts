export const orderKeys = {
  all: ['admin', 'orders'] as const,
  list: (params: Record<string, unknown>) => [...orderKeys.all, params] as const,
  detail: (orderId: string) => [...orderKeys.all, orderId] as const,
};
