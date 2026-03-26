import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductImage } from '@/entities/product/ui/ProductImage';

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} data-testid="next-image" />;
  },
}));

describe('ProductImage', () => {
  it('Next.js Image 컴포넌트로 이미지를 렌더링한다', () => {
    render(<ProductImage src="/test.jpg" alt="테스트 이미지" />);

    const img = screen.getByTestId('next-image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/test.jpg');
    expect(img).toHaveAttribute('alt', '테스트 이미지');
  });

  it('이미지 로드 실패 시 fallback 메시지를 표시한다', () => {
    render(<ProductImage src="/broken.jpg" alt="깨진 이미지" />);

    const img = screen.getByTestId('next-image');
    fireEvent.error(img);

    expect(screen.getByText('이미지를 불러올 수 없습니다')).toBeInTheDocument();
    expect(screen.queryByTestId('next-image')).not.toBeInTheDocument();
  });
});
