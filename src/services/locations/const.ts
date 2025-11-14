import { LocationAddRequest } from './types';

export const INITIAL_LOCATION: LocationAddRequest = {
  name: null,
  code: null,
  description: null,
  warehouseId: null,
  type: null,
  barcode: null,
  isPickable: true,
  isReceivable: true,
  isShippable: true,
  isActive: true,
  sortOrder: null,
  content: null,
};

export const LOCATION_DEFAULT_PAGE_SIZE = 20;
export const LOCATION_MAX_PAGE_SIZE = 100;

export const LOCATION_TYPES = [
  { value: 'Storage', label: 'Storage' },
  { value: 'Picking', label: 'Picking' },
  { value: 'Receiving', label: 'Receiving' },
  { value: 'Shipping', label: 'Shipping' },
  { value: 'Staging', label: 'Staging' },
  { value: 'Quarantine', label: 'Quarantine' },
  { value: 'Scrap', label: 'Scrap' },
] as const;

export const LOCATION_SORT_OPTIONS = {
  NAME_ASC: 'name_asc',
  NAME_DESC: 'name_desc',
  CODE_ASC: 'code_asc',
  CODE_DESC: 'code_desc',
  WAREHOUSE_ASC: 'warehouse_asc',
  WAREHOUSE_DESC: 'warehouse_desc',
} as const;

export const LOCATION_FILTER_OPTIONS = {
  ALL: 'all',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PICKABLE: 'pickable',
  RECEIVABLE: 'receivable',
  SHIPPABLE: 'shippable',
} as const;
