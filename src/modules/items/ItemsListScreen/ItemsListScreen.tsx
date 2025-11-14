import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useItems } from '../ItemsScreen/ItemsScreenProvider';
import { useAuth } from '../../../providers';
import { itemsApi, Item } from '../../../services/items';

interface ItemsListScreenProps {
  onItemPress: (item: Item) => void;
  onAddItem: () => void;
}

const ItemsListScreen: React.FC<ItemsListScreenProps> = ({ onItemPress, onAddItem }) => {
  const { state, setLoading, setError, setItems, setSearchQuery } = useItems();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const loadItems = useCallback(async (page = 1, search = '') => {
    try {
      setLoading(true);
      const params = {
        Page: page,
        PageSize: state.pagination.pageSize,
        Search: search || undefined,
        ...state.filters,
      };
      const response = await itemsApi.getItems(params, user?.token, user?.tenantId);
      setItems(response);
    } catch (error) {
      console.error('Failed to load items:', error);
      setError(error instanceof Error ? error.message : 'Failed to load items');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [state.filters, state.pagination.pageSize, setLoading, setItems, setError, user]);

  useEffect(() => {
    loadItems(1, state.searchQuery);
  }, [state.filters, state.searchQuery, loadItems]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadItems(1, state.searchQuery);
  };

  const handleLoadMore = () => {
    if (state.pagination.hasNext && !state.loading) {
      loadItems(state.pagination.currentPage + 1, state.searchQuery);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => onItemPress(item)}
    >
      <View style={styles.itemHeader}>
        <Text style={styles.itemName}>{item.name || 'Unnamed Item'}</Text>
        <Text style={styles.itemSku}>{item.sku}</Text>
      </View>
      
      <View style={styles.itemDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Available:</Text>
          <Text style={styles.detailValue}>{item.available}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Price:</Text>
          <Text style={styles.detailValue}>${item.price.toFixed(2)}</Text>
        </View>
      </View>
      
      {item.description && (
        <Text style={styles.itemDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}
      
      <View style={styles.itemFooter}>
        <Text style={styles.itemType}>{item.type}</Text>
        {item.reorder && (
          <Text style={styles.reorderIndicator}>Reorder</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No Items Found</Text>
      <Text style={styles.emptyStateMessage}>
        {state.searchQuery 
          ? 'Try adjusting your search or filters'
          : 'Get started by adding your first item'
        }
      </Text>
      {!state.searchQuery && (
        <TouchableOpacity style={styles.addButton} onPress={onAddItem}>
          <Text style={styles.addButtonText}>Add First Item</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (state.loading && state.items.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading items...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search items..."
          value={state.searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Items List */}
      <FlatList
        data={state.items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Add Item Button */}
      <TouchableOpacity style={styles.floatingAddButton} onPress={onAddItem}>
        <Text style={styles.floatingAddButtonText}>+</Text>
      </TouchableOpacity>
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
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  itemContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    flex: 1,
    color: '#333',
  },
  itemSku: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemType: {
    fontSize: 12,
    color: '#007AFF',
    backgroundColor: '#e6f4fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  reorderIndicator: {
    fontSize: 12,
    color: '#ff9500',
    backgroundColor: '#fff3e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  floatingAddButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
});

export default ItemsListScreen;
