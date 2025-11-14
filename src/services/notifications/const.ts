import { Notification, NotificationsState } from './types';

export const initialNotification: Notification = {
  id: '',
  title: '',
  message: '',
  timestamp: new Date(),
  isRead: false,
  type: 'info',
};

export const initialNotificationsState: NotificationsState = {
  notifications: [],
  isLoading: false,
  error: null,
};
