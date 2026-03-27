export const productKeys = {
  all: ['admin', 'products'] as const,
  list: (params: Record<string, unknown>) => [...productKeys.all, params] as const,
  detail: (productId: string) => [...productKeys.all, productId] as const,
};
