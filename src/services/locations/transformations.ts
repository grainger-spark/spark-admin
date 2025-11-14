import { LocationResponse, LocationAddRequest, LocationUpdateRequest } from './types';

export const transformLocationResponse = (response: any): LocationResponse => {
  return {
    id: response.id || '',
    name: response.name || null,
    code: response.code || null,
    description: response.description || null,
    warehouse: response.warehouse || null,
    type: response.type || null,
    barcode: response.barcode || null,
    isPickable: response.isPickable || false,
    isReceivable: response.isReceivable || false,
    isShippable: response.isShippable || false,
    isActive: response.isActive !== undefined ? response.isActive : true,
    sortOrder: response.sortOrder || null,
    content: response.content || null,
  };
};

export const transformLocationForCreate = (location: Partial<LocationAddRequest>): LocationAddRequest => {
  return {
    name: location.name || null,
    code: location.code || null,
    description: location.description || null,
    warehouseId: location.warehouseId || null,
    type: location.type || null,
    barcode: location.barcode || null,
    isPickable: location.isPickable || false,
    isReceivable: location.isReceivable || false,
    isShippable: location.isShippable || false,
    isActive: location.isActive !== undefined ? location.isActive : true,
    sortOrder: location.sortOrder || null,
    content: location.content || null,
  };
};

export const transformLocationForUpdate = (location: Partial<LocationUpdateRequest>): LocationUpdateRequest => {
  return {
    name: location.name || null,
    code: location.code || null,
    description: location.description || null,
    warehouseId: location.warehouseId || null,
    type: location.type || null,
    barcode: location.barcode || null,
    isPickable: location.isPickable || false,
    isReceivable: location.isReceivable || false,
    isShippable: location.isShippable || false,
    isActive: location.isActive !== undefined ? location.isActive : true,
    sortOrder: location.sortOrder || null,
    content: location.content || null,
  };
};
