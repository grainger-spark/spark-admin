import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { usePurchaseOrders } from '../PurchaseOrdersScreen/PurchaseOrdersScreenProvider';
import { useAuth } from '../../../providers';
import { purchaseOrdersApi, PurchaseOrderResponse, formatPOCurrency, formatPODate, PURCHASE_ORDER_STATUSES } from '../../../services/purchaseOrders';

interface PurchaseOrdersListScreenProps {
  onOrderPress: (order: PurchaseOrderResponse) => void;
  onAddOrder: () => void;
}

const PurchaseOrdersListScreen: React.FC<PurchaseOrdersListScreenProps> = ({ onOrderPress, onAddOrder }) => {
  const { state, setLoading, setError, setPurchaseOrders, setSearchQuery } = usePurchaseOrders();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const loadPurchaseOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: state.pagination.page,
        pageSize: state.pagination.pageSize,
        search: state.searchQuery || undefined,
        ...state.filters,
      };
      const response = await purchaseOrdersApi.getPurchaseOrders(params, user?.token, user?.tenantId);
      setPurchaseOrders(response.data || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load purchase orders');
    } finally {
      setLoading(false);
    }
  }, [state.pagination.page, state.pagination.pageSize, state.searchQuery, state.filters, setPurchaseOrders, setLoading, setError, user]);

  useEffect(() => {
    loadPurchaseOrders();
  }, [loadPurchaseOrders]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPurchaseOrders();
    setRefreshing(false);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const getStatusColor = (status: string | null) => {
    const statusConfig = PURCHASE_ORDER_STATUSES.find(s => s.value === status);
    return statusConfig?.color || '#999';
  };

  const renderOrder = ({ item }: { item: PurchaseOrderResponse }) => (
    <TouchableOpacity
      style={styles.orderItem}
      onPress={() => onOrderPress(item)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>{item.number || 'No PO #'}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status || 'Draft'}</Text>
        </View>
      </View>
      
      {item.supplier && (
        <Text style={styles.supplierName}>{item.supplier.name}</Text>
      )}
      
      {item.destinationWarehouse && (
        <Text style={styles.warehouseName}>→ {item.destinationWarehouse.name}</Text>
      )}
      
      <View style={styles.orderDetails}>
        <Text style={styles.orderDate}>{formatPODate(item.createdAt)}</Text>
        <Text style={styles.orderTotal}>{formatPOCurrency(item.totalAmount)}</Text>
      </View>
      
      {item.items && item.items.length > 0 && (
        <Text style={styles.itemCount}>{item.items.length} item(s)</Text>
      )}

      {/* Status Indicators */}
      <View style={styles.indicators}>
        {item.isApproved && <Text style={styles.indicator}>✓ Approved</Text>}
        {item.isIssued && <Text style={styles.indicator}>✓ Issued</Text>}
        {item.isReceived && <Text style={styles.indicator}>✓ Received</Text>}
      </View>
    </TouchableOpacity>
  );

  if (state.loading && state.purchaseOrders.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading purchase orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search orders..."
          value={state.searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#999"
        />
      </View>

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={onAddOrder}>
        <Text style={styles.addButtonText}>+ New Purchase Order</Text>
      </TouchableOpacity>

      {/* Error Message */}
      {state.error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{state.error}</Text>
        </View>
      )}

      {/* Orders List */}
      <FlatList
        data={state.purchaseOrders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#007AFF"
          />
        }
        ListEmptyComponent={
          !state.loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No purchase orders found</Text>
              <Text style={styles.emptySubtext}>Create your first purchase order to get started</Text>
            </View>
          ) : null
        }
      />
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
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  addButton: {
    margin: 16,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    margin: 16,
    padding: 12,
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
  },
  orderItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  supplierName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
    fontWeight: '500',
  },
  warehouseName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  itemCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  indicators: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  indicator: {
    fontSize: 11,
    color: '#34C759',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});

export default PurchaseOrdersListScreen;
