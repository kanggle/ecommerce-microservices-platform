// Common
export type { ApiErrorResponse, PaginationParams, PaginatedResponse } from './common';

// Guards
export { isApiErrorResponse, isApiError, getErrorMessage, ERROR_MESSAGES } from './guards';

// Auth
export type {
  SignupRequest,
  SignupResponse,
  LoginRequest,
  TokenResponse,
  RefreshRequest,
  LogoutRequest,
} from './auth';

// Product
export type {
  ProductStatus,
  ProductSummary,
  ProductVariant,
  ProductDetail,
  ProductListParams,
  CreateProductRequest,
  UpdateProductRequest,
  StockAdjustmentRequest,
  StockAdjustmentResponse,
  CreateProductResponse,
} from './product';

// Order
export type {
  OrderStatus,
  ShippingAddress,
  OrderItem,
  OrderItemDetail,
  PlaceOrderRequest,
  PlaceOrderResponse,
  OrderListParams,
  OrderSummary,
  OrderDetail,
  CancelOrderResponse,
} from './order';

// Search
export type {
  SearchSortOrder,
  SearchProductItem,
  CategoryFacet,
  PriceRangeFacet,
  SearchFacets,
  SearchRequest,
  SearchResponse,
} from './search';

// Payment
export type { PaymentStatus, PaymentResponse } from './payment';

// User
export type {
  UserProfile,
  UpdateUserProfileRequest,
  UpdateUserProfileResponse,
  Address,
  AddressListResponse,
  CreateAddressRequest,
  CreateAddressResponse,
  UpdateAddressRequest,
  UserStatus,
  AdminUserSummary,
  AdminUserDetail,
  AdminUserListParams,
} from './user';
