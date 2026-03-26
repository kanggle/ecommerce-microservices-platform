import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Address } from '@repo/types';

const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

let mockAuthState = {
  user: { userId: 'user-1', email: 'test@example.com', name: '홍길동' },
  isAuthenticated: true,
  isLoading: false,
  login: vi.fn(),
  signup: vi.fn(),
  logout: vi.fn(),
};

vi.mock('@/features/auth', () => ({
  useAuth: () => mockAuthState,
}));

vi.mock('@/features/user', () => ({
  AddressList: ({
    addresses,
    onAddClick,
  }: {
    addresses: Address[];
    onAddClick: () => void;
  }) => (
    <div data-testid="address-list">
      <span>{addresses.length}개 배송지</span>
      <button onClick={onAddClick}>배송지 추가</button>
    </div>
  ),
  AddressForm: ({
    onSaved,
    onCancel,
    address,
  }: {
    onSaved: () => void;
    onCancel: () => void;
    address?: Address;
  }) => (
    <div data-testid="address-form">
      <span>{address ? '수정 모드' : '추가 모드'}</span>
      <button onClick={onSaved}>저장</button>
      <button onClick={onCancel}>취소</button>
    </div>
  ),
  getMyAddresses: vi.fn(),
}));

import { getMyAddresses } from '@/features/user';
const mockGetMyAddresses = vi.mocked(getMyAddresses);

import AddressesPage from '@/app/(store)/my/addresses/page';

const MOCK_ADDRESSES: Address[] = [
  {
    id: 'addr-1',
    label: '집',
    recipientName: '홍길동',
    phone: '010-1234-5678',
    zipCode: '12345',
    address1: '서울시 강남구',
    address2: null,
    isDefault: true,
  },
];

describe('AddressesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState = {
      user: { userId: 'user-1', email: 'test@example.com', name: '홍길동' },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
    };
  });

  it('배송지 목록을 로드하고 AddressList를 렌더링한다', async () => {
    mockGetMyAddresses.mockResolvedValueOnce({ addresses: MOCK_ADDRESSES });

    render(<AddressesPage />);

    expect(screen.getByText('로딩 중...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('address-list')).toBeInTheDocument();
    });

    expect(screen.getByText('1개 배송지')).toBeInTheDocument();
  });

  it('미인증 사용자는 로그인 페이지로 리다이렉트한다', () => {
    mockAuthState = {
      ...mockAuthState,
      user: null,
      isAuthenticated: false,
    };

    render(<AddressesPage />);

    expect(mockReplace).toHaveBeenCalledWith('/login');
  });

  it('배송지가 없을 때 빈 상태를 표시한다', async () => {
    mockGetMyAddresses.mockResolvedValueOnce({ addresses: [] });

    render(<AddressesPage />);

    await waitFor(() => {
      expect(
        screen.getByText('등록된 배송지가 없습니다.'),
      ).toBeInTheDocument();
    });

    expect(screen.getByText('첫 배송지 추가하기')).toBeInTheDocument();
  });

  it('목록 조회 실패 시 에러 메시지를 표시한다', async () => {
    mockGetMyAddresses.mockRejectedValueOnce({
      code: 'NETWORK_ERROR',
      message: 'Network error',
      timestamp: new Date().toISOString(),
    });

    render(<AddressesPage />);

    await waitFor(() => {
      expect(
        screen.getByText('배송지 목록을 불러오는데 실패했습니다.'),
      ).toBeInTheDocument();
    });
  });

  it('에러 시 재시도 버튼이 표시된다', async () => {
    mockGetMyAddresses.mockRejectedValueOnce({
      code: 'NETWORK_ERROR',
      message: 'error',
      timestamp: new Date().toISOString(),
    });

    render(<AddressesPage />);

    await waitFor(() => {
      expect(screen.getByText('다시 시도')).toBeInTheDocument();
    });
  });

  it('배송지 추가 클릭 시 AddressForm을 렌더링한다', async () => {
    mockGetMyAddresses.mockResolvedValueOnce({ addresses: MOCK_ADDRESSES });

    const user = userEvent.setup();
    render(<AddressesPage />);

    await waitFor(() => {
      expect(screen.getByTestId('address-list')).toBeInTheDocument();
    });

    await user.click(screen.getByText('배송지 추가'));

    expect(screen.getByTestId('address-form')).toBeInTheDocument();
    expect(screen.getByText('추가 모드')).toBeInTheDocument();
  });

  it('폼 취소 시 목록으로 돌아간다', async () => {
    mockGetMyAddresses.mockResolvedValueOnce({ addresses: MOCK_ADDRESSES });

    const user = userEvent.setup();
    render(<AddressesPage />);

    await waitFor(() => {
      expect(screen.getByTestId('address-list')).toBeInTheDocument();
    });

    await user.click(screen.getByText('배송지 추가'));
    expect(screen.getByTestId('address-form')).toBeInTheDocument();

    await user.click(screen.getByText('취소'));

    await waitFor(() => {
      expect(screen.queryByTestId('address-form')).not.toBeInTheDocument();
    });
  });

  it('폼 저장 후 목록을 다시 로드한다', async () => {
    mockGetMyAddresses
      .mockResolvedValueOnce({ addresses: MOCK_ADDRESSES })
      .mockResolvedValueOnce({ addresses: MOCK_ADDRESSES });

    const user = userEvent.setup();
    render(<AddressesPage />);

    await waitFor(() => {
      expect(screen.getByTestId('address-list')).toBeInTheDocument();
    });

    await user.click(screen.getByText('배송지 추가'));
    await user.click(screen.getByText('저장'));

    await waitFor(() => {
      expect(mockGetMyAddresses).toHaveBeenCalledTimes(2);
    });
  });

  it('로딩 중 스피너를 표시한다', () => {
    mockGetMyAddresses.mockImplementation(() => new Promise(() => {}));

    render(<AddressesPage />);

    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });
});
