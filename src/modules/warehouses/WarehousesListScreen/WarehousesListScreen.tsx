import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useWarehouses } from '../WarehousesScreen/WarehousesScreenProvider';
import { useAuth } from '../../../providers';
import { warehouseApi, Warehouse } from '../../../services/warehouses';

interface WarehousesListScreenProps {
  onWarehousePress: (warehouse: Warehouse) => void;
  onAddWarehouse: () => void;
}

const WarehousesListScreen: React.FC<WarehousesListScreenProps> = ({ onWarehousePress, onAddWarehouse }) => {
  const { state, setLoading, setError, setWarehouses, setSearchQuery } = useWarehouses();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const loadWarehouses = useCallback(async (page = 1, search = '') => {
    try {
      setLoading(true);
      const params = {
        Page: page,
        PageSize: state.pagination.pageSize,
        Search: search || undefined,
        ...state.filters,
      };
      
      // Check if user is authenticated before making API call
      if (!user?.token || !user?.tenantId) {
        setError('Authentication required. Please log in again.');
        return;
      }
      
      const response = await warehouseApi.getWarehouses(params, user?.token, user?.tenantId);
      setWarehouses(response);
    } catch (error) {
      console.error('Failed to load warehouses:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load warehouses';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [state.filters, state.pagination.pageSize, setLoading, setWarehouses, setError, user]);

  useEffect(() => {
    loadWarehouses(1, state.searchQuery);
  }, [state.filters, state.searchQuery, loadWarehouses]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadWarehouses(1, state.searchQuery);
  };

  const renderWarehouse = ({ item }: { item: Warehouse }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => onWarehousePress(item)}
    >
      <Text style={styles.itemName}>{item.name}</Text>
      {item.description && (
        <Text style={styles.itemDescription}>{item.description}</Text>
      )}
      {item.code && (
        <Text style={styles.itemCode}>Code: {item.code}</Text>
      )}
      <Text style={styles.itemDate}>
        Type: {item.type || 'N/A'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search warehouses..."
          value={state.searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={onAddWarehouse}>
        <Text style={styles.addButtonText}>+ Add Warehouse</Text>
      </TouchableOpacity>

      {/* List */}
      <FlatList
        data={state.warehouses}
        renderItem={renderWarehouse}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          !state.loading ? (
            <Text style={styles.emptyText}>No warehouses found</Text>
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
    backgroundColor: '#f9f9f9',
  },
  addButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  itemContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  itemCode: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 50,
    fontSize: 16,
  },
});

export default WarehousesListScreen;