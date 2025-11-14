import { SalesOrderAddRequest } from './types';

export const INITIAL_SALES_ORDER: SalesOrderAddRequest = {
  orderNumber: null,
  status: 'Draft',
  orderDate: new Date().toISOString(),
  dueDate: null,
  customerId: null,
  warehouseId: null,
  notes: null,
  items: [],
  shippingAddressId: null,
  billingAddressId: null,
};

export const SALES_ORDER_DEFAULT_PAGE_SIZE = 20;
export const SALES_ORDER_MAX_PAGE_SIZE = 100;

export const SALES_ORDER_STATUSES = [
  { value: 'Draft', label: 'Draft', color: '#999' },
  { value: 'Pending', label: 'Pending', color: '#FF9500' },
  { value: 'Confirmed', label: 'Confirmed', color: '#007AFF' },
  { value: 'Processing', label: 'Processing', color: '#5856D6' },
  { value: 'Shipped', label: 'Shipped', color: '#34C759' },
  { value: 'Delivered', label: 'Delivered', color: '#30D158' },
  { value: 'Cancelled', label: 'Cancelled', color: '#FF3B30' },
  { value: 'Returned', label: 'Returned', color: '#FF2D55' },
] as const;

export const SALES_ORDER_SORT_OPTIONS = {
  ORDER_NUMBER_ASC: 'orderNumber_asc',
  ORDER_NUMBER_DESC: 'orderNumber_desc',
  ORDER_DATE_ASC: 'orderDate_asc',
  ORDER_DATE_DESC: 'orderDate_desc',
  TOTAL_ASC: 'total_asc',
  TOTAL_DESC: 'total_desc',
  CUSTOMER_ASC: 'customer_asc',
  CUSTOMER_DESC: 'customer_desc',
} as const;

export const SALES_ORDER_FILTER_OPTIONS = {
  ALL: 'all',
  DRAFT: 'draft',
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;
