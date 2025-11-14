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
import { usePurchaseOrders } from '../PurchaseOrdersScreen/PurchaseOrdersScreenProvider';
import { useAuth } from '../../../providers';
import { purchaseOrdersApi, PurchaseOrderResponse, formatPOCurrency, formatPODate, PURCHASE_ORDER_STATUSES } from '../../../services/purchaseOrders';

interface PurchaseOrderDetailScreenProps {
  orderId: string;
  onEdit: (order: PurchaseOrderResponse) => void;
  onDelete: (order: PurchaseOrderResponse) => void;
  onBack: () => void;
}

const PurchaseOrderDetailScreen: React.FC<PurchaseOrderDetailScreenProps> = ({
  orderId,
  onEdit,
  onDelete,
  onBack,
}) => {
  const { state, setLoading, setError, setCurrentPurchaseOrder } = usePurchaseOrders();
  const { user } = useAuth();
  const [order, setOrder] = useState<PurchaseOrderResponse | null>(null);

  const loadOrder = useCallback(async () => {
    try {
      setLoading(true);
      const orderData = await purchaseOrdersApi.getPurchaseOrder(orderId, user?.token, user?.tenantId);
      setOrder(orderData);
      setCurrentPurchaseOrder(orderData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load purchase order');
    } finally {
      setLoading(false);
    }
  }, [orderId, setLoading, setError, setCurrentPurchaseOrder, user]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleDelete = () => {
    if (!order) return;
    
    Alert.alert(
      'Delete Purchase Order',
      `Are you sure you want to delete PO "${order.number}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(order),
        },
      ]
    );
  };

  const getStatusColor = (status: string | null) => {
    const statusConfig = PURCHASE_ORDER_STATUSES.find(s => s.value === status);
    return statusConfig?.color || '#999';
  };

  const InfoRow: React.FC<{ label: string; value: string | number | null }> = ({ label, value }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>
        {value === null || value === undefined ? 'N/A' : String(value)}
      </Text>
    </View>
  );

  if (state.loading && !order) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading purchase order...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Purchase order not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => onEdit(order)}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderNumber}>{order.number || 'No PO #'}</Text>
            <Text style={styles.orderDate}>{formatPODate(order.createdAt)}</Text>
            {order.type && <Text style={styles.orderType}>Type: {order.type}</Text>}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
            <Text style={styles.statusText}>{order.status || 'Draft'}</Text>
          </View>
        </View>

        {/* Status Flags */}
        {(order.isApproved || order.isIssued || order.isReceived || order.isReconciled) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>
            <View style={styles.flagsContainer}>
              {order.isApproved && <View style={styles.flag}><Text style={styles.flagText}>✓ Approved</Text></View>}
              {order.isIssued && <View style={styles.flag}><Text style={styles.flagText}>✓ Issued</Text></View>}
              {order.isReceived && <View style={styles.flag}><Text style={styles.flagText}>✓ Received</Text></View>}
              {order.isReconciled && <View style={styles.flag}><Text style={styles.flagText}>✓ Reconciled</Text></View>}
            </View>
          </View>
        )}

        {/* Supplier Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Supplier Information</Text>
          <InfoRow label="Name" value={order.supplier?.name} />
          <InfoRow label="Email" value={order.supplier?.email} />
        </View>

        {/* Warehouse Information */}
        {order.destinationWarehouse && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Destination Warehouse</Text>
            <InfoRow label="Name" value={order.destinationWarehouse.name} />
            <InfoRow label="Code" value={order.destinationWarehouse.code} />
          </View>
        )}

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>{formatPOCurrency(order.totalAmount)}</Text>
          </View>
          {order.totalReturnAmount > 0 && (
            <InfoRow label="Return Amount" value={formatPOCurrency(order.totalReturnAmount)} />
          )}
        </View>

        {/* Items */}
        {order.items && order.items.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Items ({order.items.length})</Text>
            {order.items.map((item, index) => (
              <View key={item.id || index} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.itemName || 'Unknown Item'}</Text>
                  {item.sku && <Text style={styles.itemSku}>SKU: {item.sku}</Text>}
                  <View style={styles.itemQuantities}>
                    <Text style={styles.itemQuantity}>Ordered: {item.quantity}</Text>
                    {item.receivedQuantity > 0 && (
                      <Text style={styles.itemReceived}>Received: {item.receivedQuantity}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.itemPricing}>
                  <Text style={styles.itemPrice}>{formatPOCurrency(item.total || 0)}</Text>
                  <Text style={styles.itemUnitPrice}>@ {formatPOCurrency(item.unitPrice)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Additional Information */}
        {(order.supplierInvoiceNumber || order.dueAt) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            {order.supplierInvoiceNumber && (
              <InfoRow label="Supplier Invoice #" value={order.supplierInvoiceNumber} />
            )}
            {order.dueAt && (
              <InfoRow label="Due Date" value={formatPODate(order.dueAt)} />
            )}
          </View>
        )}

        {/* Notes */}
        {(order.note || order.internalNote || order.deliveryNote) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            {order.note && (
              <View style={styles.noteContainer}>
                <Text style={styles.noteLabel}>Note:</Text>
                <Text style={styles.noteText}>{order.note}</Text>
              </View>
            )}
            {order.internalNote && (
              <View style={styles.noteContainer}>
                <Text style={styles.noteLabel}>Internal Note:</Text>
                <Text style={styles.noteText}>{order.internalNote}</Text>
              </View>
            )}
            {order.deliveryNote && (
              <View style={styles.noteContainer}>
                <Text style={styles.noteLabel}>Delivery Note:</Text>
                <Text style={styles.noteText}>{order.deliveryNote}</Text>
              </View>
            )}
          </View>
        )}

        {/* User Information */}
        {(order.userRequested || order.userApproved) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Users</Text>
            {order.userRequested && (
              <InfoRow label="Requested By" value={order.userRequested.name} />
            )}
            {order.userApproved && (
              <InfoRow label="Approved By" value={order.userApproved.name} />
            )}
          </View>
        )}

        {/* Timestamps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          <InfoRow label="Created" value={formatPODate(order.createdAt)} />
          {order.completedAt && <InfoRow label="Completed" value={formatPODate(order.completedAt)} />}
          {order.dueAt && <InfoRow label="Due" value={formatPODate(order.dueAt)} />}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#FF3B30',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  orderHeader: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderNumber: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  orderType: {
    fontSize: 12,
    color: '#999',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  flagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  flag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  flagText: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  itemSku: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  itemQuantities: {
    flexDirection: 'row',
    gap: 12,
  },
  itemQuantity: {
    fontSize: 13,
    color: '#666',
  },
  itemReceived: {
    fontSize: 13,
    color: '#34C759',
    fontWeight: '500',
  },
  itemPricing: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  itemUnitPrice: {
    fontSize: 12,
    color: '#999',
  },
  noteContainer: {
    marginBottom: 12,
  },
  noteLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});

export default PurchaseOrderDetailScreen;
