import { apiClient } from '@/shared/config/api';
import { createUserApi } from '@repo/api-client';
import type {
  AddressListResponse,
  CreateAddressRequest,
  CreateAddressResponse,
  UpdateAddressRequest,
} from '@repo/types';

const userApi = createUserApi(apiClient);

export async function getMyAddresses(): Promise<AddressListResponse> {
  return userApi.getAddresses();
}

export async function createAddress(
  data: CreateAddressRequest,
): Promise<CreateAddressResponse> {
  return userApi.createAddress(data);
}

export async function updateAddress(
  addressId: string,
  data: UpdateAddressRequest,
): Promise<{ id: string }> {
  return userApi.updateAddress(addressId, data);
}

export async function deleteAddress(addressId: string): Promise<void> {
  return userApi.deleteAddress(addressId);
}
