import { PurchaseOrderAddRequest } from './types';

export const INITIAL_PURCHASE_ORDER: PurchaseOrderAddRequest = {
  number: null,
  status: 'Draft',
  type: 'Standard',
  dueAt: null,
  supplierId: null,
  destinationWarehouseId: null,
  note: null,
  internalNote: null,
  deliveryNote: null,
  supplierInvoiceNumber: null,
  items: [],
};

export const PURCHASE_ORDER_PAGE_SIZE = 20;
export const PURCHASE_ORDER_PAGE_SIZES = [10, 20, 50, 100];

export const PURCHASE_ORDER_STATUSES = [
  { label: 'Draft', value: 'Draft', color: '#999' },
  { label: 'Pending', value: 'Pending', color: '#FF9500' },
  { label: 'Approved', value: 'Approved', color: '#007AFF' },
  { label: 'Issued', value: 'Issued', color: '#5856D6' },
  { label: 'Received', value: 'Received', color: '#34C759' },
  { label: 'Completed', value: 'Completed', color: '#30D158' },
  { label: 'Cancelled', value: 'Cancelled', color: '#FF3B30' },
];

export const PURCHASE_ORDER_TYPES = [
  { label: 'Standard', value: 'Standard' },
  { label: 'Return', value: 'Return' },
  { label: 'Drop Ship', value: 'DropShip' },
];

export const PURCHASE_ORDER_SORT_OPTIONS = [
  { label: 'Number', value: 'number' },
  { label: 'Created Date', value: 'createdAt' },
  { label: 'Due Date', value: 'dueAt' },
  { label: 'Total Amount', value: 'totalAmount' },
  { label: 'Status', value: 'status' },
];

export const PURCHASE_ORDER_FILTER_OPTIONS = {
  statuses: PURCHASE_ORDER_STATUSES,
  types: PURCHASE_ORDER_TYPES,
};
