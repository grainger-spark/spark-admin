import React from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useNotificationsScreen } from './NotificationsScreenProvider';
import { NotificationCard, NotificationDetailModal } from './components';
import { colors, spacing, typography } from '../../../theme';

export const NotificationsScreen = () => {
  const {
    notifications,
    isLoading,
    selectedNotification,
    setSelectedNotification,
    markAsRead,
    refreshNotifications,
  } = useNotificationsScreen();

  const handleNotificationPress = (notification: typeof notifications[0]) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    setSelectedNotification(notification);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationCard notification={item} onPress={() => handleNotificationPress(item)} />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refreshNotifications} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notifications</Text>
            <Text style={styles.emptySubtext}>
              You're all caught up! Check back later for updates.
            </Text>
          </View>
        }
      />

      <NotificationDetailModal
        notification={selectedNotification}
        visible={selectedNotification !== null}
        onClose={() => setSelectedNotification(null)}
        onActionExecuted={refreshNotifications}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  listContent: {
    paddingVertical: spacing.md,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl * 2,
  },
  emptyText: {
    ...typography.h3,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
