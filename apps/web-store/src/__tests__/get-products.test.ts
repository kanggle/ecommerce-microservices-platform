import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetProducts = vi.hoisted(() => vi.fn());

vi.mock('@/shared/config/api', () => ({
  apiClient: {},
}));

vi.mock('@repo/api-client', () => ({
  createProductApi: vi.fn(() => ({
    getProducts: mockGetProducts,
  })),
}));

vi.mock('@/entities/product/api/mock-data', () => {
  const products = Array.from({ length: 3 }, (_, i) => ({
    id: `mock-${i + 1}`,
    name: `목 상품 ${i + 1}`,
    description: '설명',
    status: 'ON_SALE',
    price: 10000 * (i + 1),
    categoryId: 'cat-1',
    images: [`img-${i + 1}.jpg`],
    variants: [],
  }));

  return {
    MOCK_PRODUCTS: products,
    fallbackThumbnail: vi.fn((name: string) => `fallback-thumb-${name}.jpg`),
    toSummary: vi.fn((p: { id: string; name: string; status: string; price: number; images: string[]; categoryId: string }) => ({
      id: p.id,
      name: p.name,
      status: p.status,
      price: p.price,
      thumbnailUrl: p.images[0],
      categoryId: p.categoryId,
    })),
  };
});

import { getProducts } from '@/entities/product/api/get-products';

describe('getProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('API에서 상품 목록을 정상적으로 조회한다', async () => {
    const apiResponse = {
      content: [
        { id: 'p1', name: '상품1', status: 'ON_SALE', price: 20000, thumbnailUrl: 'thumb.jpg', categoryId: 'cat-1' },
      ],
      page: 0,
      size: 10,
      totalElements: 1,
    };
    mockGetProducts.mockResolvedValueOnce(apiResponse);

    const result = await getProducts({ page: 0, size: 10 });

    expect(mockGetProducts).toHaveBeenCalledWith({ page: 0, size: 10 });
    expect(result.content).toHaveLength(1);
    expect(result.content[0].thumbnailUrl).toBe('thumb.jpg');
  });

  it('썸네일이 없는 상품에 폴백 썸네일을 적용한다', async () => {
    const apiResponse = {
      content: [
        { id: 'p1', name: '썸네일없는상품', status: 'ON_SALE', price: 15000, thumbnailUrl: '', categoryId: 'cat-1' },
      ],
      page: 0,
      size: 10,
      totalElements: 1,
    };
    mockGetProducts.mockResolvedValueOnce(apiResponse);

    const result = await getProducts();

    expect(result.content[0].thumbnailUrl).toBe('fallback-thumb-썸네일없는상품.jpg');
  });

  it('파라미터 없이 호출하면 기본값으로 API를 호출한다', async () => {
    const apiResponse = { content: [], page: 0, size: 10, totalElements: 0 };
    mockGetProducts.mockResolvedValueOnce(apiResponse);

    await getProducts();

    expect(mockGetProducts).toHaveBeenCalledWith(undefined);
  });

  it('API 에러 시 목 데이터를 페이지네이션하여 반환한다', async () => {
    mockGetProducts.mockRejectedValueOnce(new Error('Server error'));

    const result = await getProducts({ page: 0, size: 2 });

    expect(result.content).toHaveLength(2);
    expect(result.page).toBe(0);
    expect(result.size).toBe(2);
    expect(result.totalElements).toBe(3);
  });

  it('API 에러 시 두 번째 페이지의 나머지 데이터를 반환한다', async () => {
    mockGetProducts.mockRejectedValueOnce(new Error('Server error'));

    const result = await getProducts({ page: 1, size: 2 });

    expect(result.content).toHaveLength(1);
    expect(result.page).toBe(1);
  });

  it('API 에러 시 파라미터 없으면 기본값 page=0, size=10을 사용한다', async () => {
    mockGetProducts.mockRejectedValueOnce(new Error('Server error'));

    const result = await getProducts();

    expect(result.page).toBe(0);
    expect(result.size).toBe(10);
    expect(result.content).toHaveLength(3);
  });
});
