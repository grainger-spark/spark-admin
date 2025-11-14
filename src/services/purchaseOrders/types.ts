export interface PurchaseOrderResponse {
  id: string;
  number: string | null;
  status: string | null;
  type: string | null;
  createdAt: string;
  completedAt: string | null;
  dueAt: string | null;
  supplier: {
    id: string;
    name: string;
    email: string | null;
  } | null;
  destinationWarehouse: {
    id: string;
    name: string;
    code: string | null;
  } | null;
  totalAmount: number;
  totalReturnAmount: number;
  note: string | null;
  internalNote: string | null;
  deliveryNote: string | null;
  supplierInvoiceNumber: string | null;
  items: PurchaseOrderItem[];
  isApproved: boolean;
  isIssued: boolean;
  isReceived: boolean;
  isReconciled: boolean;
  isPriceCalculation: boolean;
  hasMissingQuantity: boolean;
  canCreateDeliveryReceipt: boolean;
  userRequested: {
    id: string;
    name: string;
  } | null;
  userApproved: {
    id: string;
    name: string;
  } | null;
  relatedPurchaseOrderId: string | null;
  sourceSalesOrderId: string | null;
  sourceSalesOrderNumber: string | null;
}

export interface PurchaseOrderItem {
  id: string;
  itemId: string;
  itemName: string;
  sku: string | null;
  quantity: number;
  receivedQuantity: number;
  unitPrice: number;
  total: number;
}

export interface PurchaseOrderAddRequest {
  number: string | null;
  status: string | null;
  type: string | null;
  dueAt: string | null;
  supplierId: string | null;
  destinationWarehouseId: string | null;
  note: string | null;
  internalNote: string | null;
  deliveryNote: string | null;
  supplierInvoiceNumber: string | null;
  items: PurchaseOrderItemAddRequest[];
}

export interface PurchaseOrderItemAddRequest {
  itemId: string;
  quantity: number;
  unitPrice: number;
}

export interface PurchaseOrderUpdateRequest extends PurchaseOrderAddRequest {
  id: string;
}

export interface PurchaseOrderPatchRequest {
  id?: string;
  number?: string | null;
  status?: string | null;
  type?: string | null;
  dueAt?: string | null;
  supplierId?: string | null;
  destinationWarehouseId?: string | null;
  note?: string | null;
  internalNote?: string | null;
  deliveryNote?: string | null;
  supplierInvoiceNumber?: string | null;
  items?: PurchaseOrderItemAddRequest[];
}

export interface PurchaseOrderListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  type?: string;
  supplierId?: string;
  warehouseId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PagedPurchaseOrdersResponse {
  data: PurchaseOrderResponse[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
