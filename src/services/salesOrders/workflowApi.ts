import { apiRequest } from '../../helpers/api';
import {
  PickList,
  PickListListParams,
  PagedPickListsResponse,
  PickListItemLocation,
  PickListCompletionStatus,
  StartPickListRequest,
  PickItemRequest,
  PartialCompletionRequest,
  SetPriorityRequest,
  ShipList,
  ShipListListParams,
  PagedShipListsResponse,
  PackageRates,
  StartShipListRequest,
  PackItemRequest,
  UnpackItemRequest,
  UpdatePackageRequest,
  BookShipmentRequest,
  PackagingPosition,
  SalesOrderNavigationBar,
  ChangeStatusRequest,
  PaymentRequest,
  GenerateDocumentRequest,
  ShipListPackageItem,
} from './workflowTypes';
import { SalesOrderResponse } from './types';

/**
 * Sales Order Workflow API Service
 * Handles approval, picking, packing, and shipping operations
 */

// ============================================================================
// APPROVAL WORKFLOW
// ============================================================================

export const approvalApi = {
  /**
   * Submit sales order for approval
   */
  submitForApproval: async (
    salesOrderId: string,
    token?: string,
    tenantId?: string
  ): Promise<SalesOrderResponse> => {
    return apiRequest<SalesOrderResponse>(
      `/sales-orders/${salesOrderId}/submission`,
      { method: 'POST', token, tenantId }
    );
  },

  /**
   * Approve sales order
   */
  approveSalesOrder: async (
    salesOrderId: string,
    token?: string,
    tenantId?: string
  ): Promise<SalesOrderResponse> => {
    return apiRequest<SalesOrderResponse>(
      `/sales-orders/${salesOrderId}/approval`,
      { method: 'POST', token, tenantId }
    );
  },
};

// ============================================================================
// STATUS MANAGEMENT
// ============================================================================

export const statusApi = {
  /**
   * Change sales order status
   */
  changeStatus: async (
    salesOrderId: string,
    request: ChangeStatusRequest,
    token?: string,
    tenantId?: string
  ): Promise<SalesOrderResponse> => {
    return apiRequest<SalesOrderResponse>(
      `/sales-orders/${salesOrderId}/status`,
      { method: 'PUT', body: request, token, tenantId }
    );
  },

  /**
   * Get navigation bar (progress tracking)
   */
  getNavigationBar: async (
    salesOrderId: string,
    token?: string,
    tenantId?: string
  ): Promise<SalesOrderNavigationBar> => {
    return apiRequest<SalesOrderNavigationBar>(
      `/sales-orders/${salesOrderId}/navigation-bar`,
      { method: 'GET', token, tenantId }
    );
  },
};

// ============================================================================
// PACKAGING POSITIONS
// ============================================================================

export const packagingApi = {
  /**
   * Move sales order to packaging area (creates pick list)
   */
  moveToPackaging: async (
    salesOrderId: string,
    token?: string,
    tenantId?: string
  ): Promise<PickList> => {
    return apiRequest<PickList>(
      `/packaging/sales-order/${salesOrderId}`,
      { method: 'POST', token, tenantId }
    );
  },

  /**
   * Get packaging positions for a warehouse
   */
  getPackagingPositions: async (
    warehouseId: string,
    token?: string,
    tenantId?: string
  ): Promise<PackagingPosition[]> => {
    return apiRequest<PackagingPosition[]>(
      `/packaging/positions?warehouseId=${warehouseId}`,
      { method: 'GET', token, tenantId }
    );
  },

  /**
   * Get specific packaging position details
   */
  getPackagingPosition: async (
    locationId: string,
    token?: string,
    tenantId?: string
  ): Promise<PackagingPosition> => {
    return apiRequest<PackagingPosition>(
      `/packaging/positions/${locationId}`,
      { method: 'GET', token, tenantId }
    );
  },

  /**
   * Pack next sales order to a position
   */
  packNextSalesOrder: async (
    warehouseId: string,
    token?: string,
    tenantId?: string
  ): Promise<PackagingPosition> => {
    return apiRequest<PackagingPosition>(
      `/packaging/next-sales-order?warehouseId=${warehouseId}`,
      { method: 'POST', token, tenantId }
    );
  },

  /**
   * Pick item at packaging position
   */
  pickItem: async (
    request: PickItemRequest,
    token?: string,
    tenantId?: string
  ): Promise<void> => {
    return apiRequest<void>(
      `/packaging/picking`,
      { method: 'POST', body: request, token, tenantId }
    );
  },

  /**
   * Remove sales order from packaging position
   */
  deletePositionLocation: async (
    locationId: string,
    token?: string,
    tenantId?: string
  ): Promise<void> => {
    return apiRequest<void>(
      `/packaging/positions/${locationId}/document`,
      { method: 'DELETE', token, tenantId }
    );
  },
};

// ============================================================================
// PICK LIST MANAGEMENT
// ============================================================================

