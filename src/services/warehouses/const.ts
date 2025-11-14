import { WarehouseAddRequest } from './types';

export const INITIAL_WAREHOUSE: WarehouseAddRequest = {
  name: null,
  code: null,
  description: null,
  addressId: null,
  supplierId: null,
  type: null,
  content: null,
  defaultLocationId: undefined,
  defaultReceivingLocationId: null,
  defaultScrapLocationId: null,
  itemType: null,
  isNotAvailableForSale: false,
};

export const WAREHOUSE_DEFAULT_PAGE_SIZE = 20;
export const WAREHOUSE_MAX_PAGE_SIZE = 100;

export const WAREHOUSE_SORT_OPTIONS = {
  NAME_ASC: 'name_asc',
  NAME_DESC: 'name_desc',
  CODE_ASC: 'code_asc',
  CODE_DESC: 'code_desc',
  TYPE_ASC: 'type_asc',
  TYPE_DESC: 'type_desc',
} as const;

export const WAREHOUSE_FILTER_OPTIONS = {
  ALL: 'all',
  AVAILABLE: 'available',
  NOT_AVAILABLE: 'not_available',
} as const;