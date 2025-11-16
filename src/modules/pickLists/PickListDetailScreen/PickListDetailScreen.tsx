import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { usePickList } from '../PickListsScreen/PickListsScreenProvider';
import { useAuth } from '../../../providers';
import {
  workflowApi,
  PickList,
  PickListItem,
  PickListStatus,
  Priority,
  getPickListStatusConfig,
  formatDateTime,
  calculatePickListProgress,
} from '../../../services/salesOrders';

interface PickListDetailScreenProps {
  pickListId: string;
  onBack: () => void;
  onPickItem: (pickList: PickList, item: PickListItem) => void;
}

export const PickListDetailScreen: React.FC<PickListDetailScreenProps> = ({
  pickListId,
  onBack,
  onPickItem,
}) => {
  const { state, setLoading, setError, setCurrentPickList, updatePickList } = usePickList();
  const { user } = useAuth();
  const [pickList, setPickList] = useState<PickList | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadPickList = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!user?.token || !user?.tenantId) {
        setError('Authentication required. Please log in again.');
        return;
      }
      
      const data = await workflowApi.pickList.getPickList(
        pickListId,
        user.token,
        user.tenantId
      );
      setPickList(data);
      setCurrentPickList(data);
    } catch (error) {
      console.error('Failed to load pick list:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load pick list';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [pickListId, setLoading, setError, setCurrentPickList, user]);

  useEffect(() => {
    loadPickList();
  }, [loadPickList]);

  const handleStartPicking = async () => {
    if (!pickList || !user?.token || !user?.tenantId) return;

    try {
      setActionLoading(true);
      const updated = await workflowApi.pickList.startPickList(
        pickList.id,
        {},
        user.token,
        user.tenantId
      );
      setPickList(updated);
      updatePickList(updated);
      Alert.alert('Success', 'Pick list started');
    } catch (error) {
      console.error('Failed to start pick list:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to start pick list');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompletePicking = async () => {
    if (!pickList || !user?.token || !user?.tenantId) return;

    try {
      setActionLoading(true);
      
      // Check completion status first
      const completionStatus = await workflowApi.pickList.getCompletionStatus(
        pickList.id,
        user.token,
        user.tenantId
      );

      if (!completionStatus.isFullyCollected) {
        // Show partial completion options
        Alert.alert(
          'Incomplete Picking',
          'Not all items have been picked. How would you like to proceed?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Leave In Progress',
              onPress: () => handlePartialCompletion('leaveinprogress'),
            },
            {
              text: 'Partial Complete',
              onPress: () => handlePartialCompletion('partialcomplete'),
            },
          ]
        );
        return;
      }

      // Complete normally
      const updated = await workflowApi.pickList.completePickList(
        pickList.id,
        user.token,
        user.tenantId
      );
      setPickList(updated);
      updatePickList(updated);
      Alert.alert('Success', 'Pick list completed');
    } catch (error) {
      console.error('Failed to complete pick list:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to complete pick list');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePartialCompletion = async (type: string) => {
    if (!pickList || !user?.token || !user?.tenantId) return;

    try {
      setActionLoading(true);
      const updated = await workflowApi.pickList.partialComplete(
        pickList.id,
        { partialCompletionType: type as any },
        user.token,
        user.tenantId
      );
      setPickList(updated);
      updatePickList(updated);
      Alert.alert('Success', 'Pick list updated');
    } catch (error) {
      console.error('Failed to update pick list:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update pick list');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetPriority = async (priority: Priority) => {
    if (!pickList || !user?.token || !user?.tenantId) return;

    try {
      setActionLoading(true);
      const updated = await workflowApi.pickList.setPriority(
        pickList.id,
        { priority },
        user.token,
        user.tenantId
      );
      setPickList(updated);
      updatePickList(updated);
      Alert.alert('Success', `Priority set to ${priority}`);
    } catch (error) {
      console.error('Failed to set priority:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to set priority');
    } finally {
      setActionLoading(false);
    }
  };

  const renderItem = (item: PickListItem) => {
    const progress = calculatePickListProgress(item.quantityToPick, item.quantityCollected);
    const isComplete = item.quantityCollected >= item.quantityToPick;

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.itemCard, isComplete && styles.itemCardComplete]}
        onPress={() => pickList && onPickItem(pickList, item)}
        disabled={pickList?.status === PickListStatus.COMPLETED}
      >
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{item.item.name}</Text>
          {isComplete && (
            <View style={styles.completeBadge}>
              <Text style={styles.completeText}>✓</Text>
            </View>
          )}
        </View>

        {item.item.sku && (
          <Text style={styles.itemSku}>SKU: {item.item.sku}</Text>
        )}

        <View style={styles.quantityRow}>
          <Text style={styles.quantityText}>
            Collected: {item.quantityCollected} / {item.quantityToPick}
          </Text>
          <Text style={[styles.progressPercent, isComplete && styles.progressComplete]}>
            {progress}%
          </Text>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%` },
              isComplete && styles.progressFillComplete,
            ]}
          />
        </View>

        {item.trackingSerial && item.trackingSerial.length > 0 && (
          <Text style={styles.tracking}>
            Serial: {item.trackingSerial.join(', ')}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  if (state.loading && !pickList) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading pick list...</Text>
      </View>
    );
  }

  if (!pickList) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Pick list not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusConfig = getPickListStatusConfig(pickList.status);
  const canStart = pickList.status === PickListStatus.PENDING;
  const canComplete = pickList.status === PickListStatus.IN_PROGRESS;
  const isCompleted = pickList.status === PickListStatus.COMPLETED;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Pick List</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.number}>{pickList.number}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.color }]}>
              <Text style={styles.statusText}>{statusConfig.label}</Text>
            </View>
          </View>

          {pickList.salesOrderNumber && (
            <Text style={styles.salesOrder}>Sales Order: {pickList.salesOrderNumber}</Text>
          )}

          {pickList.warehouse && (
            <Text style={styles.warehouse}>Warehouse: {pickList.warehouse.name}</Text>
          )}

          {pickList.pickerName && (
            <Text style={styles.picker}>Picker: {pickList.pickerName}</Text>
          )}

          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Created:</Text>
            <Text style={styles.dateValue}>{formatDateTime(pickList.createdAt)}</Text>
          </View>

          {pickList.startedAt && (
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Started:</Text>
              <Text style={styles.dateValue}>{formatDateTime(pickList.startedAt)}</Text>
            </View>
          )}

          {pickList.completedAt && (
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Completed:</Text>
              <Text style={styles.dateValue}>{formatDateTime(pickList.completedAt)}</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        {!isCompleted && (
          <View style={styles.actionsCard}>
            {canStart && (
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton]}
                onPress={handleStartPicking}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.actionButtonText}>Start Picking</Text>
                )}
              </TouchableOpacity>
            )}

            {canComplete && (
              <TouchableOpacity
                style={[styles.actionButton, styles.successButton]}
                onPress={handleCompletePicking}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.actionButtonText}>Complete Picking</Text>
                )}
              </TouchableOpacity>
            )}

            <View style={styles.priorityRow}>
              <Text style={styles.priorityLabel}>Priority:</Text>
              <TouchableOpacity
                style={[
                  styles.priorityButton,
                  pickList.priority === Priority.DEFAULT && styles.priorityButtonActive,
                ]}
                onPress={() => handleSetPriority(Priority.DEFAULT)}
                disabled={actionLoading}
              >
                <Text style={styles.priorityButtonText}>Normal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.priorityButton,
                  pickList.priority === Priority.HIGH && styles.priorityButtonActive,
                ]}
                onPress={() => handleSetPriority(Priority.HIGH)}
                disabled={actionLoading}
              >
                <Text style={styles.priorityButtonText}>High</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Items */}
        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>Items to Pick</Text>
          {pickList.items.map(renderItem)}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  number: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  salesOrder: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4,
  },
  warehouse: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  picker: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  dateLabel: {
    fontSize: 13,
    color: '#8E8E93',
  },
  dateValue: {
    fontSize: 13,
    color: '#000000',
  },
  actionsCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  successButton: {
    backgroundColor: '#34C759',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityLabel: {
    fontSize: 14,
    color: '#000000',
    marginRight: 8,
  },
  priorityButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center',
  },
  priorityButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  priorityButtonText: {
    fontSize: 14,
    color: '#000000',
  },
  itemsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemCardComplete: {
    backgroundColor: '#F0FFF4',
    borderWidth: 1,
    borderColor: '#34C759',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  completeBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  itemSku: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 8,
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quantityText: {
    fontSize: 14,
    color: '#000000',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  progressComplete: {
    color: '#34C759',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  progressFillComplete: {
    backgroundColor: '#34C759',
  },
  tracking: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
});
