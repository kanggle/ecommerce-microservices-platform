import type { ProductSummary, ProductDetail } from '@repo/types';

function img(label: string, variant: number, size = 600): string {
  const colors = ['e2e8f0/475569', 'dbeafe/1e40af', 'fce7f3/be185d', 'dcfce7/166534', 'fef3c7/92400e', 'ede9fe/5b21b6'];
  const bg = colors[(variant - 1) % colors.length];
  return `https://placehold.co/${size}x${size}/${bg}?text=${encodeURIComponent(label)}+${variant}&font=noto-sans`;
}

export const MOCK_PRODUCTS: ProductDetail[] = [
  {
    id: 'mock-1',
    name: '클래식 화이트 티셔츠',
    description: '편안한 착용감의 100% 순면 클래식 티셔츠입니다. 심플한 디자인으로 다양한 스타일링에 활용할 수 있습니다.',
    status: 'ON_SALE',
    price: 29000,
    categoryId: 'cat-clothing',
    images: [img('T-shirt', 1), img('T-shirt', 2), img('T-shirt', 3)],
    variants: [
      { id: 'v1-1', optionName: 'S', stock: 20, additionalPrice: 0 },
      { id: 'v1-2', optionName: 'M', stock: 30, additionalPrice: 0 },
      { id: 'v1-3', optionName: 'L', stock: 25, additionalPrice: 0 },
      { id: 'v1-4', optionName: 'XL', stock: 15, additionalPrice: 2000 },
    ],
  },
  {
    id: 'mock-2',
    name: '슬림핏 블랙 청바지',
    description: '세련된 슬림핏 디자인의 스트레치 청바지. 편안한 신축성으로 활동성이 뛰어납니다.',
    status: 'ON_SALE',
    price: 59000,
    categoryId: 'cat-clothing',
    images: [img('Jeans', 1), img('Jeans', 2), img('Jeans', 3)],
    variants: [
      { id: 'v2-1', optionName: '28', stock: 10, additionalPrice: 0 },
      { id: 'v2-2', optionName: '30', stock: 18, additionalPrice: 0 },
      { id: 'v2-3', optionName: '32', stock: 22, additionalPrice: 0 },
      { id: 'v2-4', optionName: '34', stock: 8, additionalPrice: 0 },
    ],
  },
  {
    id: 'mock-3',
    name: '캐주얼 후드 집업',
    description: '따뜻하고 포근한 플리스 소재의 후드 집업. 가을/겨울 아우터로 완벽합니다.',
    status: 'ON_SALE',
    price: 79000,
    categoryId: 'cat-clothing',
    images: [img('Hoodie', 1), img('Hoodie', 2), img('Hoodie', 3), img('Hoodie', 4)],
    variants: [
      { id: 'v3-1', optionName: 'S / 네이비', stock: 12, additionalPrice: 0 },
      { id: 'v3-2', optionName: 'M / 네이비', stock: 20, additionalPrice: 0 },
      { id: 'v3-3', optionName: 'L / 네이비', stock: 16, additionalPrice: 0 },
      { id: 'v3-4', optionName: 'S / 그레이', stock: 10, additionalPrice: 0 },
      { id: 'v3-5', optionName: 'M / 그레이', stock: 18, additionalPrice: 0 },
    ],
  },
  {
    id: 'mock-4',
    name: '레더 크로스백',
    description: '고급 PU 가죽 소재의 미니 크로스백. 데일리 필수품을 깔끔하게 수납할 수 있습니다.',
    status: 'ON_SALE',
    price: 45000,
    categoryId: 'cat-bags',
    images: [img('Bag', 1), img('Bag', 2)],
    variants: [
      { id: 'v4-1', optionName: '블랙', stock: 25, additionalPrice: 0 },
      { id: 'v4-2', optionName: '브라운', stock: 20, additionalPrice: 0 },
      { id: 'v4-3', optionName: '베이지', stock: 15, additionalPrice: 0 },
    ],
  },
  {
    id: 'mock-5',
    name: '러닝 스니커즈',
    description: '경량 쿠셔닝 기술이 적용된 고성능 러닝화. 장거리 러닝에도 발이 편안합니다.',
    status: 'ON_SALE',
    price: 89000,
    categoryId: 'cat-shoes',
    images: [img('Sneakers', 1), img('Sneakers', 2), img('Sneakers', 3)],
    variants: [
      { id: 'v5-1', optionName: '250 / 화이트', stock: 8, additionalPrice: 0 },
      { id: 'v5-2', optionName: '255 / 화이트', stock: 12, additionalPrice: 0 },
      { id: 'v5-3', optionName: '260 / 화이트', stock: 15, additionalPrice: 0 },
      { id: 'v5-4', optionName: '265 / 화이트', stock: 10, additionalPrice: 0 },
      { id: 'v5-5', optionName: '270 / 블랙', stock: 10, additionalPrice: 0 },
    ],
  },
  {
    id: 'mock-6',
    name: '무선 블루투스 이어폰',
    description: '노이즈 캔슬링 기능이 탑재된 프리미엄 무선 이어폰. 최대 30시간 배터리 지속.',
    status: 'ON_SALE',
    price: 129000,
    categoryId: 'cat-electronics',
    images: [img('Earbuds', 1), img('Earbuds', 2), img('Earbuds', 3)],
    variants: [
      { id: 'v6-1', optionName: '화이트', stock: 30, additionalPrice: 0 },
      { id: 'v6-2', optionName: '블랙', stock: 28, additionalPrice: 0 },
    ],
  },
  {
    id: 'mock-7',
    name: '스마트 워치',
    description: '건강 모니터링, 운동 트래킹, 알림 수신까지. 당신의 라이프스타일을 스마트하게.',
    status: 'ON_SALE',
    price: 199000,
    categoryId: 'cat-electronics',
    images: [img('Watch', 1), img('Watch', 2), img('Watch', 3), img('Watch', 4)],
    variants: [
      { id: 'v7-1', optionName: '40mm / 블랙', stock: 15, additionalPrice: 0 },
      { id: 'v7-2', optionName: '44mm / 블랙', stock: 12, additionalPrice: 20000 },
      { id: 'v7-3', optionName: '40mm / 실버', stock: 10, additionalPrice: 0 },
      { id: 'v7-4', optionName: '44mm / 실버', stock: 8, additionalPrice: 20000 },
    ],
  },
  {
    id: 'mock-8',
    name: '아로마 디퓨저 세트',
    description: '초음파 방식의 아로마 디퓨저와 에센셜 오일 3종 세트. 집 안을 향기롭게.',
    status: 'ON_SALE',
    price: 39000,
    categoryId: 'cat-home',
    images: [img('Diffuser', 1), img('Diffuser', 2)],
    variants: [
      { id: 'v8-1', optionName: '화이트', stock: 40, additionalPrice: 0 },
      { id: 'v8-2', optionName: '우드', stock: 25, additionalPrice: 5000 },
    ],
  },
];

export function fallbackThumbnail(name: string): string {
  return img(name, 1, 400);
}

export function fallbackImages(name: string): string[] {
  return [img(name, 1), img(name, 2), img(name, 3)];
}

export function toSummary(product: ProductDetail): ProductSummary {
  return {
    id: product.id,
    name: product.name,
    status: product.status,
    price: product.price,
    thumbnailUrl: product.images?.[0] ?? fallbackThumbnail(product.name),
    categoryId: product.categoryId,
  };
}
