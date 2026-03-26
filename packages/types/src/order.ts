// Order domain types based on specs/contracts/http/order-api.md

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface ShippingAddress {
  recipient: string;
  phone: string;
  zipCode: string;
  address1: string;
  address2: string;
}

export interface OrderItem {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface OrderItemDetail {
  productId: string;
  variantId: string;
  productName: string;
  optionName: string;
  quantity: number;
  unitPrice: number;
}

export interface PlaceOrderRequest {
  items: OrderItem[];
  shippingAddress: ShippingAddress;
}

export interface PlaceOrderResponse {
  orderId: string;
}

export interface OrderListParams {
  page?: number;
  size?: number;
  status?: OrderStatus;
}

export interface OrderSummary {
  orderId: string;
  status: OrderStatus;
  totalPrice: number;
  itemCount: number;
  createdAt: string;
}

export interface OrderDetail {
  orderId: string;
  status: OrderStatus;
  totalPrice: number;
  items: OrderItemDetail[];
  shippingAddress: ShippingAddress;
  createdAt: string;
  updatedAt: string;
}

export interface CancelOrderResponse {
  orderId: string;
  status: 'CANCELLED';
}
