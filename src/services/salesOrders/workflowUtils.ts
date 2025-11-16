import {
  SalesOrderStatus,
  PickListStatus,
  ShipListStatus,
  Priority,
  PartialCompletionType,
} from './workflowTypes';

// ============================================================================
// STATUS CONFIGURATIONS
// ============================================================================

export const SALES_ORDER_STATUS_CONFIG = {
  [SalesOrderStatus.CREATED]: {
    label: 'Created',
    color: '#8E8E93',
    description: 'Order created, no inventory reservations',
  },
  [SalesOrderStatus.WAITING_BACKORDER]: {
    label: 'Waiting Backorder',
    color: '#FF9500',
    description: 'Items out of stock, purchase order will be made',
  },
  [SalesOrderStatus.BACKORDER]: {
    label: 'Backorder',
    color: '#FF9500',
    description: 'Items out of stock, purchase order has been made',
  },
  [SalesOrderStatus.WAITING_APPROVAL]: {
    label: 'Waiting Approval',
    color: '#FF9500',
    description: 'Awaiting approval due to payment method check',
  },
  [SalesOrderStatus.PENDING]: {
    label: 'Pending',
    color: '#007AFF',
    description: 'Acknowledged by warehouse, being prepared for shipment',
  },
  [SalesOrderStatus.PICKING]: {
    label: 'Picking',
    color: '#5856D6',
    description: 'At least one item is being picked',
  },
  [SalesOrderStatus.PICKED]: {
    label: 'Picked',
    color: '#5856D6',
    description: 'All items picked, ready for packing',
  },
  [SalesOrderStatus.PACKING]: {
    label: 'Packing',
    color: '#AF52DE',
    description: 'Order is being packed',
  },
  [SalesOrderStatus.PACKED]: {
    label: 'Packed',
    color: '#AF52DE',
    description: 'All items packed',
  },
  [SalesOrderStatus.READY_FOR_SHIPPING]: {
    label: 'Ready for Shipping',
    color: '#32ADE6',
    description: 'Ready to be shipped',
  },
  [SalesOrderStatus.WAITING_PERSONAL_PICKUP]: {
    label: 'Waiting Personal Pickup',
    color: '#32ADE6',
    description: 'Ready for customer pickup',
  },
  [SalesOrderStatus.SHIPPED]: {
    label: 'Shipped',
    color: '#34C759',
    description: 'Order has been shipped',
  },
  [SalesOrderStatus.SHIPPING]: {
    label: 'Shipping',
    color: '#34C759',
    description: 'Some items have been shipped (partial)',
  },
  [SalesOrderStatus.COMPLETED]: {
    label: 'Completed',
    color: '#30D158',
    description: 'Order completed',
  },
  [SalesOrderStatus.CANCELED]: {
    label: 'Canceled',
    color: '#FF3B30',
    description: 'Order canceled',
  },
};

export const PICK_LIST_STATUS_CONFIG = {
  [PickListStatus.PENDING]: {
    label: 'Pending',
    color: '#8E8E93',
    icon: 'clock',
  },
  [PickListStatus.IN_PROGRESS]: {
    label: 'In Progress',
    color: '#007AFF',
    icon: 'play-circle',
  },
  [PickListStatus.COMPLETED]: {
    label: 'Completed',
    color: '#34C759',
    icon: 'check-circle',
  },
  [PickListStatus.CANCELED]: {
    label: 'Canceled',
    color: '#FF3B30',
    icon: 'x-circle',
  },
};

export const SHIP_LIST_STATUS_CONFIG = {
  [ShipListStatus.PENDING]: {
    label: 'Pending',
    color: '#8E8E93',
    icon: 'clock',
  },
  [ShipListStatus.IN_PROGRESS]: {
    label: 'In Progress',
    color: '#007AFF',
    icon: 'package',
  },
  [ShipListStatus.READY_TO_SHIP]: {
    label: 'Ready to Ship',
    color: '#32ADE6',
    icon: 'truck',
  },
  [ShipListStatus.SHIPPED]: {
    label: 'Shipped',
    color: '#34C759',
    icon: 'check-circle',
  },
  [ShipListStatus.CANCELED]: {
    label: 'Canceled',
    color: '#FF3B30',
    icon: 'x-circle',
  },
};

