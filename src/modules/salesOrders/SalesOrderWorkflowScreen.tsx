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
import { useAuth } from '../../providers';
import {
  workflowApi,
  salesOrdersApi,
  SalesOrderResponse,
  SalesOrderStatus,
  SalesOrderNavigationBar,
  getSalesOrderStatusConfig,
  canApprove,
  canStartPicking,
  formatDateTime,
} from '../../services/salesOrders';

interface SalesOrderWorkflowScreenProps {
  orderId: string;
  onBack: () => void;
  onViewPickList?: (pickListId: string) => void;
  onViewShipList?: (shipListId: string) => void;
}

export const SalesOrderWorkflowScreen: React.FC<SalesOrderWorkflowScreenProps> = ({
  orderId,
  onBack,
  onViewPickList,
  onViewShipList,
}) => {
  const { user } = useAuth();
  const [order, setOrder] = useState<SalesOrderResponse | null>(null);
  const [navBar, setNavBar] = useState<SalesOrderNavigationBar | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!user?.token || !user?.tenantId) {
        Alert.alert('Error', 'Authentication required. Please log in again.');
        return;
      }
      
      const [orderData, navBarData] = await Promise.all([
        salesOrdersApi.getSalesOrder(orderId, user.token, user.tenantId),
        workflowApi.status.getNavigationBar(orderId, user.token, user.tenantId),
      ]);
      
      setOrder(orderData);
      setNavBar(navBarData);
    } catch (error) {
      console.error('Failed to load order:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to load order');
    } finally {
      setLoading(false);
    }
  }, [orderId, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmitForApproval = async () => {
    if (!order || !user?.token || !user?.tenantId) return;

    try {
      setActionLoading(true);
      const updated = await workflowApi.approval.submitForApproval(
        order.id,
        user.token,
        user.tenantId
      );
      setOrder(updated);
      Alert.alert('Success', 'Order submitted for approval');
      loadData();
    } catch (error) {
      console.error('Failed to submit for approval:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to submit for approval');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!order || !user?.token || !user?.tenantId) return;

    Alert.alert(
      'Approve Order',
      'Are you sure you want to approve this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              setActionLoading(true);
              const updated = await workflowApi.approval.approveSalesOrder(
                order.id,
                user.token,
                user.tenantId
              );
              setOrder(updated);
              Alert.alert('Success', 'Order approved');
              loadData();
            } catch (error) {
              console.error('Failed to approve order:', error);
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to approve order');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleMoveToPackaging = async () => {
    if (!order || !user?.token || !user?.tenantId) return;

    try {
      setActionLoading(true);
      const pickList = await workflowApi.packaging.moveToPackaging(
        order.id,
        user.token,
        user.tenantId
      );
      Alert.alert('Success', `Pick list ${pickList.number} created`, [
        {
          text: 'View Pick List',
          onPress: () => onViewPickList?.(pickList.id),
        },
        { text: 'OK' },
      ]);
      loadData();
    } catch (error) {
      console.error('Failed to move to packaging:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to move to packaging');
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeStatus = async (status: SalesOrderStatus) => {
    if (!order || !user?.token || !user?.tenantId) return;

    try {
      setActionLoading(true);
      const updated = await workflowApi.status.changeStatus(
        order.id,
        { status },
        user.token,
        user.tenantId
      );
      setOrder(updated);
      Alert.alert('Success', `Status changed to ${status}`);
      loadData();
    } catch (error) {
      console.error('Failed to change status:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to change status');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !order) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading order...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Order not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusConfig = getSalesOrderStatusConfig(order.status || '');
  const showApprovalActions = canApprove(order.status || '');
  const showPickingActions = canStartPicking(order.status || '');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Order Workflow</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Order Info */}
        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderNumber}>{order.number}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.color }]}>
              <Text style={styles.statusText}>{statusConfig.label}</Text>
            </View>
          </View>
          
          {order.customerName && (
            <Text style={styles.customerName}>Customer: {order.customerName}</Text>
          )}
          
          <Text style={styles.orderDate}>Created: {formatDateTime(order.createdAt)}</Text>
          
          {statusConfig.description && (
            <Text style={styles.statusDescription}>{statusConfig.description}</Text>
          )}
        </View>

        {/* Progress Navigation */}
        {navBar && (
          <View style={styles.progressCard}>
            <Text style={styles.sectionTitle}>Order Progress</Text>
            
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Items Ordered:</Text>
              <Text style={styles.progressValue}>{navBar.salesOrderItemQuantity}</Text>
            </View>

            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Items Picked:</Text>
              <Text style={styles.progressValue}>{navBar.pickedItemQuantity}</Text>
            </View>

            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Items Shipped:</Text>
              <Text style={styles.progressValue}>{navBar.shippedItemQuantity}</Text>
            </View>

            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Items Billed:</Text>
              <Text style={styles.progressValue}>{navBar.billedItemQuantity}</Text>
            </View>

            {/* Pick Lists */}
            {navBar.pickListIds.length > 0 && (
              <View style={styles.listSection}>
                <Text style={styles.listTitle}>Pick Lists ({navBar.pickListIds.length})</Text>
                {navBar.pickListIds.map((id) => (
                  <TouchableOpacity
                    key={id}
                    style={styles.listItem}
                    onPress={() => onViewPickList?.(id)}
                  >
                    <Text style={styles.listItemText}>View Pick List</Text>
                    <Text style={styles.listItemArrow}>→</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Ship Lists */}
            {navBar.shipListIds.length > 0 && (
              <View style={styles.listSection}>
                <Text style={styles.listTitle}>Ship Lists ({navBar.shipListIds.length})</Text>
                {navBar.shipListIds.map((id) => (
                  <TouchableOpacity
                    key={id}
                    style={styles.listItem}
                    onPress={() => onViewShipList?.(id)}
                  >
                    <Text style={styles.listItemText}>View Ship List</Text>
                    <Text style={styles.listItemArrow}>→</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Workflow Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Workflow Actions</Text>

          {order.status === SalesOrderStatus.CREATED && (
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={handleSubmitForApproval}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.actionButtonText}>Submit for Approval</Text>
              )}
            </TouchableOpacity>
          )}

          {showApprovalActions && (
            <TouchableOpacity
              style={[styles.actionButton, styles.successButton]}
              onPress={handleApprove}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.actionButtonText}>Approve Order</Text>
              )}
            </TouchableOpacity>
          )}

          {showPickingActions && (
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={handleMoveToPackaging}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.actionButtonText}>Start Picking</Text>
              )}
            </TouchableOpacity>
          )}

          {order.status === SalesOrderStatus.SHIPPED && (
            <TouchableOpacity
              style={[styles.actionButton, styles.successButton]}
              onPress={() => handleChangeStatus(SalesOrderStatus.COMPLETED)}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.actionButtonText}>Mark as Completed</Text>
              )}
            </TouchableOpacity>
          )}

          {order.status !== SalesOrderStatus.CANCELED && 
           order.status !== SalesOrderStatus.COMPLETED && (
            <TouchableOpacity
              style={[styles.actionButton, styles.dangerButton]}
              onPress={() => handleChangeStatus(SalesOrderStatus.CANCELED)}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.actionButtonText}>Cancel Order</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Order Items */}
        {order.items && order.items.length > 0 && (
          <View style={styles.itemsCard}>
            <Text style={styles.sectionTitle}>Order Items</Text>
            {order.items.map((item, index) => (
              <View key={item.id || index} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.itemName}</Text>
                  {item.sku && <Text style={styles.itemSku}>SKU: {item.sku}</Text>}
                </View>
                <View style={styles.itemQuantity}>
                  <Text style={styles.itemQuantityText}>Qty: {item.quantity}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
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
  orderCard: {
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
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
  customerName: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 13,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  progressCard: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  progressItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  progressLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  listSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    marginBottom: 8,
  },
  listItemText: {
    fontSize: 14,
    color: '#007AFF',
  },
  listItemArrow: {
    fontSize: 16,
    color: '#007AFF',
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
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  itemsCard: {
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
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 2,
  },
  itemSku: {
    fontSize: 12,
    color: '#8E8E93',
  },
  itemQuantity: {
    marginLeft: 12,
  },
  itemQuantityText: {
    fontSize: 14,
    color: '#8E8E93',
  },
});
