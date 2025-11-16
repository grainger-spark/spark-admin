import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { usePickList } from './PickListProvider';
import { useAuth } from '../../providers';
import {
  workflowApi,
  PickList,
  getPickListStatusConfig,
  getPriorityConfig,
  formatDateTime,
} from '../../services/salesOrders';

interface PickListsScreenProps {
  onPickListPress: (pickList: PickList) => void;
}

export const PickListsScreen: React.FC<PickListsScreenProps> = ({ onPickListPress }) => {
  const { state, setLoading, setError, setPickLists } = usePickList();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const loadPickLists = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!user?.token || !user?.tenantId) {
        setError('Authentication required. Please log in again.');
        return;
      }
      
      const response = await workflowApi.pickList.getPickLists(
        state.filters,
        user.token,
        user.tenantId
      );
      setPickLists(response);
    } catch (error) {
      console.error('Failed to load pick lists:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load pick lists';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [state.filters, setLoading, setPickLists, setError, user]);

  useEffect(() => {
    loadPickLists();
  }, [loadPickLists]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadPickLists();
  };

  const renderPickList = ({ item }: { item: PickList }) => {
    const statusConfig = getPickListStatusConfig(item.status);
    const priorityConfig = getPriorityConfig(item.priority);
    
    const totalItems = item.items.reduce((sum, i) => sum + i.quantityToPick, 0);
    const collectedItems = item.items.reduce((sum, i) => sum + i.quantityCollected, 0);
    const progress = totalItems > 0 ? Math.round((collectedItems / totalItems) * 100) : 0;

    return (
      <TouchableOpacity
        style={styles.pickListItem}
        onPress={() => onPickListPress(item)}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.number}>{item.number}</Text>
            {item.priority === 'high' && (
              <View style={[styles.priorityBadge, { backgroundColor: priorityConfig.color }]}>
                <Text style={styles.priorityText}>HIGH</Text>
              </View>
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.color }]}>
            <Text style={styles.statusText}>{statusConfig.label}</Text>
          </View>
        </View>

        {item.salesOrderNumber && (
          <Text style={styles.salesOrder}>SO: {item.salesOrderNumber}</Text>
        )}

        {item.warehouse && (
          <Text style={styles.warehouse}>{item.warehouse.name}</Text>
        )}

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {collectedItems} / {totalItems} items ({progress}%)
          </Text>
        </View>

        {item.pickerName && (
          <Text style={styles.picker}>Picker: {item.pickerName}</Text>
        )}

        <Text style={styles.date}>Created: {formatDateTime(item.createdAt)}</Text>
      </TouchableOpacity>
    );
  };

  if (state.loading && state.pickLists.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading pick lists...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {state.error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{state.error}</Text>
        </View>
      )}

      <FlatList
        data={state.pickLists}
        renderItem={renderPickList}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          !state.loading && !state.error ? (
            <Text style={styles.emptyText}>No pick lists found</Text>
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
    backgroundColor: '#FF3B30',
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  pickListItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  number: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
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
    marginBottom: 8,
  },
  progressContainer: {
    marginVertical: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  picker: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 32,
  },
});
