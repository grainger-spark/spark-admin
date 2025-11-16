// Sales Order Workflow Types
// Complete type definitions for the sales order fulfillment flow

// ============================================================================
// ENUMS & STATUS TYPES
// ============================================================================

export enum SalesOrderStatus {
  CREATED = 'created',
  WAITING_BACKORDER = 'waitingbackorder',
  BACKORDER = 'backorder',
  WAITING_APPROVAL = 'waitingApproval',
  PENDING = 'pending',
  PICKING = 'picking',
  PICKED = 'picked',
  PACKING = 'packing',
  PACKED = 'packed',
  READY_FOR_SHIPPING = 'readyForShipping',
  WAITING_PERSONAL_PICKUP = 'waitingPersonalPickup',
  SHIPPED = 'shipped',
  SHIPPING = 'shipping',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
}

export enum PickListStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'inprogress',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
}

export enum ShipListStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'inprogress',
  READY_TO_SHIP = 'readytoship',
  SHIPPED = 'shipped',
  CANCELED = 'canceled',
}

export enum Priority {
  DEFAULT = 'default',
  HIGH = 'high',
}

export enum PartialCompletionType {
  LEAVE_IN_PROGRESS = 'leaveinprogress',
  PARTIAL_COMPLETE = 'partialcomplete',
  WRITEOFF_AND_REDUCE_ORDER = 'writeoffandreduceorder',
  WRITEOFF_AND_BACKORDER_AND_REDUCE_ORDER = 'writeoffandbackorderandreduceorder',
}

// ============================================================================
// ITEM & TRACKING TYPES
// ============================================================================

export interface Item {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  uom: string | null;
  trackingType: 'none' | 'serial' | 'lot' | 'expiry' | null;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string | null;
}

export interface Location {
  id: string;
  name: string;
  code: string | null;
  warehouseId: string;
}

export interface TrackingSerial {
  serial: string;
}

export interface TrackingLot {
  lot: string;
  quantity: number;
}

export interface TrackingExpiry {
  expiry: string;
  quantity: number;
}

// ============================================================================
// SALES ORDER EXTENDED TYPES
// ============================================================================

export interface SalesOrderItemExtended {
  id: string;
  type: 'item' | 'service' | 'adhoc';
  itemId: string;
  itemName: string;
  warehouseId: string;
  quantity: number;
  price: number;
  priceWithTax: number;
  totalAmount: number;
  taxRateId: string | null;
  taxRatePercentage: number;
  discountId: string | null;
  discountPercentage: number;
}

export interface SalesOrderNavigationBar {
  salesOrderItemQuantity: number;
  salesOrderId: string;
  pickedItemQuantity: number;
  pickListIds: string[];
  shippedItemQuantity: number;
  shipListIds: string[];
  billedItemQuantity: number;
  invoiceIds: string[];
}

// ============================================================================
// PICK LIST TYPES
// ============================================================================

export interface PickListItem {
  id: string;
  documentItemId: string;
  item: Item;
  quantityToPick: number;
  quantityCollected: number;
  quantityPicked: number;
  trackingSerial: string[];
  trackingLot: string | null;
  trackingExpiry: string | null;
}

export interface PickList {
  id: string;
  number: string;
  status: PickListStatus;
  priority: Priority;
  salesOrderId: string;
  salesOrderNumber: string | null;
  warehouseId: string;
  warehouse: Warehouse | null;
  pickerId: string | null;
  pickerName: string | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  items: PickListItem[];
}

export interface PickListItemLocation {
  item: Item;
  warehouse: Warehouse;
  location: Location;
  quantity: number;
  pickedQuantity: number;
  trackingSerial: string[];
  trackingLot: string | null;
  trackingExpiry: string | null;
}

export interface PickListCompletionStatus {
  isFullyCollected: boolean;
  pickListPartialCompleteTypes: PartialCompletionType[];
}

export interface PickListListParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  search?: string;
  status?: PickListStatus;
  warehouseId?: string;
  priority?: Priority;
}

