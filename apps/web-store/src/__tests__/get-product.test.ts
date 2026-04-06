import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetProduct = vi.hoisted(() => vi.fn());

vi.mock('@/shared/config/api', () => ({
  apiClient: {},
}));

vi.mock('@repo/api-client', () => ({
  createProductApi: vi.fn(() => ({
    getProduct: mockGetProduct,
  })),
}));

vi.mock('@/entities/product/api/mock-data', () => ({
  MOCK_PRODUCTS: [
    {
      id: 'mock-1',
      name: '목 상품',
      description: '설명',
      status: 'ON_SALE',
      price: 10000,
      categoryId: 'cat-1',
      images: ['img1.jpg'],
      variants: [],
    },
  ],
  fallbackImages: vi.fn((name: string) => [`fallback-${name}-1.jpg`, `fallback-${name}-2.jpg`]),
}));

import { getProduct } from '@/entities/product/api/get-product';

describe('getProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('API에서 상품 상세 정보를 정상적으로 조회한다', async () => {
    const product = {
      id: 'p1',
      name: '테스트 상품',
      description: '설명',
      status: 'ON_SALE',
      price: 29000,
      categoryId: 'cat-1',
      images: ['real-img.jpg'],
      variants: [],
    };
    mockGetProduct.mockResolvedValueOnce(product);

    const result = await getProduct('p1');

    expect(mockGetProduct).toHaveBeenCalledWith('p1');
    expect(result).toEqual(product);
  });

  it('API 응답에 이미지가 없으면 폴백 이미지를 설정한다', async () => {
    const product = {
      id: 'p2',
      name: '이미지없는상품',
      description: '설명',
      status: 'ON_SALE',
      price: 15000,
      categoryId: 'cat-1',
      images: [],
      variants: [],
    };
    mockGetProduct.mockResolvedValueOnce(product);

    const result = await getProduct('p2');

    expect(result).not.toBeNull();
    expect(result!.images).toEqual(['fallback-이미지없는상품-1.jpg', 'fallback-이미지없는상품-2.jpg']);
  });

  it('API 응답이 null이면 null을 반환한다', async () => {
    mockGetProduct.mockResolvedValueOnce(null);

    const result = await getProduct('nonexistent');

    expect(result).toBeNull();
  });

  it('API 에러 시 목 데이터에서 해당 ID의 상품을 찾아 반환한다', async () => {
    mockGetProduct.mockRejectedValueOnce(new Error('Network error'));

    const result = await getProduct('mock-1');

    expect(result).not.toBeNull();
    expect(result!.id).toBe('mock-1');
    expect(result!.name).toBe('목 상품');
  });

  it('API 에러 시 목 데이터에도 없는 ID이면 null을 반환한다', async () => {
    mockGetProduct.mockRejectedValueOnce(new Error('Network error'));

    const result = await getProduct('unknown-id');

    expect(result).toBeNull();
  });
});
