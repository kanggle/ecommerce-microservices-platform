export const userKeys = {
  all: ['admin', 'users'] as const,
  list: (params: Record<string, unknown>) => [...userKeys.all, params] as const,
  detail: (userId: string) => [...userKeys.all, userId] as const,
};
