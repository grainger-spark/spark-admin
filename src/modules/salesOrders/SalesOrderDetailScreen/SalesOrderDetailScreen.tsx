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
import {
  salesOrdersApi,
  workflowApi,
  SalesOrder,
  SalesOrderNavigationBar,
  formatOrderCurrency,
  formatOrderDate,
  getSalesOrderStatusConfig,
} from '../../../services/salesOrders';

interface SalesOrderDetailScreenProps {
  orderId: string;
  onEdit: (order: SalesOrder) => void;
  onDelete: (order: SalesOrder) => void;
  onBack: () => void;
  onManageWorkflow?: (order: SalesOrder) => void;
  onNavigateToPickList?: (pickListId: string) => void;
}

const SalesOrderDetailScreen: React.FC<SalesOrderDetailScreenProps> = ({
  orderId,
  onEdit,
  onDelete,
  onBack,
  onManageWorkflow,
  onNavigateToPickList,
}) => {
  const { state, setLoading, setError, setCurrentSalesOrder } = useSalesOrders();
  const { user } = useAuth();
  const [order, setOrder] = useState<SalesOrder | null>(null);
  const [navBar, setNavBar] = useState<SalesOrderNavigationBar | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    customer: false,
    shipping: false,
    billing: false,
    items: true, // Items expanded by default
  });

  const loadOrder = useCallback(async () => {
    try {
      setLoading(true);
      const orderData = await salesOrdersApi.getSalesOrder(orderId, user?.token, user?.tenantId);
      setOrder(orderData);
      setCurrentSalesOrder(orderData);

      // Load navigation bar data
      try {
        const navBarData = await workflowApi.status.getNavigationBar(orderId, user?.token, user?.tenantId);
        setNavBar(navBarData);
      } catch (navError) {
        console.log('Navigation bar not available:', navError);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load order');
    } finally {
      setLoading(false);
    }
  }, [orderId, setLoading, setError, setCurrentSalesOrder, user]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleIssue = async () => {
    if (!order || !user?.token || !user?.tenantId) return;

    try {
      setActionLoading(true);
      const updated = await workflowApi.approval.submitForApproval(
        order.id,
        user.token,
        user.tenantId
      );
      setOrder(updated);
      loadOrder();
    } catch (error) {
      console.error('Failed to issue order:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to issue order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!order || !user?.token || !user?.tenantId) return;

    try {
      setActionLoading(true);
      await workflowApi.approval.approveSalesOrder(
        order.id,
        user.token,
        user.tenantId
      );
      loadOrder();
    } catch (error) {
      console.error('Failed to approve order:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to approve order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartPicking = async () => {
    if (!order || !user?.token || !user?.tenantId) return;

    try {
      setActionLoading(true);
      
      // Get the pick list ID from the navigation bar
      if (navBar && navBar.pickListIds && navBar.pickListIds.length > 0) {
        const pickListId = navBar.pickListIds[0];
        
        if (onNavigateToPickList) {
          onNavigateToPickList(pickListId);
        } else {
          Alert.alert('Error', 'Navigation handler not available');
        }
      } else {
        Alert.alert('Error', 'No pick list found for this order. It may not have been created yet.');
      }
    } catch (error) {
      console.error('Failed to start picking:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to start picking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = () => {
    if (!order) return;

    Alert.alert(
      'Delete Order',
      `Delete order "${order.number}"?`,
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

  // Compact Progress Bar
  const ProgressBar = () => {
    if (!navBar) return null;

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressItem}>
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <Text style={styles.progressText}>{navBar.salesOrderItemQuantity} ordered</Text>
        </View>
        <View style={styles.progressLine} />
        <View style={styles.progressItem}>
          <View style={[styles.progressDot, navBar.pickedItemQuantity > 0 && styles.progressDotActive]} />
          <Text style={styles.progressText}>{navBar.pickedItemQuantity} picked</Text>
        </View>
        <View style={styles.progressLine} />
        <View style={styles.progressItem}>
          <View style={[styles.progressDot, navBar.shippedItemQuantity > 0 && styles.progressDotActive]} />
          <Text style={styles.progressText}>{navBar.shippedItemQuantity} shipped</Text>
        </View>
      </View>
    );
  };

  // Collapsible Section Component
  const CollapsibleSection: React.FC<{
    title: string;
    sectionKey: keyof typeof expandedSections;
    children: React.ReactNode;
  }> = ({ title, sectionKey, children }) => {
    const isExpanded = expandedSections[sectionKey];

    return (
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection(sectionKey)}
          activeOpacity={0.7}
        >
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionIcon}>{isExpanded ? '▼' : '▶'}</Text>
        </TouchableOpacity>
        {isExpanded && <View style={styles.sectionContent}>{children}</View>}
      </View>
    );
  };

  // Info Row Component
  const InfoRow: React.FC<{ label: string; value: string | number | null }> = ({ label, value }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>
        {value === null || value === undefined || value === '' ? '—' : String(value)}
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
        <TouchableOpacity style={styles.button} onPress={onBack}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusConfig = getSalesOrderStatusConfig(order.status || '');
  const isCreated = order.status === 'created' || order.status === 'Created';
  const isWaitingApproval = order.status === 'waitingApproval' || order.status === 'waitingapproval' || order.status === 'Waiting approval';
  const isPending = order.status === 'pending' || order.status === 'Pending';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => onEdit(order)} style={styles.headerIcon}>
            <Text style={styles.headerIconText}>✎</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.headerIcon}>
            <Text style={styles.headerIconText}>🗑</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Order Title & Status */}
      <View style={styles.titleSection}>
        <Text style={styles.orderNumber}>{order.number}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.color }]}>
          <Text style={styles.statusText}>{statusConfig.label}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <ProgressBar />

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Customer Info - Collapsible */}
        <CollapsibleSection title="Customer" sectionKey="customer">
          <InfoRow label="Name" value={order.customer?.name || order.customerName} />
          <InfoRow label="Email" value={order.customer?.email || order.customerEmail} />
          {order.store?.name && <InfoRow label="Fulfillment location" value={order.store.name} />}
        </CollapsibleSection>

        {/* Shipping Address - Collapsible */}
        <CollapsibleSection title="Shipping Address" sectionKey="shipping">
          {order.shippingAddressStreet1 ? (
            <>
              <Text style={styles.addressText}>{order.shippingAddressStreet1}</Text>
              {order.shippingAddressStreet2 && (
                <Text style={styles.addressText}>{order.shippingAddressStreet2}</Text>
              )}
              <Text style={styles.addressText}>
                {[order.shippingAddressCity, order.shippingAddressState, order.shippingAddressZip]
                  .filter(Boolean)
                  .join(', ')}
              </Text>
              {order.shippingAddressCountry && (
                <Text style={styles.addressText}>{order.shippingAddressCountry}</Text>
              )}
            </>
          ) : (
            <Text style={styles.emptyText}>No shipping address</Text>
          )}
        </CollapsibleSection>

        {/* Billing Address - Collapsible */}
        <CollapsibleSection title="Billing Address" sectionKey="billing">
          {order.billingAddressStreet1 ? (
            <>
              <Text style={styles.addressText}>{order.billingAddressStreet1}</Text>
              {order.billingAddressStreet2 && (
                <Text style={styles.addressText}>{order.billingAddressStreet2}</Text>
              )}
              <Text style={styles.addressText}>
                {[order.billingAddressCity, order.billingAddressState, order.billingAddressZip]
                  .filter(Boolean)
                  .join(', ')}
              </Text>
              {order.billingAddressCountry && (
                <Text style={styles.addressText}>{order.billingAddressCountry}</Text>
              )}
            </>
          ) : (
            <Text style={styles.emptyText}>No billing address</Text>
          )}
        </CollapsibleSection>

        {/* Items - Expanded by default */}
        <CollapsibleSection title={`Items (${order.items?.length || 0})`} sectionKey="items">
          {order.items && order.items.length > 0 ? (
            <>
              {order.items.map((item, index) => (
                <View key={item.id || index} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName}>{item.itemName || 'Unknown Item'}</Text>
                    <Text style={styles.itemPrice}>{formatOrderCurrency(item.total || 0)}</Text>
                  </View>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemDetail}>Qty: {item.quantity}</Text>
                    <Text style={styles.itemDetail}>
                      @ {formatOrderCurrency(item.unitPrice || 0)}
                    </Text>
                  </View>
                  {item.sku && <Text style={styles.itemSku}>SKU: {item.sku}</Text>}
                </View>
              ))}

              {/* Financial Summary */}
              <View style={styles.financialSummary}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>{formatOrderCurrency(order.totalAmountBeforeTax)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tax</Text>
                  <Text style={styles.summaryValue}>{formatOrderCurrency(order.taxAmount)}</Text>
                </View>
                <View style={[styles.summaryRow, styles.summaryTotal]}>
                  <Text style={styles.summaryTotalLabel}>Total</Text>
                  <Text style={styles.summaryTotalValue}>{formatOrderCurrency(order.totalAmount)}</Text>
                </View>
              </View>
            </>
          ) : (
            <Text style={styles.emptyText}>No items</Text>
          )}
        </CollapsibleSection>

        {/* Notes */}
        {(order.note || order.internalNote) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.sectionContent}>
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
          </View>
        )}

        {/* Bottom spacing for fixed button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom Action Button */}
      <View style={styles.bottomBar}>
        {isCreated ? (
          <TouchableOpacity
            style={[styles.primaryButton, actionLoading && styles.buttonDisabled]}
            onPress={handleIssue}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Issue Order</Text>
            )}
          </TouchableOpacity>
        ) : isWaitingApproval ? (
          <TouchableOpacity
            style={[styles.approveButton, actionLoading && styles.buttonDisabled]}
            onPress={handleApprove}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.approveButtonText}>Approve</Text>
            )}
          </TouchableOpacity>
        ) : isPending ? (
          <TouchableOpacity
            style={[styles.startPickingButton, actionLoading && styles.buttonDisabled]}
            onPress={handleStartPicking}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.startPickingButtonText}>Go to Picking</Text>
            )}
          </TouchableOpacity>
        ) : onManageWorkflow ? (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => onManageWorkflow(order)}
          >
            <Text style={styles.secondaryButtonText}>Manage Workflow</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
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
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIconText: {
    fontSize: 20,
  },
  titleSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  progressItem: {
    alignItems: 'center',
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#D0D0D0',
    marginBottom: 6,
  },
  progressDotActive: {
    backgroundColor: '#007AFF',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: '#D0D0D0',
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    backgroundColor: '#FAFAFA',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  sectionIcon: {
    fontSize: 14,
    color: '#666',
  },
  sectionContent: {
    padding: 18,
    paddingTop: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  infoLabel: {
    fontSize: 15,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 15,
    color: '#000',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  addressText: {
    fontSize: 15,
    color: '#000',
    lineHeight: 22,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
    fontStyle: 'italic',
  },
  itemCard: {
    padding: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    marginRight: 12,
  },
  itemPrice: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
  },
  itemDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 4,
  },
  itemDetail: {
    fontSize: 14,
    color: '#666',
  },
  itemSku: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  financialSummary: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#666',
  },
  summaryValue: {
    fontSize: 15,
    color: '#000',
    fontWeight: '500',
  },
  summaryTotal: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#000',
  },
  summaryTotalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  noteContainer: {
    marginBottom: 16,
  },
  noteLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  noteText: {
    fontSize: 15,
    color: '#000',
    lineHeight: 22,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  primaryButton: {
    backgroundColor: '#00A3E0',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  approveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  startPickingButton: {
    backgroundColor: '#5856D6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startPickingButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default SalesOrderDetailScreen;
