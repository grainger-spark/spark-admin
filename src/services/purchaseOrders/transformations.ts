import { PurchaseOrderResponse, PurchaseOrderAddRequest, PurchaseOrderUpdateRequest } from './types';

export const transformPurchaseOrderResponse = (response: any): PurchaseOrderResponse => {
  return {
    id: response.id || '',
    number: response.number || null,
    status: response.status || null,
    type: response.type || null,
    createdAt: response.createdAt || new Date().toISOString(),
    completedAt: response.completedAt || null,
    dueAt: response.dueAt || null,
    supplier: response.supplier || null,
    destinationWarehouse: response.destinationWarehouse || null,
    totalAmount: response.totalAmount || 0,
    totalReturnAmount: response.totalReturnAmount || 0,
    note: response.note || null,
    internalNote: response.internalNote || null,
    deliveryNote: response.deliveryNote || null,
    supplierInvoiceNumber: response.supplierInvoiceNumber || null,
    items: response.items || [],
    isApproved: response.isApproved || false,
    isIssued: response.isIssued || false,
    isReceived: response.isReceived || false,
    isReconciled: response.isReconciled || false,
    isPriceCalculation: response.isPriceCalculation || false,
    hasMissingQuantity: response.hasMissingQuantity || false,
    canCreateDeliveryReceipt: response.canCreateDeliveryReceipt || false,
    userRequested: response.userRequested || null,
    userApproved: response.userApproved || null,
    relatedPurchaseOrderId: response.relatedPurchaseOrderId || null,
    sourceSalesOrderId: response.sourceSalesOrderId || null,
    sourceSalesOrderNumber: response.sourceSalesOrderNumber || null,
  };
};

export const transformPurchaseOrderForCreate = (order: Partial<PurchaseOrderAddRequest>): PurchaseOrderAddRequest => {
  return {
    number: order.number || null,
    status: order.status || 'Draft',
    type: order.type || 'Standard',
    dueAt: order.dueAt || null,
    supplierId: order.supplierId || null,
    destinationWarehouseId: order.destinationWarehouseId || null,
    note: order.note || null,
    internalNote: order.internalNote || null,
    deliveryNote: order.deliveryNote || null,
    supplierInvoiceNumber: order.supplierInvoiceNumber || null,
    items: order.items || [],
  };
};

export const transformPurchaseOrderForUpdate = (order: Partial<PurchaseOrderUpdateRequest>): PurchaseOrderUpdateRequest => {
  return {
    id: order.id || '',
    number: order.number || null,
    status: order.status || 'Draft',
    type: order.type || 'Standard',
    dueAt: order.dueAt || null,
    supplierId: order.supplierId || null,
    destinationWarehouseId: order.destinationWarehouseId || null,
    note: order.note || null,
    internalNote: order.internalNote || null,
    deliveryNote: order.deliveryNote || null,
    supplierInvoiceNumber: order.supplierInvoiceNumber || null,
    items: order.items || [],
  };
};

export const formatPOCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatPODate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
