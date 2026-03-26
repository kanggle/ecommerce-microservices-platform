import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchFilters } from '@/features/search/ui/SearchFilters';
import type { CategoryFacet, PriceRangeFacet } from '@repo/types';

const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams('q=test');

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({
    get: (key: string) => mockSearchParams.get(key),
    toString: () => mockSearchParams.toString(),
  }),
}));

const categories: CategoryFacet[] = [
  { id: 'c1', name: '전자제품', count: 10 },
  { id: 'c2', name: '의류', count: 5 },
];

const priceRanges: PriceRangeFacet[] = [
  { min: 0, max: 10000, count: 20 },
  { min: 10000, max: 50000, count: 15 },
];

describe('SearchFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('카테고리 필터를 표시한다', () => {
    render(<SearchFilters categories={categories} />);

    expect(screen.getByText('전체 카테고리')).toBeInTheDocument();
    expect(screen.getByText('전자제품 (10)')).toBeInTheDocument();
    expect(screen.getByText('의류 (5)')).toBeInTheDocument();
  });

  it('가격 범위 버튼을 표시한다', () => {
    render(<SearchFilters priceRanges={priceRanges} />);

    expect(screen.getByText('0~10,000원 (20)')).toBeInTheDocument();
    expect(screen.getByText('10,000~50,000원 (15)')).toBeInTheDocument();
  });

  it('정렬 옵션을 표시한다', () => {
    render(<SearchFilters />);

    expect(screen.getByText('관련도순')).toBeInTheDocument();
    expect(screen.getByText('낮은 가격순')).toBeInTheDocument();
    expect(screen.getByText('높은 가격순')).toBeInTheDocument();
    expect(screen.getByText('최신순')).toBeInTheDocument();
  });

  it('카테고리 선택 시 URL 파라미터를 업데이트한다', async () => {
    const user = userEvent.setup();
    render(<SearchFilters categories={categories} />);

    const select = screen.getAllByRole('combobox')[0];
    await user.selectOptions(select, 'c1');

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('categoryId=c1'),
    );
  });

  it('가격 범위 클릭 시 minPrice와 maxPrice가 모두 적용된다', async () => {
    const user = userEvent.setup();
    render(<SearchFilters priceRanges={priceRanges} />);

    await user.click(screen.getByText('0~10,000원 (20)'));

    expect(mockPush).toHaveBeenCalledTimes(1);
    const url = mockPush.mock.calls[0][0] as string;
    expect(url).toContain('minPrice=0');
    expect(url).toContain('maxPrice=10000');
  });

  it('카테고리가 없으면 카테고리 드롭다운을 표시하지 않는다', () => {
    render(<SearchFilters categories={[]} />);

    expect(screen.queryByText('전체 카테고리')).not.toBeInTheDocument();
  });

  it('가격 범위가 없으면 가격 버튼을 표시하지 않는다', () => {
    render(<SearchFilters priceRanges={[]} />);

    expect(screen.queryByText(/원 \(/)).not.toBeInTheDocument();
  });
});
