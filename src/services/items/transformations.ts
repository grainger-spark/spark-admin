import { ItemResponse, ItemAddRequest, ItemUpdateRequest } from './types';

export const transformItemResponse = (item: ItemResponse): ItemResponse => {
  return {
    ...item,
    // Format currency values
    cost: Number(item.cost || 0),
    price: Number(item.price || 0),
    priceWithTax: Number(item.priceWithTax || 0),
    totalAvailableValue: Number(item.totalAvailableValue || 0),
    depositFeeAmount: Number(item.depositFeeAmount || 0),
    lowestPriceIn30Days: Number(item.lowestPriceIn30Days || 0),
    
    // Format quantity values
    totalQuantity: Number(item.totalQuantity || 0),
    totalReserved: Number(item.totalReserved || 0),
    totalSold: Number(item.totalSold || 0),
    totalAvailable: Number(item.totalAvailable || 0),
    totalOnHand: Number(item.totalOnHand || 0),
    quantity: Number(item.quantity || 0),
    reserved: Number(item.reserved || 0),
    availableExternal: Number(item.availableExternal || 0),
    sold: Number(item.sold || 0),
    available: Number(item.available || 0),
    onHand: Number(item.onHand || 0),
    reorderPoint: Number(item.reorderPoint || 0),
    reorderQuantity: Number(item.reorderQuantity || 0),
    packageQuantity: Number(item.packageQuantity || 0),
    
    // Format dimensions
    length: Number(item.length || 0),
    width: Number(item.width || 0),
    height: Number(item.height || 0),
    weight: Number(item.weight || 0),
    diameter: Number(item.diameter || 0),
    volume: Number(item.volume || 0),
    
    // Format other numeric values
    orderNumber: Number(item.orderNumber || 0),
    numberOfLeftovers: Number(item.numberOfLeftovers || 0),
    cartonQuantity: Number(item.cartonQuantity || 0),
    procurementWriteOffPercentage: Number(item.procurementWriteOffPercentage || 0),
    procurementExpirationDays: Number(item.procurementExpirationDays || 0),
  };
};

export const transformItemForCreate = (item: Partial<ItemAddRequest>): ItemAddRequest => {
  return {
    type: item.type || 'Standard', // Default type
    defaultUomId: item.defaultUomId || '', // Required field
    salesTaxId: item.salesTaxId || '', // Required field
    ...item,
    // Ensure numeric fields are properly formatted
    cost: item.cost ? Number(item.cost) : 0,
    price: item.price ? Number(item.price) : 0,
    depositFeeAmount: item.depositFeeAmount ? Number(item.depositFeeAmount) : 0,
    reorderPoint: item.reorderPoint ? Number(item.reorderPoint) : 0,
    reorderQuantity: item.reorderQuantity ? Number(item.reorderQuantity) : 0,
    length: item.length ? Number(item.length) : 0,
    width: item.width ? Number(item.width) : 0,
    height: item.height ? Number(item.height) : 0,
    weight: item.weight ? Number(item.weight) : 0,
    diameter: item.diameter ? Number(item.diameter) : 0,
    volume: item.volume ? Number(item.volume) : 0,
    packageQuantity: item.packageQuantity ? Number(item.packageQuantity) : 0,
    orderNumber: item.orderNumber ? Number(item.orderNumber) : 0,
    cartonQuantity: item.cartonQuantity ? Number(item.cartonQuantity) : 0,
    procurementWriteOffPercentage: item.procurementWriteOffPercentage ? Number(item.procurementWriteOffPercentage) : 0,
    procurementExpirationDays: item.procurementExpirationDays ? Number(item.procurementExpirationDays) : 0,
  };
};

export const transformItemForUpdate = (item: Partial<ItemUpdateRequest>): ItemUpdateRequest => {
  return {
    type: item.type || 'Standard',
    defaultUomId: item.defaultUomId || '', // Required field
    salesTaxId: item.salesTaxId || '', // Required field
    ...item,
    // Ensure numeric fields are properly formatted
    cost: item.cost ? Number(item.cost) : 0,
    price: item.price ? Number(item.price) : 0,
    depositFeeAmount: item.depositFeeAmount ? Number(item.depositFeeAmount) : 0,
    reorderPoint: item.reorderPoint ? Number(item.reorderPoint) : 0,
    reorderQuantity: item.reorderQuantity ? Number(item.reorderQuantity) : 0,
    length: item.length ? Number(item.length) : 0,
    width: item.width ? Number(item.width) : 0,
    height: item.height ? Number(item.height) : 0,
    weight: item.weight ? Number(item.weight) : 0,
    diameter: item.diameter ? Number(item.diameter) : 0,
    volume: item.volume ? Number(item.volume) : 0,
    packageQuantity: item.packageQuantity ? Number(item.packageQuantity) : 0,
    orderNumber: item.orderNumber ? Number(item.orderNumber) : 0,
    cartonQuantity: item.cartonQuantity ? Number(item.cartonQuantity) : 0,
    procurementWriteOffPercentage: item.procurementWriteOffPercentage ? Number(item.procurementWriteOffPercentage) : 0,
    procurementExpirationDays: item.procurementExpirationDays ? Number(item.procurementExpirationDays) : 0,
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatQuantity = (quantity: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(quantity);
};
