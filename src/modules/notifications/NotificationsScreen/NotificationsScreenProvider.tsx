import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchNotificationsApi, markAsReadApi, Notification, initialNotificationsState } from '../../../services';
import { useAuth } from '../../../providers';

interface NotificationsScreenContextType {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  selectedNotification: Notification | null;
  setSelectedNotification: (notification: Notification | null) => void;
  markAsRead: (notificationId: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationsScreenContext = createContext<NotificationsScreenContextType | undefined>(undefined);

export const useNotificationsScreen = () => {
  const context = useContext(NotificationsScreenContext);
  if (!context) {
    throw new Error('useNotificationsScreen must be used within NotificationsScreenProvider');
  }
  return context;
};

interface NotificationsScreenProviderProps {
  children: ReactNode;
}

export const NotificationsScreenProvider = ({ children }: NotificationsScreenProviderProps) => {
  const { user } = useAuth();
  const [state, setState] = useState(initialNotificationsState);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const fetchNotifications = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      // Fetch all action items (remove isCompleted filter)
      const notifications = await fetchNotificationsApi(user?.token, user?.tenantId);
      setState({
        notifications,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch notifications',
      }));
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await markAsReadApi(notificationId, user?.token, user?.tenantId);
      setState((prev) => ({
        ...prev,
        notifications: prev.notifications.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        ),
      }));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const refreshNotifications = async () => {
    await fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <NotificationsScreenContext.Provider
      value={{
        notifications: state.notifications,
        isLoading: state.isLoading,
        error: state.error,
        selectedNotification,
        setSelectedNotification,
        markAsRead,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationsScreenContext.Provider>
  );
};