export interface PagedPickListsResponse {
  data: PickList[];
  meta: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
    hasPrevious: boolean;
    hasNext: boolean;
  };
}

// ============================================================================
// SHIP LIST / PACKING TYPES
// ============================================================================

export interface ShipListItem {
  id: string;
  documentItemId: string;
  item: Item;
  quantityToShip: number;
  quantityPacked: number;
  quantityShipped: number;
  trackingSerial: string[];
  trackingLot: TrackingLot[];
  trackingExpiry: TrackingExpiry[];
}

export interface ShipListPackageItem {
  id: string;
  shipListPackageId: string;
  shipListItemId: string;
  item: Item;
  quantity: number;
  trackingSerial: string[];
  trackingLot: TrackingLot[];
  trackingExpiry: TrackingExpiry[];
}

export interface ShipListPackage {
  id: string;
  shipListId: string;
  length: number | null;
  width: number | null;
  height: number | null;
  weight: number | null;
  dimensionUomId: string | null;
  weightUomId: string | null;
  shippingMethodId: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  labelUrl: string | null;
  items: ShipListPackageItem[];
}

export interface ShipList {
  id: string;
  number: string;
  status: ShipListStatus;
  priority: Priority;
  salesOrderId: string;
  salesOrderNumber: string | null;
  warehouseId: string;
  warehouse: Warehouse | null;
  shipperId: string | null;
  shipperName: string | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  items: ShipListItem[];
  packages: ShipListPackage[];
}

export interface ShippingRate {
  carrierId: string;
  carrierFriendlyName: string;
  serviceType: string;
  serviceCode: string;
  shippingAmount: {
    amount: number;
    currency: string;
  };
  carrierDeliveryDays: number | null;
  trackable: boolean;
}

export interface PackageRates {
  packageId: string;
  rateEstimates: ShippingRate[];
}

export interface ShipListListParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  search?: string;
  status?: ShipListStatus;
  warehouseId?: string;
  priority?: Priority;
}

export interface PagedShipListsResponse {
  data: ShipList[];
  meta: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
    hasPrevious: boolean;
    hasNext: boolean;
  };
}

// ============================================================================
// PACKAGING POSITION TYPES
// ============================================================================

export interface PackagingPosition {
  locationId: string;
  location: Location;
  salesOrder: {
    id: string;
    number: string;
    customerName: string | null;
  } | null;
  pickList: PickList | null;
}

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface StartPickListRequest {
  pickerId?: string;
}

export interface PickItemRequest {
  itemId: string;
  locationId: string;
  quantity: number;
  trackingSerial?: string[];
  trackingLot?: string;
  trackingExpiry?: string;
}

export interface PartialCompletionRequest {
  partialCompletionType: PartialCompletionType;
}

export interface SetPriorityRequest {
  priority: Priority;
}

export interface StartShipListRequest {
  shipperId?: string;
}

export interface PackItemRequest {
  quantity: number;
  shipListPackageId?: string | null;
  length?: number;
  width?: number;
  height?: number;
  dimensionUomId?: string;
  weightUomId?: string;
  maxWeight?: number;
  trackingSerial?: string[];
  trackingLot?: TrackingLot[];
  trackingExpiry?: TrackingExpiry[];
}

export interface UnpackItemRequest {
  shipListPackageId: string;
  shipListPackageItemId: string;
  quantity: number;
}

export interface UpdatePackageRequest {
  length?: number;
  width?: number;
  height?: number;
  weight?: number;
  dimensionUomId?: string;
  weightUomId?: string;
  shippingMethodId?: string;
}

export interface DeliveryRate {
  packageId: string;
  carrierId: string;
  serviceCode: string;
}

export interface BookShipmentRequest {
  deliveryRates: DeliveryRate[];
}

export interface ChangeStatusRequest {
  status: SalesOrderStatus;
  pickupPositionId?: string;
}

export interface PaymentRequest {
  method: string;
  provider: string;
  amount: number;
  paymentRequestData?: any;
}

export interface GenerateDocumentRequest {
  salesOrderIds: string[];
}
