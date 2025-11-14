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
import { useSalesOrders } from '../SalesOrdersScreen/SalesOrdersScreenProvider';
import { useAuth } from '../../../providers';
import { salesOrdersApi, SalesOrder, formatOrderCurrency, formatOrderDate, SALES_ORDER_STATUSES } from '../../../services/salesOrders';

interface SalesOrdersListScreenProps {
  onOrderPress: (order: SalesOrder) => void;
  onAddOrder: () => void;
}

const SalesOrdersListScreen: React.FC<SalesOrdersListScreenProps> = ({ onOrderPress, onAddOrder }) => {
  const { state, setLoading, setError, setSalesOrders, setSearchQuery } = useSalesOrders();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const loadSalesOrders = useCallback(async (page = 1, search = '') => {
    try {
      setLoading(true);
      const params = {
        Page: page,
        PageSize: state.pagination.pageSize,
        Search: search || undefined,
        ...state.filters,
      };
      
      if (!user?.token || !user?.tenantId) {
        setError('Authentication required. Please log in again.');
        return;
      }
      
      const response = await salesOrdersApi.getSalesOrders(params, user?.token, user?.tenantId);
      setSalesOrders(response);
    } catch (error) {
      console.error('Failed to load sales orders:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load sales orders';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [state.filters, state.pagination.pageSize, setLoading, setSalesOrders, setError, user]);

  useEffect(() => {
    loadSalesOrders(1, state.searchQuery);
  }, [state.filters, state.searchQuery, loadSalesOrders]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadSalesOrders(1, state.searchQuery);
  };

  const getStatusColor = (status: string | null) => {
    const statusConfig = SALES_ORDER_STATUSES.find(s => s.value === status);
    return statusConfig?.color || '#999';
  };

  const renderOrder = ({ item }: { item: SalesOrder }) => (
    <TouchableOpacity
      style={styles.orderItem}
      onPress={() => onOrderPress(item)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>{item.number || 'No Order #'}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status || 'Draft'}</Text>
        </View>
      </View>
      
      {(item.customer?.name || item.customerName) && (
        <Text style={styles.customerName}>{item.customer?.name || item.customerName}</Text>
      )}
      
      <View style={styles.orderDetails}>
        <Text style={styles.orderDate}>{formatOrderDate(item.createdAt)}</Text>
        <Text style={styles.orderTotal}>{formatOrderCurrency(item.totalAmount)}</Text>
      </View>
      
      {item.items && item.items.length > 0 && (
        <Text style={styles.itemCount}>{item.items.length} item(s)</Text>
      )}
    </TouchableOpacity>
  );

  if (state.loading && state.salesOrders.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading sales orders...</Text>
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
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={onAddOrder}>
        <Text style={styles.addButtonText}>+ New Order</Text>
      </TouchableOpacity>

      {/* Error State */}
      {state.error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{state.error}</Text>
        </View>
      )}

      {/* List */}
      <FlatList
        data={state.salesOrders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          !state.loading && !state.error ? (
            <Text style={styles.emptyText}>No sales orders found</Text>
          ) : null
        }
        contentContainerStyle={styles.listContent}
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
    backgroundColor: '#f5f5f5',
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
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  orderItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
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
  customerName: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 8,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  itemCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 32,
  },
});

export default SalesOrdersListScreen;
