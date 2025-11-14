export interface LocationResponse {
  id: string;
  name: string | null;
  code: string | null;
  description: string | null;
  warehouse: {
    id: string;
    name: string;
    code: string | null;
  } | null;
  type: string | null;
  barcode: string | null;
  isPickable: boolean;
  isReceivable: boolean;
  isShippable: boolean;
  isActive: boolean;
  sortOrder: number | null;
  content: Record<string, any> | null;
}

export interface LocationAddRequest {
  name?: string | null;
  code?: string | null;
  description?: string | null;
  warehouseId?: string | null;
  type?: string | null;
  barcode?: string | null;
  isPickable?: boolean;
  isReceivable?: boolean;
  isShippable?: boolean;
  isActive?: boolean;
  sortOrder?: number | null;
  content?: Record<string, any> | null;
}

export type LocationUpdateRequest = LocationAddRequest;

export interface LocationPatchRequest {
  name?: string | null;
  code?: string | null;
  description?: string | null;
  warehouseId?: string | null;
  type?: string | null;
  barcode?: string | null;
  isPickable?: boolean;
  isReceivable?: boolean;
  isShippable?: boolean;
  isActive?: boolean;
  sortOrder?: number | null;
  content?: Record<string, any> | null;
}

export interface LocationListParams {
  Page?: number;
  PageSize?: number;
  Search?: string;
  SortBy?: string;
  SortDirection?: string;
  WarehouseId?: string;
  Type?: string;
  IsActive?: boolean;
}

export interface PagedLocationsResponse {
  data: LocationResponse[];
  meta: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
    hasPrevious: boolean;
    hasNext: boolean;
  };
}

export type Location = LocationResponse;