export const pickListApi = {
  /**
   * Get all pick lists with pagination
   */
  getPickLists: async (
    params?: PickListListParams,
    token?: string,
    tenantId?: string
  ): Promise<PagedPickListsResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const url = `/pick-lists${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest<PagedPickListsResponse>(url, { method: 'GET', token, tenantId });
  },

  /**
   * Get single pick list by ID
   */
  getPickList: async (
    pickListId: string,
    token?: string,
    tenantId?: string
  ): Promise<PickList> => {
    return apiRequest<PickList>(
      `/pick-lists/${pickListId}`,
      { method: 'GET', token, tenantId }
    );
  },

  /**
   * Start pick list
   */
  startPickList: async (
    pickListId: string,
    request?: StartPickListRequest,
    token?: string,
    tenantId?: string
  ): Promise<PickList> => {
    return apiRequest<PickList>(
      `/pick-lists/${pickListId}/start`,
      { method: 'POST', body: request || {}, token, tenantId }
    );
  },

  /**
   * Get item locations for picking
   */
  getItemLocations: async (
    pickListId: string,
    itemId: string,
    token?: string,
    tenantId?: string
  ): Promise<PickListItemLocation[]> => {
    return apiRequest<PickListItemLocation[]>(
      `/pick-lists/${pickListId}/items/${itemId}/locations`,
      { method: 'GET', token, tenantId }
    );
  },

  /**
   * Pick item (collection)
   */
  pickItem: async (
    pickListId: string,
    itemId: string,
    request: PickItemRequest,
    token?: string,
    tenantId?: string
  ): Promise<void> => {
    return apiRequest<void>(
      `/pick-lists/${pickListId}/items/${itemId}/collection`,
      { method: 'POST', body: request, token, tenantId }
    );
  },

  /**
   * Unpick item (uncollection)
   */
  unpickItem: async (
    pickListId: string,
    itemId: string,
    request: PickItemRequest,
    token?: string,
    tenantId?: string
  ): Promise<void> => {
    return apiRequest<void>(
      `/pick-lists/${pickListId}/items/${itemId}/uncollection`,
      { method: 'POST', body: request, token, tenantId }
    );
  },

  /**
   * Get completion status
   */
  getCompletionStatus: async (
    pickListId: string,
    token?: string,
    tenantId?: string
  ): Promise<PickListCompletionStatus> => {
    return apiRequest<PickListCompletionStatus>(
      `/pick-lists/${pickListId}/completion-status`,
      { method: 'GET', token, tenantId }
    );
  },

  /**
   * Partial completion
   */
  partialComplete: async (
    pickListId: string,
    request: PartialCompletionRequest,
    token?: string,
    tenantId?: string
  ): Promise<PickList> => {
    return apiRequest<PickList>(
      `/pick-lists/${pickListId}/partial-completion`,
      { method: 'POST', body: request, token, tenantId }
    );
  },

  /**
   * Complete pick list
   */
  completePickList: async (
    pickListId: string,
    token?: string,
    tenantId?: string
  ): Promise<PickList> => {
    return apiRequest<PickList>(
      `/pick-lists/${pickListId}/completion`,
      { method: 'POST', token, tenantId }
    );
  },

  /**
   * Set priority
   */
  setPriority: async (
    pickListId: string,
    request: SetPriorityRequest,
    token?: string,
    tenantId?: string
  ): Promise<PickList> => {
    return apiRequest<PickList>(
      `/pick-lists/${pickListId}/prioritization`,
      { method: 'POST', body: request, token, tenantId }
    );
  },
};

// ============================================================================
// SHIP LIST MANAGEMENT (PACKING & SHIPPING)
// ============================================================================

export const shipListApi = {
  /**
   * Get all ship lists with pagination
   */
  getShipLists: async (
    params?: ShipListListParams,
    token?: string,
    tenantId?: string
  ): Promise<PagedShipListsResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const url = `/shipping${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest<PagedShipListsResponse>(url, { method: 'GET', token, tenantId });
  },

  /**
   * Get single ship list by ID
   */
  getShipList: async (
    shipListId: string,
    token?: string,
    tenantId?: string
  ): Promise<ShipList> => {
    return apiRequest<ShipList>(
      `/shipping/${shipListId}`,
      { method: 'GET', token, tenantId }
    );
  },

  /**
   * Start ship list
   */
  startShipList: async (
    shipListId: string,
    request?: StartShipListRequest,
    token?: string,
    tenantId?: string
  ): Promise<ShipList> => {
    return apiRequest<ShipList>(
      `/shipping/${shipListId}/start`,
      { method: 'POST', body: request || {}, token, tenantId }
    );
  },

  /**
   * Pack item into package
   */
  packItem: async (
    shipListId: string,
    itemId: string,
    request: PackItemRequest,
    token?: string,
    tenantId?: string
  ): Promise<ShipListPackageItem> => {
    return apiRequest<ShipListPackageItem>(
      `/shipping/${shipListId}/items/${itemId}/packing`,
      { method: 'POST', body: request, token, tenantId }
    );
  },

  /**
   * Unpack item from package
   */
  unpackItem: async (
    packageId: string,
    request: UnpackItemRequest,
    token?: string,
    tenantId?: string
  ): Promise<void> => {
    return apiRequest<void>(
      `/shipping/package/${packageId}/unpacking`,
      { method: 'POST', body: request, token, tenantId }
    );
  },

  /**
   * Update package details
   */
  updatePackage: async (
    packageId: string,
    request: UpdatePackageRequest,
    token?: string,
    tenantId?: string
  ): Promise<ShipList> => {
    return apiRequest<ShipList>(
      `/shipping/package/${packageId}/update`,
      { method: 'POST', body: request, token, tenantId }
    );
  },

  /**
   * Get shipping rates for package
   */
  getShippingRates: async (
    shipListId: string,
    packageId: string,
    token?: string,
    tenantId?: string
  ): Promise<PackageRates> => {
    return apiRequest<PackageRates>(
      `/shipping/${shipListId}/rates/${packageId}`,
      { method: 'GET', token, tenantId }
    );
  },

  /**
   * Book shipment with selected rates
   */
  bookShipment: async (
    shipListId: string,
    request: BookShipmentRequest,
    token?: string,
    tenantId?: string
  ): Promise<ShipList> => {
    return apiRequest<ShipList>(
      `/shipping/${shipListId}/book-shipment`,
      { method: 'POST', body: request, token, tenantId }
    );
  },

  /**
   * Purchase shipping label
   */
  purchaseShippingLabel: async (
    shipListId: string,
    packageId: string,
    token?: string,
    tenantId?: string
  ): Promise<ShipList> => {
    return apiRequest<ShipList>(
      `/shipping/${shipListId}/shipping-label/${packageId}`,
      { method: 'POST', token, tenantId }
    );
  },

  /**
   * Void shipping label
   */
  voidShippingLabel: async (
    shipListId: string,
    packageId: string,
    token?: string,
    tenantId?: string
  ): Promise<ShipList> => {
    return apiRequest<ShipList>(
      `/shipping/${shipListId}/void-label/${packageId}`,
      { method: 'POST', token, tenantId }
    );
  },

  /**
   * Finish packing
   */
  finishPacking: async (
    shipListId: string,
    token?: string,
    tenantId?: string
  ): Promise<ShipList> => {
    return apiRequest<ShipList>(
      `/shipping/${shipListId}/finishing-packing`,
      { method: 'POST', token, tenantId }
    );
  },

  /**
   * Ship out (mark as shipped)
   */
  shipOut: async (
    shipListId: string,
    token?: string,
    tenantId?: string
  ): Promise<ShipList> => {
    return apiRequest<ShipList>(
      `/shipping/${shipListId}/shipping-out`,
      { method: 'POST', token, tenantId }
    );
  },

  /**
   * Set priority
   */
  setPriority: async (
    shipListId: string,
    request: SetPriorityRequest,
    token?: string,
    tenantId?: string
  ): Promise<ShipList> => {
    return apiRequest<ShipList>(
      `/shipping/${shipListId}/prioritization`,
      { method: 'POST', body: request, token, tenantId }
    );
  },
};

