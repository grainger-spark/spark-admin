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
import { useSalesOrders } from '../SalesOrdersScreen/SalesOrdersScreenProvider';
import { useAuth } from '../../../providers';
import { salesOrdersApi, SalesOrder, formatOrderCurrency, formatOrderDate, SALES_ORDER_STATUSES } from '../../../services/salesOrders';

interface SalesOrderDetailScreenProps {
  orderId: string;
  onEdit: (order: SalesOrder) => void;
  onDelete: (order: SalesOrder) => void;
  onBack: () => void;
}

const SalesOrderDetailScreen: React.FC<SalesOrderDetailScreenProps> = ({
  orderId,
  onEdit,
  onDelete,
  onBack,
}) => {
  const { state, setLoading, setError, setCurrentSalesOrder } = useSalesOrders();
  const { user } = useAuth();
  const [order, setOrder] = useState<SalesOrder | null>(null);

  const loadOrder = useCallback(async () => {
    try {
      setLoading(true);
      const orderData = await salesOrdersApi.getSalesOrder(orderId, user?.token, user?.tenantId);
      setOrder(orderData);
      setCurrentSalesOrder(orderData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load order');
    } finally {
      setLoading(false);
    }
  }, [orderId, setLoading, setError, setCurrentSalesOrder, user]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleDelete = () => {
    if (!order) return;
    
    Alert.alert(
      'Delete Order',
      `Are you sure you want to delete order "${order.number}"? This action cannot be undone.`,
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
    const statusConfig = SALES_ORDER_STATUSES.find(s => s.value === status);
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
            <Text style={styles.orderNumber}>{order.number || 'No Order #'}</Text>
            <Text style={styles.orderDate}>{formatOrderDate(order.createdAt)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
            <Text style={styles.statusText}>{order.status || 'Draft'}</Text>
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <InfoRow label="Name" value={order.customer?.name || order.customerName} />
          <InfoRow label="Email" value={order.customer?.email || order.customerEmail} />
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <InfoRow label="Subtotal" value={formatOrderCurrency(order.totalAmountBeforeTax)} />
          <InfoRow label="Tax" value={formatOrderCurrency(order.taxAmount)} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatOrderCurrency(order.totalAmount)}</Text>
          </View>
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
                </View>
                <View style={styles.itemPricing}>
                  <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                  <Text style={styles.itemPrice}>{formatOrderCurrency(item.total || 0)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Shipping Address */}
        {(order.shippingAddressStreet1 || order.shippingAddressCity) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            {order.shippingAddressStreet1 && <Text style={styles.addressLine}>{order.shippingAddressStreet1}</Text>}
            {order.shippingAddressStreet2 && <Text style={styles.addressLine}>{order.shippingAddressStreet2}</Text>}
            {(order.shippingAddressCity || order.shippingAddressState || order.shippingAddressZip) && (
              <Text style={styles.addressLine}>
                {[order.shippingAddressCity, order.shippingAddressState, order.shippingAddressZip].filter(Boolean).join(', ')}
              </Text>
            )}
            {order.shippingAddressCountry && <Text style={styles.addressLine}>{order.shippingAddressCountry}</Text>}
          </View>
        )}

        {/* Notes */}
        {(order.note || order.internalNote) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            {order.note && (
              <View style={styles.noteContainer}>
                <Text style={styles.noteLabel}>Customer Note:</Text>
                <Text style={styles.noteText}>{order.note}</Text>
              </View>
            )}
            {order.internalNote && (
              <View style={styles.noteContainer}>
                <Text style={styles.noteLabel}>Internal Note:</Text>
                <Text style={styles.noteText}>{order.internalNote}</Text>
              </View>
            )}
          </View>
        )}

        {/* Timestamps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          <InfoRow label="Created" value={formatOrderDate(order.createdAt)} />
          {order.completedAt && <InfoRow label="Completed" value={formatOrderDate(order.completedAt)} />}
          {order.paidAt && <InfoRow label="Paid" value={formatOrderDate(order.paidAt)} />}
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
    alignItems: 'center',
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
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#e0e0e0',
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
  },
  itemPricing: {
    alignItems: 'flex-end',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  addressLine: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
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

export default SalesOrderDetailScreen;
