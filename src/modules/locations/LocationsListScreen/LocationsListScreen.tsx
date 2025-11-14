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
import { useLocations } from '../LocationsScreen/LocationsScreenProvider';
import { useAuth } from '../../../providers';
import { locationApi, Location } from '../../../services/locations';

interface LocationsListScreenProps {
  onLocationPress: (location: Location) => void;
  onAddLocation: () => void;
}

const LocationsListScreen: React.FC<LocationsListScreenProps> = ({ onLocationPress, onAddLocation }) => {
  const { state, setLoading, setError, setLocations, setSearchQuery } = useLocations();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const loadLocations = useCallback(async (page = 1, search = '') => {
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
      
      const response = await locationApi.getLocations(params, user?.token, user?.tenantId);
      setLocations(response);
    } catch (error) {
      console.error('Failed to load locations:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load locations';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [state.filters, state.pagination.pageSize, setLoading, setLocations, setError, user]);

  useEffect(() => {
    loadLocations(1, state.searchQuery);
  }, [state.filters, state.searchQuery, loadLocations]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadLocations(1, state.searchQuery);
  };

  const renderLocation = ({ item }: { item: Location }) => (
    <TouchableOpacity
      style={styles.locationItem}
      onPress={() => onLocationPress(item)}
    >
      <View style={styles.locationHeader}>
        <Text style={styles.locationName}>{item.name || 'Unnamed Location'}</Text>
        {item.code && <Text style={styles.locationCode}>{item.code}</Text>}
      </View>
      
      {item.warehouse && (
        <Text style={styles.locationWarehouse}>
          Warehouse: {item.warehouse.name}
        </Text>
      )}
      
      {item.description && (
        <Text style={styles.locationDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}
      
      <View style={styles.locationFooter}>
        {item.type && <Text style={styles.locationType}>{item.type}</Text>}
        <View style={styles.statusBadges}>
          {item.isPickable && <Text style={styles.badge}>Pickable</Text>}
          {item.isReceivable && <Text style={styles.badge}>Receivable</Text>}
          {item.isShippable && <Text style={styles.badge}>Shippable</Text>}
          {!item.isActive && <Text style={[styles.badge, styles.inactiveBadge]}>Inactive</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (state.loading && state.locations.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading locations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search locations..."
          value={state.searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={onAddLocation}>
        <Text style={styles.addButtonText}>+ Add Location</Text>
      </TouchableOpacity>

      {/* Error State */}
      {state.error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{state.error}</Text>
        </View>
      )}

      {/* List */}
      <FlatList
        data={state.locations}
        renderItem={renderLocation}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          !state.loading && !state.error ? (
            <Text style={styles.emptyText}>No locations found</Text>
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
  locationItem: {
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
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  locationCode: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  locationWarehouse: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4,
  },
  locationDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  locationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  locationType: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusBadges: {
    flexDirection: 'row',
    gap: 4,
  },
  badge: {
    fontSize: 10,
    color: '#fff',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  inactiveBadge: {
    backgroundColor: '#999',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 32,
  },
});

export default LocationsListScreen;
