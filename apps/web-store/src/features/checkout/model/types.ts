import type { ShippingAddress } from '@repo/types';

export interface CheckoutCartItem {
  productId: string;
  variantId: string;
  productName: string;
  optionName: string;
  price: number;
  quantity: number;
}

export interface CheckoutFormProps {
  items: CheckoutCartItem[];
  totalAmount: number;
  onOrderComplete: () => void;
}

export interface CheckoutShippingForm {
  shippingAddress: ShippingAddress;
}
