import { apiClient } from '@/shared/config/api';
import { createUserApi } from '@repo/api-client';
import type {
  CreateAddressRequest,
  CreateAddressResponse,
  UpdateAddressRequest,
} from '@repo/types';
import { getMyAddresses, mockAddressState } from '@/entities/user';

const userApi = createUserApi(apiClient);

export { getMyAddresses };

export async function createAddress(
  data: CreateAddressRequest,
): Promise<CreateAddressResponse> {
  try {
    return await userApi.createAddress(data);
  } catch {
    const id = `addr-${mockAddressState.idCounter++}`;
    const newAddr = { id, ...data, address2: data.address2 ?? null };
    if (newAddr.isDefault) {
      mockAddressState.addresses = mockAddressState.addresses.map((a) => ({ ...a, isDefault: false }));
    }
    mockAddressState.addresses.push(newAddr);
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
      mockAddressState.addresses = mockAddressState.addresses.map((a) => ({ ...a, isDefault: a.id === addressId }));
    } else {
      mockAddressState.addresses = mockAddressState.addresses.map((a) =>
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
    mockAddressState.addresses = mockAddressState.addresses.filter((a) => a.id !== addressId);
  }
}