// ============================================================================
// DOCUMENT GENERATION
// ============================================================================

export const documentApi = {
  /**
   * Generate invoice
   */
  generateInvoice: async (
    request: GenerateDocumentRequest,
    token?: string,
    tenantId?: string
  ): Promise<any> => {
    return apiRequest<any>(
      `/sales-orders/invoice`,
      { method: 'POST', body: request, token, tenantId }
    );
  },

  /**
   * Generate delivery note
   */
  generateDeliveryNote: async (
    request: GenerateDocumentRequest,
    token?: string,
    tenantId?: string
  ): Promise<any> => {
    return apiRequest<any>(
      `/sales-orders/delivery-note`,
      { method: 'POST', body: request, token, tenantId }
    );
  },

  /**
   * Generate shipping label
   */
  generateShippingLabel: async (
    salesOrderId: string,
    token?: string,
    tenantId?: string
  ): Promise<SalesOrderResponse> => {
    return apiRequest<SalesOrderResponse>(
      `/sales-orders/${salesOrderId}/shipping`,
      { method: 'POST', token, tenantId }
    );
  },

  /**
   * Mark as paid
   */
  markAsPaid: async (
    salesOrderId: string,
    request: PaymentRequest,
    token?: string,
    tenantId?: string
  ): Promise<any> => {
    return apiRequest<any>(
      `/sales-orders/${salesOrderId}/payment`,
      { method: 'POST', body: request, token, tenantId }
    );
  },
};

// Export all APIs as a single object
export const workflowApi = {
  approval: approvalApi,
  status: statusApi,
  packaging: packagingApi,
  pickList: pickListApi,
  shipList: shipListApi,
  document: documentApi,
};
