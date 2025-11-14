import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Notification, ActionItem } from '../../../../services';
import { colors, spacing, typography } from '../../../../theme';

interface NotificationCardProps {
  notification: Notification;
  onPress: () => void;
}

export const NotificationCard = ({ notification, onPress }: NotificationCardProps) => {
  const getStatusColor = () => {
    switch (notification.type) {
      case 'error':
        return colors.error;
      case 'warning':
        return colors.warning;
      case 'success':
        return colors.success;
      default:
        return colors.info;
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  return (
    <TouchableOpacity
      style={[styles.container, !notification.isRead && styles.unread]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="notifications" size={20} color={getStatusColor()} />
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{notification.title}</Text>
          <View style={styles.metaContainer}>
            <Text style={styles.timestamp}>
              {notification.timestamp.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}{' '}
              • {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Text style={styles.timeAgo}> • {getTimeAgo(notification.timestamp)}</Text>
          </View>
        </View>
        {!notification.isRead && <View style={styles.unreadDot} />}
      </View>

      <Text style={styles.message} numberOfLines={2}>
        {notification.message}
      </Text>

      {notification.actionItems && notification.actionItems.length > 0 && (
        <View style={styles.actionItemsRow}>
          {notification.actionItems.map((item: ActionItem) => {
            const isPending = item.status === 'pending';
            const isCompleted = item.status === 'completed';
            
            return (
              <View
                key={item.id}
                style={[
                  styles.actionBadge,
                  isPending && styles.actionBadgePending,
                  isCompleted && styles.actionBadgeCompleted,
                ]}
              >
                <Ionicons
                  name={isCompleted ? 'checkmark-circle' : 'flash'}
                  size={14}
                  color={isCompleted ? colors.success : colors.warning}
                />
                <Text
                  style={[
                    styles.actionBadgeText,
                    isCompleted && styles.actionBadgeTextCompleted,
                  ]}
                >
                  {isCompleted ? '✓ Completed' : `⚡ Pending`}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unread: {
    backgroundColor: colors.gray50,
    borderColor: colors.primary,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    ...typography.h3,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  timeAgo: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: spacing.sm,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  actionItemsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  actionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
  },
  actionBadgePending: {
    backgroundColor: colors.warning + '20',
  },
  actionBadgeCompleted: {
    backgroundColor: colors.success + '20',
  },
  actionBadgeText: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  actionBadgeTextCompleted: {
    color: colors.success,
  },
});
