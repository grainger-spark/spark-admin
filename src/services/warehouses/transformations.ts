import { WarehouseResponse, WarehouseAddRequest, WarehouseUpdateRequest } from './types';

export const transformWarehouseResponse = (response: any): WarehouseResponse => {
  return {
    id: response.id || '',
    name: response.name || null,
    code: response.code || null,
    description: response.description || null,
    address: response.address || null,
    type: response.type || null,
    defaultLocation: response.defaultLocation || null,
    supplier: response.supplier || null,
    packagingLocation: response.packagingLocation || null,
    defaultReceivingLocation: response.defaultReceivingLocation || null,
    defaultScrapLocation: response.defaultScrapLocation || null,
    packagingSettings: response.packagingSettings || null,
    content: response.content || null,
    itemType: response.itemType || null,
    isNotAvailableForSale: response.isNotAvailableForSale || false,
  };
};

export const transformWarehouseForCreate = (warehouse: Partial<WarehouseAddRequest>): WarehouseAddRequest => {
  return {
    name: warehouse.name || null,
    code: warehouse.code || null,
    description: warehouse.description || null,
    addressId: warehouse.addressId || null,
    supplierId: warehouse.supplierId || null,
    type: warehouse.type || null,
    content: warehouse.content || null,
    defaultLocationId: warehouse.defaultLocationId || undefined,
    defaultReceivingLocationId: warehouse.defaultReceivingLocationId || null,
    defaultScrapLocationId: warehouse.defaultScrapLocationId || null,
    itemType: warehouse.itemType || null,
    isNotAvailableForSale: warehouse.isNotAvailableForSale || false,
  };
};

export const transformWarehouseForUpdate = (warehouse: Partial<WarehouseUpdateRequest>): WarehouseUpdateRequest => {
  return {
    name: warehouse.name || null,
    code: warehouse.code || null,
    description: warehouse.description || null,
    addressId: warehouse.addressId || null,
    supplierId: warehouse.supplierId || null,
    type: warehouse.type || null,
    content: warehouse.content || null,
    defaultLocationId: warehouse.defaultLocationId || undefined,
    defaultReceivingLocationId: warehouse.defaultReceivingLocationId || null,
    defaultScrapLocationId: warehouse.defaultScrapLocationId || null,
    itemType: warehouse.itemType || null,
    isNotAvailableForSale: warehouse.isNotAvailableForSale || false,
  };
};