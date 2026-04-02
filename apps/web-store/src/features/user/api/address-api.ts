import { apiClient } from '@/shared/config/api';
import { createUserApi } from '@repo/api-client';
import type {
  AddressListResponse,
  CreateAddressRequest,
  CreateAddressResponse,
  UpdateAddressRequest,
  Address,
} from '@repo/types';

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

let mockIdCounter = 3;

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

export async function createAddress(
  data: CreateAddressRequest,
): Promise<CreateAddressResponse> {
  try {
    return await userApi.createAddress(data);
  } catch {
    const id = `addr-${mockIdCounter++}`;
    const newAddr: Address = { id, ...data, address2: data.address2 ?? null };
    if (newAddr.isDefault) {
      mockAddresses = mockAddresses.map((a) => ({ ...a, isDefault: false }));
    }
    mockAddresses.push(newAddr);
    return { id };
  }
}

export async function updateAddress(
  addressId: string,
  data: UpdateAddressRequest,
): Promise<{ id: string }> {
  try {
    return await userApi.updateAddress(addressId, data);
  } catch {
    if (data.isDefault) {
      mockAddresses = mockAddresses.map((a) => ({ ...a, isDefault: a.id === addressId }));
    } else {
      mockAddresses = mockAddresses.map((a) =>
        a.id === addressId ? { ...a, ...data, address2: data.address2 !== undefined ? (data.address2 ?? null) : a.address2 } : a,
      );
    }
    return { id: addressId };
  }
}

export async function deleteAddress(addressId: string): Promise<void> {
  try {
    return await userApi.deleteAddress(addressId);
  } catch {
    mockAddresses = mockAddresses.filter((a) => a.id !== addressId);
  }
}
