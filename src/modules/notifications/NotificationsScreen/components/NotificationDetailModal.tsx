import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Notification, executeActionItemApi, getActionTypeConfig, CreateSalesOrderData } from '../../../../services';
import { useAuth } from '../../../../providers';
import { Button } from '../../../../components';
import { colors, spacing, typography } from '../../../../theme';

interface NotificationDetailModalProps {
  notification: Notification | null;
  visible: boolean;
  onClose: () => void;
  onActionExecuted?: () => void;
}

export const NotificationDetailModal = ({
  notification,
  visible,
  onClose,
  onActionExecuted,
}: NotificationDetailModalProps) => {
  const { user } = useAuth();
  const [executingActionId, setExecutingActionId] = useState<string | null>(null);

  if (!notification) return null;

  const handleActionPress = async (actionId: string, actionType: string) => {
    const config = getActionTypeConfig(actionType as any);
    
    if (!config.canExecute) {
      Alert.alert(
        'Not Available',
        'This action type is not yet supported. Please handle manually.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Execute Action',
      `Are you sure you want to ${config.actionLabel.toLowerCase()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: config.actionLabel,
          onPress: async () => {
            setExecutingActionId(actionId);
            try {
              const result = await executeActionItemApi(actionId, user?.token, user?.tenantId);
              
              if (result.success) {
                Alert.alert(
                  'Success',
                  result.message,
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        onActionExecuted?.();
                        onClose();
                      },
                    },
                  ]
                );
              }
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.message || 'Failed to execute action item',
                [{ text: 'OK' }]
              );
            } finally {
              setExecutingActionId(null);
            }
          },
        },
      ]
    );
  };

  const handleDetailsPress = (actionItem: any) => {
    // Show detailed data in alert (in production, this could be a separate modal)
    const data = actionItem.data;
    let details = '';

    if (data.emailFrom) details += `From: ${data.emailFrom}\n`;
    if (data.emailSubject) details += `Subject: ${data.emailSubject}\n\n`;
    if (data.summary) details += `${data.summary}\n\n`;
    
    if (actionItem.type === 'create_sales_order') {
      const orderData = data as CreateSalesOrderData;
      if (orderData.customerName) details += `Customer: ${orderData.customerName}\n`;
      if (orderData.items) {
        details += `\nItems:\n`;
        orderData.items.forEach((item) => {
          details += `  • ${item.itemName} (Qty: ${item.quantity})\n`;
        });
      }
    }

    Alert.alert('Action Item Details', details || 'No additional details available', [
      { text: 'OK' },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="notifications" size={24} color={colors.white} />
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={28} color={colors.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView style={styles.content}>
          <Text style={styles.title}>{notification.title}</Text>
          <Text style={styles.timestamp}>
            {notification.timestamp.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}{' '}
            • {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>

          <View style={styles.messageContainer}>
            <Text style={styles.message}>{notification.message}</Text>
          </View>

          {notification.actionItems && notification.actionItems.length > 0 && (
            <View style={styles.actionItemsContainer}>
              <View style={styles.actionItemsHeader}>
                <Ionicons name="flash" size={20} color={colors.primary} />
                <Text style={styles.actionItemsTitle}>
                  ACTION ITEMS ({notification.actionItems.length})
                </Text>
              </View>

              {notification.actionItems.map((actionItem, index) => {
                const config = getActionTypeConfig(actionItem.type);
                const isExecuting = executingActionId === actionItem.id;
                
                return (
                  <View key={actionItem.id} style={styles.actionItem}>
                    <View style={styles.actionItemHeader}>
                      <Text style={styles.actionItemNumber}>#{index + 1}</Text>
                      <Text style={styles.actionItemTitle}>{config.title}</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          actionItem.status === 'pending' && styles.statusPending,
                          actionItem.status === 'completed' && styles.statusCompleted,
                          actionItem.status === 'executing' && styles.statusExecuting,
                        ]}
                      >
                        <Text style={styles.statusText}>
                          {actionItem.status === 'pending' && '⚡ Pending'}
                          {actionItem.status === 'completed' && '✓ Completed'}
                          {actionItem.status === 'executing' && '⏳ Executing'}
                          {isExecuting && '⏳ Executing'}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.actionItemDescription}>{actionItem.description}</Text>

                    {/* Show email metadata if available */}
                    {actionItem.data.emailFrom && (
                      <View style={styles.metadataContainer}>
                        <Text style={styles.metadataLabel}>From:</Text>
                        <Text style={styles.metadataValue}>{actionItem.data.emailFrom}</Text>
                      </View>
                    )}
                    {actionItem.data.emailSubject && (
                      <View style={styles.metadataContainer}>
                        <Text style={styles.metadataLabel}>Subject:</Text>
                        <Text style={styles.metadataValue}>{actionItem.data.emailSubject}</Text>
                      </View>
                    )}

                    <View style={styles.actionButtons}>
                      <Button
                        title="View Details"
                        onPress={() => handleDetailsPress(actionItem)}
                        variant="outline"
                        style={styles.actionButton}
                      />
                      {actionItem.status === 'pending' && (
                        <Button
                          title={config.actionLabel}
                          onPress={() => handleActionPress(actionItem.id, actionItem.type)}
                          style={styles.actionButton}
                          loading={isExecuting}
                          disabled={isExecuting}
                        />
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: spacing.xxl + 20,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    padding: spacing.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  timestamp: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  messageContainer: {
    backgroundColor: colors.gray50,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  message: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  actionItemsContainer: {
    marginBottom: spacing.xl,
  },
  actionItemsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  actionItemsTitle: {
    ...typography.h3,
    color: colors.primary,
    marginLeft: spacing.sm,
  },
  actionItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionItemNumber: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '700',
    marginRight: spacing.sm,
  },
  actionItemTitle: {
    ...typography.h3,
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
  },
  statusBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
  },
  statusPending: {
    backgroundColor: colors.warning + '20',
  },
  statusCompleted: {
    backgroundColor: colors.success + '20',
  },
  statusExecuting: {
    backgroundColor: colors.info + '20',
  },
  statusFailed: {
    backgroundColor: colors.error + '20',
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  actionItemDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  metadataContainer: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  metadataLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
    width: 70,
  },
  metadataValue: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
