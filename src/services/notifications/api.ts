import { apiRequest } from '../../helpers/api';
import { Notification, ActionItem, ActionType, ActionItemExecutionResult } from './types';

interface ActionItemResponse {
  id: string;
  actionType: ActionType;
  description: string;
  isCompleted: boolean;
  data: any;
  createdAt: string;
  completedAt?: string;
}

interface ActionItemsListResponse {
  data: ActionItemResponse[];
  meta: {
    page: number;
    pageSize: number;
    totalRows: number;
    totalPages: number;
  };
}

const ACTION_TYPE_CONFIG: Record<string, {
  title: string;
  icon: string;
  actionLabel: string;
  canExecute: boolean;
}> = {
  create_sales_order: {
    title: 'Create Sales Order',
    icon: 'cart',
    actionLabel: 'Create Order',
    canExecute: true,
  },
  update_sales_order: {
    title: 'Update Sales Order',
    icon: 'create',
    actionLabel: 'Review Changes',
    canExecute: false, // Not yet implemented on backend
  },
  not_actionable: {
    title: 'Needs Review',
    icon: 'alert-circle',
    actionLabel: 'Mark as Reviewed',
    canExecute: false,
  },
};

interface NotificationResponse {
  id: string;
  type: string;
  createdAt: string;
  readAt: string | null;
  title: string;
  text: string;
  content: any;
  notificationType: string;
  actionItems?: ActionItemResponse[];
}

interface NotificationsListResponse {
  data: NotificationResponse[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export const fetchNotificationsApi = async (
  token?: string,
  tenantId?: string,
  page: number = 1,
  pageSize: number = 20
): Promise<Notification[]> => {
  console.log('Fetching notifications with token:', token ? 'Token exists' : 'No token');
  console.log('Fetching notifications with tenantId:', tenantId || 'No tenantId');
  
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('pageSize', pageSize.toString());
  params.append('sortBy', 'createdAt');
  params.append('sortDirection', 'desc');

  const response = await apiRequest<any>(
    `/users/me/notifications?${params.toString()}`,
    {
      method: 'GET',
      token,
      tenantId,
    }
  );

  console.log('Notifications API Response:', JSON.stringify(response, null, 2));
  
  // Handle wrapped response structure
  const notificationsData = response.value?.data || response.data || [];
  console.log('Number of notifications:', notificationsData.length);

  return notificationsData.map((notif: any): Notification => {
    // Map action items if they exist
    const actionItems: ActionItem[] = (notif.actionItems || []).map((item: ActionItemResponse) => {
      const config = ACTION_TYPE_CONFIG[item.actionType] || {
        title: item.actionType,
        icon: 'help-circle',
        actionLabel: 'View',
        canExecute: false,
      };

      return {
        id: item.id,
        type: item.actionType,
        description: item.data?.summary || notif.text,
        status: item.isCompleted ? 'completed' : 'pending',
        data: item.data,
        createdAt: new Date(item.createdAt),
        completedAt: item.completedAt ? new Date(item.completedAt) : undefined,
      };
    });

    return {
      id: notif.id,
      title: notif.title,
      message: notif.text,
      timestamp: new Date(notif.createdAt),
      isRead: notif.readAt !== null,
      type: 'info',
      actionItems: actionItems.length > 0 ? actionItems : undefined,
    };
  });
};

export const markAsReadApi = async (notificationId: string, token?: string, tenantId?: string): Promise<void> => {
  await apiRequest(`/users/me/notifications/${notificationId}`, {
    method: 'POST',
    token,
    tenantId,
  });
};

export const executeActionItemApi = async (
  actionItemId: string,
  token?: string,
  tenantId?: string
): Promise<ActionItemExecutionResult> => {
  return await apiRequest<ActionItemExecutionResult>(`/action-items/${actionItemId}/execute`, {
    method: 'POST',
    token,
    tenantId,
  });
};

export const getActionTypeConfig = (actionType: ActionType) => {
  return ACTION_TYPE_CONFIG[actionType] || {
    title: actionType,
    icon: 'help-circle',
    actionLabel: 'View',
    canExecute: false,
  };
};
