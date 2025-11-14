export interface SalesOrderResponse {
  id: string;
  number: string | null;
  status: string | null;
  createdAt: string;
  completedAt: string | null;
  paidAt: string | null;
  customer: {
    id: string;
    name: string;
    email: string | null;
  } | null;
  customerName: string | null;
  customerEmail: string | null;
  store: {
    id: string;
    name: string;
  } | null;
  totalAmountBeforeTax: number;
  taxAmount: number;
  totalAmount: number;
  note: string | null;
  internalNote: string | null;
  items: SalesOrderItem[];
  shippingAddressStreet1: string | null;
  shippingAddressStreet2: string | null;
  shippingAddressCity: string | null;
  shippingAddressState: string | null;
  shippingAddressZip: string | null;
  shippingAddressCountry: string | null;
  billingAddressStreet1: string | null;
  billingAddressStreet2: string | null;
  billingAddressCity: string | null;
  billingAddressState: string | null;
  billingAddressZip: string | null;
  billingAddressCountry: string | null;
}

export interface SalesOrderItem {
  id: string;
  itemId: string;
  itemName: string;
  sku: string | null;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
}

export interface Address {
  street1: string | null;
  street2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
}

export interface SalesOrderAddRequest {
  orderNumber?: string | null;
  status?: string | null;
  orderDate?: string;
  dueDate?: string | null;
  customerId?: string | null;
  warehouseId?: string | null;
  notes?: string | null;
  items?: SalesOrderItemRequest[];
  shippingAddressId?: string | null;
  billingAddressId?: string | null;
}

export interface SalesOrderItemRequest {
  itemId: string;
  quantity: number;
  unitPrice?: number;
  discount?: number;
}

export type SalesOrderUpdateRequest = SalesOrderAddRequest;

export interface SalesOrderPatchRequest {
  orderNumber?: string | null;
  status?: string | null;
  orderDate?: string;
  dueDate?: string | null;
  customerId?: string | null;
  warehouseId?: string | null;
  notes?: string | null;
  items?: SalesOrderItemRequest[];
  shippingAddressId?: string | null;
  billingAddressId?: string | null;
}

export interface SalesOrderListParams {
  Page?: number;
  PageSize?: number;
  Search?: string;
  SortBy?: string;
  SortDirection?: string;
  Status?: string;
  CustomerId?: string;
  WarehouseId?: string;
  StartDate?: string;
  EndDate?: string;
}

export interface PagedSalesOrdersResponse {
  data: SalesOrderResponse[];
  meta: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
    hasPrevious: boolean;
    hasNext: boolean;
  };
}

export type SalesOrder = SalesOrderResponse;
