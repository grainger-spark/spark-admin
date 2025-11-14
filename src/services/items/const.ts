import { ItemAddRequest } from './types';

export const INITIAL_ITEM: Partial<ItemAddRequest> = {
  name: '',
  slug: '',
  description: '',
  sku: '',
  note: '',
  type: 'Standard',
  kind: null,
  cost: 0,
  price: 0,
  depositFeeAmount: 0,
  reorderPoint: 0,
  reorderQuantity: 0,
  taxable: true,
  isPackage: false,
  isECommerceAvailable: false,
  upsell: false,
  isRawMaterial: false,
  isBackorderAllowed: false,
  length: 0,
  width: 0,
  height: 0,
  weight: 0,
  diameter: 0,
  volume: 0,
  packageQuantity: 0,
  orderNumber: 0,
  cartonQuantity: 0,
  procurementWriteOffPercentage: 0,
  procurementExpirationDays: 0,
  upcs: [],
  tags: [],
  imageIds: [],
  itemCategoryIds: [],
  linkedItemIds: [],
  external: [],
  translations: {},
  secondaryInventory: [],
  warehouseSettings: [],
  bundleComponents: [],
};

export const ITEM_TYPES = [
  { value: 'Standard', label: 'Standard' },
  { value: 'Service', label: 'Service' },
  { value: 'Bundle', label: 'Bundle' },
  { value: 'Kit', label: 'Kit' },
  { value: 'Assembly', label: 'Assembly' },
  { value: 'RawMaterial', label: 'Raw Material' },
] as const;

export const ITEM_KINDS = [
  { value: 'Inventory', label: 'Inventory' },
  { value: 'NonInventory', label: 'Non-Inventory' },
  { value: 'Service', label: 'Service' },
  { value: 'Bundle', label: 'Bundle' },
] as const;

export const TRACKING_TYPES = [
  { value: 'None', label: 'None' },
  { value: 'Lot', label: 'Lot' },
  { value: 'Serial', label: 'Serial Number' },
  { value: 'Batch', label: 'Batch' },
] as const;

export const ITEM_COST_METHODS = [
  { value: 'FIFO', label: 'FIFO' },
  { value: 'LIFO', label: 'LIFO' },
  { value: 'Average', label: 'Average Cost' },
  { value: 'Standard', label: 'Standard Cost' },
] as const;

export const ITEMS_DEFAULT_PAGE_SIZE = 20;
export const ITEMS_MAX_PAGE_SIZE = 100;

export const ITEMS_SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'sku', label: 'SKU' },
  { value: 'created_at', label: 'Created Date' },
  { value: 'updated_at', label: 'Updated Date' },
  { value: 'quantity', label: 'Quantity' },
  { value: 'price', label: 'Price' },
  { value: 'cost', label: 'Cost' },
] as const;

export const ITEMS_FILTER_OPTIONS = [
  { value: 'available', label: 'Available Items' },
  { value: 'out_of_stock', label: 'Out of Stock' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'reorder_required', label: 'Reorder Required' },
  { value: 'ecommerce', label: 'E-commerce Available' },
  { value: 'bundles', label: 'Bundles' },
  { value: 'raw_materials', label: 'Raw Materials' },
] as const;
