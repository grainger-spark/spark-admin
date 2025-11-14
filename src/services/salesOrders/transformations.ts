import { SalesOrderResponse, SalesOrderAddRequest, SalesOrderUpdateRequest } from './types';

export const transformSalesOrderResponse = (response: any): SalesOrderResponse => {
  return {
    id: response.id || '',
    number: response.number || null,
    status: response.status || null,
    createdAt: response.createdAt || new Date().toISOString(),
    completedAt: response.completedAt || null,
    paidAt: response.paidAt || null,
    customer: response.customer || null,
    customerName: response.customerName || null,
    customerEmail: response.customerEmail || null,
    store: response.store || null,
    totalAmountBeforeTax: response.totalAmountBeforeTax || 0,
    taxAmount: response.taxAmount || 0,
    totalAmount: response.totalAmount || 0,
    note: response.note || null,
    internalNote: response.internalNote || null,
    items: response.items || [],
    shippingAddressStreet1: response.shippingAddressStreet1 || null,
    shippingAddressStreet2: response.shippingAddressStreet2 || null,
    shippingAddressCity: response.shippingAddressCity || null,
    shippingAddressState: response.shippingAddressState || null,
    shippingAddressZip: response.shippingAddressZip || null,
    shippingAddressCountry: response.shippingAddressCountry || null,
    billingAddressStreet1: response.billingAddressStreet1 || null,
    billingAddressStreet2: response.billingAddressStreet2 || null,
    billingAddressCity: response.billingAddressCity || null,
    billingAddressState: response.billingAddressState || null,
    billingAddressZip: response.billingAddressZip || null,
    billingAddressCountry: response.billingAddressCountry || null,
  };
};

export const transformSalesOrderForCreate = (order: Partial<SalesOrderAddRequest>): SalesOrderAddRequest => {
  return {
    orderNumber: order.orderNumber || null,
    status: order.status || 'Draft',
    orderDate: order.orderDate || new Date().toISOString(),
    dueDate: order.dueDate || null,
    customerId: order.customerId || null,
    warehouseId: order.warehouseId || null,
    notes: order.notes || null,
    items: order.items || [],
    shippingAddressId: order.shippingAddressId || null,
    billingAddressId: order.billingAddressId || null,
  };
};

export const transformSalesOrderForUpdate = (order: Partial<SalesOrderUpdateRequest>): SalesOrderUpdateRequest => {
  return {
    orderNumber: order.orderNumber || null,
    status: order.status || 'Draft',
    orderDate: order.orderDate || new Date().toISOString(),
    dueDate: order.dueDate || null,
    customerId: order.customerId || null,
    warehouseId: order.warehouseId || null,
    notes: order.notes || null,
    items: order.items || [],
    shippingAddressId: order.shippingAddressId || null,
    billingAddressId: order.billingAddressId || null,
  };
};

export const formatOrderCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatOrderDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
