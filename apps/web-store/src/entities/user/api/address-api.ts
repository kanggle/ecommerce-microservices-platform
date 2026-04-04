import { apiClient } from '@/shared/config/api';
import { createUserApi } from '@repo/api-client';
import type { AddressListResponse, Address } from '@repo/types';

const userApi = createUserApi(apiClient);

let mockAddresses: Address[] = [
  {
    id: 'addr-1',
    label: '집',
    recipientName: '홍길동',
    phone: '010-1234-5678',
    zipCode: '06234',
    address1: '서울특별시 강남구 테헤란로 427',
    address2: '위워크 타워 10층',
    isDefault: true,
  },
  {
    id: 'addr-2',
    label: '회사',
    recipientName: '홍길동',
    phone: '010-1234-5678',
    zipCode: '03925',
    address1: '서울특별시 마포구 월드컵북로 21',
    address2: null,
    isDefault: false,
  },
];

export async function getMyAddresses(): Promise<AddressListResponse> {
  try {
    const data = await userApi.getAddresses();
    data.addresses = data.addresses.map((addr) => {
      const a = addr as unknown as Record<string, unknown>;
      return {
        ...addr,
        isDefault: a.isDefault ?? a.is_default ?? false,
        recipientName: a.recipientName ?? a.recipient_name ?? '',
        zipCode: a.zipCode ?? a.zip_code ?? '',
      } as Address;
    });
    return data;
  } catch {
    return { addresses: [...mockAddresses] };
  }
}
