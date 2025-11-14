export interface InventoryStateMetrics {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
}

export interface SalesMetrics {
  totalSales: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  averageOrderValue: number;
}

export interface ProcurementMetrics {
  totalPurchaseOrders: number;
  pendingPOs: number;
  totalSpend: number;
  itemsOnOrder: number;
}

export interface InventoryMovementMetrics {
  itemsReceived: number;
  itemsShipped: number;
  itemsAdjusted: number;
  netChange: number;
}

export interface BusinessPartnerMetrics {
  totalCustomers: number;
  totalSuppliers: number;
  activeCustomers: number;
  activeSuppliers: number;
}

export interface DashboardMetrics {
  inventory: InventoryStateMetrics;
  sales: SalesMetrics;
  procurement: ProcurementMetrics;
  movement: InventoryMovementMetrics;
  partners: BusinessPartnerMetrics;
  lastUpdated: string;
}

export interface DashboardParams {
  startDate?: string;
  endDate?: string;
  warehouseId?: string;
}
