export interface WarehouseResponse {
  id: string;
  name: string | null;
  code: string | null;
  description: string | null;
  address: AddressResponse | null;
  type: string | null;
  defaultLocation: LocationShortResponse | null;
  supplier: BusinessPartnerResponse | null;
  packagingLocation: LocationShortResponse | null;
  defaultReceivingLocation: LocationShortResponse | null;
  defaultScrapLocation: LocationShortResponse | null;
  packagingSettings: PackagingSettings | null;
  content: Record<string, any> | null;
  itemType: string | null;
  isNotAvailableForSale: boolean;
}

export interface WarehouseAddRequest {
  name?: string | null;
  code?: string | null;
  description?: string | null;
  addressId?: string | null;
  supplierId?: string | null;
  type?: string | null;
  content?: Record<string, any> | null;
  defaultLocationId?: string;
  defaultReceivingLocationId?: string | null;
  defaultScrapLocationId?: string | null;
  itemType?: string | null;
  isNotAvailableForSale?: boolean;
}

export type WarehouseUpdateRequest = WarehouseAddRequest;

export interface WarehousePatchRequest {
  name?: string | null;
  code?: string | null;
  description?: string | null;
  addressId?: string | null;
  supplierId?: string | null;
  type?: string | null;
  content?: Record<string, any> | null;
  defaultLocationId?: string | null;
  defaultReceivingLocationId?: string | null;
  defaultScrapLocationId?: string | null;
  itemType?: string | null;
  isNotAvailableForSale?: boolean;
}

export interface WarehouseListParams {
  Page?: number;
  PageSize?: number;
  Search?: string;
  SortBy?: string;
  SortDirection?: string;
}

export interface PagedWarehousesResponse {
  data: WarehouseResponse[];
  meta: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
    hasPrevious: boolean;
    hasNext: boolean;
  };
}

export type Warehouse = WarehouseResponse;

// Supporting types (simplified versions)
export interface AddressResponse {
  id: string;
  street1?: string | null;
  street2?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
}

export interface LocationShortResponse {
  id: string;
  name: string | null;
  code: string | null;
}

export interface BusinessPartnerResponse {
  id: string;
  name: string;
  code?: string | null;
}

export interface PackagingSettings {
  // Define packaging settings properties as needed
  [key: string]: any;
}