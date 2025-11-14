export type ActionType = 'create_sales_order' | 'update_sales_order' | 'not_actionable';

export interface ActionItemDataCommon {
  emailSubject: string;
  emailFrom: string;
  emailMessageId: string;
  summary: string;
  orderNumbers?: string[];
}

export interface CreateSalesOrderData extends ActionItemDataCommon {
  customerName: string;
  items: Array<{
    itemName: string;
    itemUpc?: string;
    quantity: number;
    price?: number;
    uomName?: string;
  }>;
  customerId?: string;
  customerEmail?: string;
  customerPhoneNumber?: string;
  customerPurchaseOrder?: string;
  storeId?: string;
  storeName?: string;
  taxRateId?: string;
  taxRateName?: string;
  shippingAddressStreet1?: string;
  shippingAddressCity?: string;
  shippingAddressState?: string;
  shippingAddressZip?: string;
  shippingAddressCountry?: string;
  note?: string;
  internalNote?: string;
  paymentTerms?: string;
  paymentMethod?: string;
}

export interface UpdateSalesOrderData extends ActionItemDataCommon {
  orderNumber: string;
  requestedChanges: string;
  items?: Array<{ itemName: string; quantity: number }>;
  notes?: string;
}

export interface NotActionableData extends ActionItemDataCommon {
  reason: string;
}

export type ActionItemData = CreateSalesOrderData | UpdateSalesOrderData | NotActionableData;

export interface ActionItem {
  id: string;
  type: ActionType;
  description: string;
  status: 'pending' | 'completed' | 'executing';
  data: ActionItemData;
  createdAt: Date;
  completedAt?: Date;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  type: 'info' | 'warning' | 'error' | 'success';
  actionItems?: ActionItem[];
}

export interface NotificationsState {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
}

export interface ActionItemExecutionResult {
  success: boolean;
  message: string;
  resultId?: string;
  resultType?: string;
  resultData?: any;
}
