export interface ItemResponse {
  id: string;
  name: string | null;
  slug: string | null;
  description: string | null;
  warehouseId: string | null;
  orderNumber: number | null;
  totalQuantity: number;
  totalReserved: number;
  totalSold: number;
  totalAvailable: number;
  totalOnHand: number;
  quantity: number;
  reserved: number;
  availableExternal: number;
  sold: number;
  available: number;
  onHand: number;
  reorderPoint: number;
  reorderQuantity: number;
  defaultSupplier: {
    id: string;
    name: string;
  } | null;
  reorder: boolean;
  cost: number;
  price: number;
  priceWithTax: number;
  totalAvailableValue: number;
  depositFeeAmount: number;
  upcs: string[] | null;
  sku: string | null;
  note: string | null;
  type: string | null;
  kind: string | null;
  defaultUom: {
    id: string;
    name: string;
    code: string;
  } | null;
  salesTax: {
    id: string;
    name: string;
    rate: number;
  } | null;
  itemGroup: {
    id: string;
    name: string;
    code: string;
  } | null;
  length: number;
  width: number;
  height: number;
  weight: number;
  diameter: number;
  dimensionUomId: string;
  dimensionUom: {
    id: string;
    name: string;
    code: string;
  } | null;
  weightUomId: string;
  weightUom: {
    id: string;
    name: string;
    code: string;
  } | null;
  volumeUomId: string;
  volumeUom: {
    id: string;
    name: string;
    code: string;
  } | null;
  volume: number;
  trackingType: string | null;
  taxable: boolean;
  mainImage: {
    id: string;
    fileName: string;
    url: string;
  } | null;
  images: {
    id: string;
    fileName: string;
    url: string;
  }[] | null;
  itemBrand: {
    id: string;
    name: string;
  } | null;
  shortDescription: string | null;
  itemCategories: {
    id: string;
    name: string;
  }[] | null;
  content: Record<string, any> | null;
  lowestPriceIn30Days: number;
  isPackage: boolean;
  packageQuantity: number;
  packageUomId: string | null;
  packageUom: {
    id: string;
    name: string;
    code: string;
  } | null;
  isECommerceAvailable: boolean;
  linkedItems: {
    id: string;
    name: string;
  }[] | null;
  tags: string[] | null;
  upsell: boolean;
  itemGroupCode: string | null;
  external: any[] | null;
  discount: {
    id: string;
    name: string;
    percentage: number;
  } | null;
  translations: Record<string, Record<string, string>> | null;
  numberOfLeftovers: number | null;
  billOfMaterialsId: string | null;
  procurementWriteOffPercentage: number | null;
  procurementExpirationDays: number | null;
  preferredLocation: {
    id: string;
    name: string;
  } | null;
  cartonQuantity: number | null;
  isInventoryItem: boolean;
  defaultUomExport: string | null;
  secondaryInventory: any[] | null;
  rawMaterialItem: {
    id: string;
    name: string;
  } | null;
  isRawMaterial: boolean;
  warehouseSettings: any[] | null;
  hasShopifyItem: boolean;
  bundleComponents: any[] | null;
  itemCostMethod: string | null;
  isBackorderAllowed: boolean;
}

export interface ItemAddRequest {
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  cost?: number;
  price?: number;
  depositFeeAmount?: number;
  upcs?: string[] | null;
  sku?: string | null;
  note?: string | null;
  reorderPoint?: number;
  reorderQuantity?: number;
  defaultSupplierId?: string | null;
  type: string;
  kind?: string | null;
  defaultUomId: string;
  itemGroupId?: string | null;
  salesTaxId: string;
  length?: number;
  width?: number;
  height?: number;
  weight?: number;
  diameter?: number;
  dimensionUomId?: string | null;
  weightUomId?: string | null;
  volumeUomId?: string | null;
  volume?: number;
  trackingType?: string | null;
  taxable?: boolean;
  imageIds?: string[] | null;
  mainImageId?: string | null;
  itemBrandId?: string | null;
  shortDescription?: string | null;
  itemCategoryIds?: string[] | null;
  content?: Record<string, any> | null;
  isPackage?: boolean;
  packageQuantity?: number;
  packageUomId?: string | null;
  isECommerceAvailable?: boolean;
  tags?: string[] | null;
  linkedItemIds?: string[] | null;
  orderNumber?: number | null;
  upsell?: boolean;
  external?: any[] | null;
  translations?: Record<string, Record<string, string>> | null;
  procurementWriteOffPercentage?: number | null;
  procurementExpirationDays?: number | null;
  preferredLocationId?: string | null;
  cartonQuantity?: number | null;
  secondaryInventory?: any[] | null;
  rawMaterialItemId?: string | null;
  warehouseSettings?: any[] | null;
  isRawMaterial?: boolean;
  bundleComponents?: any[] | null;
  itemCostMethod?: string | null;
  isBackorderAllowed?: boolean;
  isInventoryItem?: boolean;
}

export type ItemUpdateRequest = ItemAddRequest;

export interface ItemPatchRequest {
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  cost?: number;
  price?: number;
  depositFeeAmount?: number;
  upcs?: string[] | null;
  sku?: string | null;
  note?: string | null;
  reorderPoint?: number;
  reorderQuantity?: number;
  defaultSupplierId?: string | null;
  type?: string;
  kind?: string | null;
  defaultUomId?: string;
  itemGroupId?: string | null;
  salesTaxId?: string;
  length?: number;
  width?: number;
  height?: number;
  weight?: number;
  diameter?: number;
  dimensionUomId?: string | null;
  weightUomId?: string | null;
  volumeUomId?: string | null;
  volume?: number;
  trackingType?: string | null;
  taxable?: boolean;
  imageIds?: string[] | null;
  mainImageId?: string | null;
  itemBrandId?: string | null;
  shortDescription?: string | null;
  itemCategoryIds?: string[] | null;
  content?: Record<string, any> | null;
  isPackage?: boolean;
  packageQuantity?: number;
  packageUomId?: string | null;
  isECommerceAvailable?: boolean;
  tags?: string[] | null;
  linkedItemIds?: string[] | null;
  orderNumber?: number | null;
  upsell?: boolean;
  external?: any[] | null;
  translations?: Record<string, Record<string, string>> | null;
  procurementWriteOffPercentage?: number | null;
  procurementExpirationDays?: number | null;
  preferredLocationId?: string | null;
  cartonQuantity?: number | null;
  secondaryInventory?: any[] | null;
  rawMaterialItemId?: string | null;
  warehouseSettings?: any[] | null;
  isRawMaterial?: boolean;
  bundleComponents?: any[] | null;
  itemCostMethod?: string | null;
  isBackorderAllowed?: boolean;
  isInventoryItem?: boolean;
}

export interface ItemsListParams {
  Page?: number;
  PageSize?: number;
  Search?: string;
  SortBy?: string;
  SortDirection?: string;
  Filter?: string;
  FilterList?: Record<string, string | null>;
  categoryId?: string;
  includeSubcategories?: boolean;
  posSearch?: string;
  upc?: string;
  warehouseId?: string;
  includeLeftoverCount?: boolean;
  onlyAvailable?: boolean;
}

export interface PagedItemsResponse {
  data: ItemResponse[];
  meta: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
    hasPrevious: boolean;
    hasNext: boolean;
  };
}

export type Item = ItemResponse;