export const PRIORITY_CONFIG = {
  [Priority.DEFAULT]: {
    label: 'Normal',
    color: '#8E8E93',
    icon: 'minus',
  },
  [Priority.HIGH]: {
    label: 'High',
    color: '#FF3B30',
    icon: 'alert-circle',
  },
};

export const PARTIAL_COMPLETION_CONFIG = {
  [PartialCompletionType.LEAVE_IN_PROGRESS]: {
    label: 'Leave In Progress',
    description: 'Keep pick list open for later completion',
  },
  [PartialCompletionType.PARTIAL_COMPLETE]: {
    label: 'Partial Complete',
    description: 'Complete with picked items only',
  },
  [PartialCompletionType.WRITEOFF_AND_REDUCE_ORDER]: {
    label: 'Write Off & Reduce Order',
    description: 'Write off unpicked items and reduce order',
  },
  [PartialCompletionType.WRITEOFF_AND_BACKORDER_AND_REDUCE_ORDER]: {
    label: 'Write Off, Backorder & Reduce',
    description: 'Write off, create backorder, and reduce order',
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get status configuration
 */
export const getSalesOrderStatusConfig = (status: SalesOrderStatus | string) => {
  return SALES_ORDER_STATUS_CONFIG[status as SalesOrderStatus] || {
    label: status,
    color: '#8E8E93',
    description: '',
  };
};

export const getPickListStatusConfig = (status: PickListStatus | string) => {
  return PICK_LIST_STATUS_CONFIG[status as PickListStatus] || {
    label: status,
    color: '#8E8E93',
    icon: 'help-circle',
  };
};

export const getShipListStatusConfig = (status: ShipListStatus | string) => {
  return SHIP_LIST_STATUS_CONFIG[status as ShipListStatus] || {
    label: status,
    color: '#8E8E93',
    icon: 'help-circle',
  };
};

export const getPriorityConfig = (priority: Priority | string) => {
  return PRIORITY_CONFIG[priority as Priority] || PRIORITY_CONFIG[Priority.DEFAULT];
};

/**
 * Check if status allows certain actions
 */
export const canApprove = (status: SalesOrderStatus | string): boolean => {
  return status === SalesOrderStatus.WAITING_APPROVAL;
};

export const canStartPicking = (status: SalesOrderStatus | string): boolean => {
  return status === SalesOrderStatus.PENDING || status === SalesOrderStatus.WAITING_APPROVAL;
};

export const canStartPacking = (status: SalesOrderStatus | string): boolean => {
  return status === SalesOrderStatus.PICKED;
};

export const canShip = (status: SalesOrderStatus | string): boolean => {
  return status === SalesOrderStatus.PACKED || status === SalesOrderStatus.READY_FOR_SHIPPING;
};

export const canComplete = (status: SalesOrderStatus | string): boolean => {
  return status === SalesOrderStatus.SHIPPED;
};

export const canCancel = (status: SalesOrderStatus | string): boolean => {
  return ![
    SalesOrderStatus.SHIPPED,
    SalesOrderStatus.COMPLETED,
    SalesOrderStatus.CANCELED,
  ].includes(status as SalesOrderStatus);
};

/**
 * Calculate pick list progress
 */
export const calculatePickListProgress = (
  quantityToPick: number,
  quantityCollected: number
): number => {
  if (quantityToPick === 0) return 0;
  return Math.min(100, Math.round((quantityCollected / quantityToPick) * 100));
};

/**
 * Calculate ship list progress
 */
export const calculateShipListProgress = (
  quantityToShip: number,
  quantityPacked: number
): number => {
  if (quantityToShip === 0) return 0;
  return Math.min(100, Math.round((quantityPacked / quantityToShip) * 100));
};

/**
 * Format tracking information
 */
export const formatTrackingSerial = (serials: string[]): string => {
  if (!serials || serials.length === 0) return 'N/A';
  if (serials.length === 1) return serials[0];
  return `${serials[0]} +${serials.length - 1} more`;
};

export const formatTrackingLot = (lot: string | null): string => {
  return lot || 'N/A';
};

export const formatTrackingExpiry = (expiry: string | null): string => {
  if (!expiry) return 'N/A';
  try {
    const date = new Date(expiry);
    return date.toLocaleDateString();
  } catch {
    return expiry;
  }
};

/**
 * Format package dimensions
 */
export const formatDimensions = (
  length: number | null,
  width: number | null,
  height: number | null,
  uom: string | null = 'in'
): string => {
  if (!length || !width || !height) return 'Not set';
  return `${length} × ${width} × ${height} ${uom}`;
};

export const formatWeight = (
  weight: number | null,
  uom: string | null = 'lb'
): string => {
  if (!weight) return 'Not set';
  return `${weight} ${uom}`;
};

/**
 * Format currency for shipping
 */
export const formatShippingCurrency = (
  amount: number,
  currency: string = 'USD'
): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Get next status in workflow
 */
export const getNextStatus = (currentStatus: SalesOrderStatus | string): SalesOrderStatus | null => {
  const statusFlow: Record<string, SalesOrderStatus> = {
    [SalesOrderStatus.CREATED]: SalesOrderStatus.PENDING,
    [SalesOrderStatus.WAITING_APPROVAL]: SalesOrderStatus.PENDING,
    [SalesOrderStatus.PENDING]: SalesOrderStatus.PICKING,
    [SalesOrderStatus.PICKING]: SalesOrderStatus.PICKED,
    [SalesOrderStatus.PICKED]: SalesOrderStatus.PACKING,
    [SalesOrderStatus.PACKING]: SalesOrderStatus.PACKED,
    [SalesOrderStatus.PACKED]: SalesOrderStatus.READY_FOR_SHIPPING,
    [SalesOrderStatus.READY_FOR_SHIPPING]: SalesOrderStatus.SHIPPED,
    [SalesOrderStatus.SHIPPED]: SalesOrderStatus.COMPLETED,
  };
  
  return statusFlow[currentStatus] || null;
};

/**
 * Validate if status transition is allowed
 */
export const isStatusTransitionAllowed = (
  from: SalesOrderStatus | string,
  to: SalesOrderStatus | string
): boolean => {
  const allowedTransitions: Record<string, SalesOrderStatus[]> = {
    [SalesOrderStatus.CREATED]: [SalesOrderStatus.PENDING, SalesOrderStatus.WAITING_APPROVAL, SalesOrderStatus.CANCELED],
    [SalesOrderStatus.WAITING_APPROVAL]: [SalesOrderStatus.PENDING, SalesOrderStatus.CANCELED],
    [SalesOrderStatus.PENDING]: [SalesOrderStatus.PICKING, SalesOrderStatus.CANCELED],
    [SalesOrderStatus.PICKING]: [SalesOrderStatus.PICKED, SalesOrderStatus.PENDING, SalesOrderStatus.CANCELED],
    [SalesOrderStatus.PICKED]: [SalesOrderStatus.PACKING, SalesOrderStatus.CANCELED],
    [SalesOrderStatus.PACKING]: [SalesOrderStatus.PACKED, SalesOrderStatus.PICKED, SalesOrderStatus.CANCELED],
    [SalesOrderStatus.PACKED]: [SalesOrderStatus.READY_FOR_SHIPPING, SalesOrderStatus.CANCELED],
    [SalesOrderStatus.READY_FOR_SHIPPING]: [SalesOrderStatus.SHIPPED, SalesOrderStatus.WAITING_PERSONAL_PICKUP, SalesOrderStatus.CANCELED],
    [SalesOrderStatus.WAITING_PERSONAL_PICKUP]: [SalesOrderStatus.COMPLETED, SalesOrderStatus.CANCELED],
    [SalesOrderStatus.SHIPPED]: [SalesOrderStatus.COMPLETED],
    [SalesOrderStatus.SHIPPING]: [SalesOrderStatus.SHIPPED, SalesOrderStatus.COMPLETED],
  };
  
  const allowed = allowedTransitions[from] || [];
  return allowed.includes(to as SalesOrderStatus);
};

/**
 * Format date/time for display
 */
export const formatDateTime = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleString();
  } catch {
    return dateString;
  }
};

export const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch {
    return dateString;
  }
};

export const formatTime = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString();
  } catch {
    return dateString;
  }
};
