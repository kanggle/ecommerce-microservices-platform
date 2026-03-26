import { placeOrder } from '@/entities/order';
import type { PlaceOrderRequest, PlaceOrderResponse } from '@repo/types';

export async function submitOrder(data: PlaceOrderRequest): Promise<PlaceOrderResponse> {
  return placeOrder(data);
}
