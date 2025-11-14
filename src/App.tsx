import React, { useEffect, useState, useCallback } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, TextInput, RefreshControl, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from './providers';
import { LoginScreen, LoginScreenProvider } from './modules/auth/LoginScreen';
import { ChatScreen, ChatScreenProvider } from './modules/chat/ChatScreen';
import { NotificationsScreen, NotificationsScreenProvider } from './modules/notifications/NotificationsScreen';
import { ProfileScreen, ProfileScreenProvider } from './modules/profile/ProfileScreen';
import { 
  ItemsProvider, 
  ItemsListScreen, 
  ItemDetailScreen, 
  ItemEditScreen 
} from './modules/items';
import { 
  WarehousesProvider,
  useWarehouses,
  WarehousesDetailScreen 
} from './modules/warehouses';
import { warehouseApi, Warehouse } from './services/warehouses';
import {
  LocationsProvider,
  LocationsListScreen,
  LocationDetailScreen,
  LocationEditScreen
} from './modules/locations';
import { locationApi, Location } from './services/locations';
import { colors } from './theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const ChatTab = () => (
  <ChatScreenProvider>
    <ChatScreen />
  </ChatScreenProvider>
);

const NotificationsTab = () => (
  <NotificationsScreenProvider>
    <NotificationsScreen />
  </NotificationsScreenProvider>
);

const ProfileTab = () => (
  <ProfileScreenProvider>
    <ProfileScreen />
  </ProfileScreenProvider>
);

const ItemsTab = () => {
  const [currentScreen, setCurrentScreen] = React.useState<'list' | 'detail' | 'edit'>('list');
  const [selectedItem, setSelectedItem] = React.useState<any>(null);

  const handleItemPress = (item: any) => {
    setSelectedItem(item);
    setCurrentScreen('detail');
  };

  const handleAddItem = () => {
    setSelectedItem(null);
    setCurrentScreen('edit');
  };

  const handleEditItem = (item: any) => {
    setSelectedItem(item);
    setCurrentScreen('edit');
  };

  const handleSaveItem = () => {
    setCurrentScreen('list');
    setSelectedItem(null);
  };

  const handleCancelEdit = () => {
    setCurrentScreen('list');
    setSelectedItem(null);
  };

  const handleBack = () => {
    setCurrentScreen('list');
    setSelectedItem(null);
  };

  return (
    <ItemsProvider>
      {currentScreen === 'list' && (
        <ItemsListScreen
          onItemPress={handleItemPress}
          onAddItem={handleAddItem}
        />
      )}
      {currentScreen === 'detail' && selectedItem && (
        <ItemDetailScreen
          itemId={selectedItem.id}
          onEdit={handleEditItem}
          onDelete={() => {}}
          onBack={handleBack}
        />
      )}
      {currentScreen === 'edit' && (
        <ItemEditScreen
          item={selectedItem}
          onSave={handleSaveItem}
          onCancel={handleCancelEdit}
        />
      )}
    </ItemsProvider>
  );
};

const WarehouseListScreen = ({ onWarehousePress, onAddWarehouse }: any) => {
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
      style={styles.warehouseItem}
      onPress={() => onWarehousePress(item)}
    >
      <Text style={styles.warehouseName}>{item.name}</Text>
      {item.description && (
        <Text style={styles.warehouseDescription}>{item.description}</Text>
      )}
      {item.code && (
        <Text style={styles.warehouseCode}>Code: {item.code}</Text>
      )}
      <Text style={styles.warehouseType}>
        Type: {item.type || 'N/A'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Loading State */}
      {state.loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading warehouses...</Text>
        </View>
      )}

      {/* Error State */}
      {state.error && !state.loading && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{state.error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => loadWarehouses(1, state.searchQuery)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      {!state.loading && !state.error && (
        <>
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
              <Text style={styles.emptyText}>No warehouses found</Text>
            }
          />
        </>
      )}
    </View>
  );
};

const WarehouseEditScreen = ({ warehouse, onSave, onCancel }: any) => {
  const { state, setLoading, setError, addWarehouse, updateWarehouse } = useWarehouses();
  const { user } = useAuth();
  const [formData, setFormData] = React.useState({
    name: warehouse?.name || '',
    code: warehouse?.code || '',
    description: warehouse?.description || '',
    type: warehouse?.type || '',
  });

  React.useEffect(() => {
    if (warehouse) {
      setFormData({
        name: warehouse.name || '',
        code: warehouse.code || '',
        description: warehouse.description || '',
        type: warehouse.type || '',
      });
    }
  }, [warehouse]);

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Validation
      if (!formData.name.trim()) {
        Alert.alert('Validation Error', 'Warehouse name is required');
        return;
      }

      let savedWarehouse: Warehouse;
      
      if (warehouse) {
        // Update existing warehouse
        savedWarehouse = await warehouseApi.updateWarehouse(warehouse.id, formData, user?.token, user?.tenantId);
        updateWarehouse(savedWarehouse);
      } else {
        // Create new warehouse
        savedWarehouse = await warehouseApi.createWarehouse(formData, user?.token, user?.tenantId);
        addWarehouse(savedWarehouse);
      }
      
      onSave(savedWarehouse);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save warehouse');
      Alert.alert('Error', 'Failed to save warehouse. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (state.loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Saving warehouse...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{warehouse ? 'Edit' : 'New'} Warehouse</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Form */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Name *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
              placeholder="Enter warehouse name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Code</Text>
            <TextInput
              style={styles.textInput}
              value={formData.code}
              onChangeText={(value) => updateFormData('code', value)}
              placeholder="Enter warehouse code"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
              placeholder="Enter warehouse description"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Type</Text>
            <TextInput
              style={styles.textInput}
              value={formData.type}
              onChangeText={(value) => updateFormData('type', value)}
              placeholder="Enter warehouse type"
              placeholderTextColor="#999"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const WarehousesTab = () => {
  const [currentScreen, setCurrentScreen] = React.useState<'list' | 'detail' | 'edit'>('list');
  const [selectedWarehouse, setSelectedWarehouse] = React.useState<Warehouse | null>(null);

  const handleWarehousePress = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setCurrentScreen('detail');
  };

  const handleAddWarehouse = () => {
    setSelectedWarehouse(null);
    setCurrentScreen('edit');
  };

  const handleEditWarehouse = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setCurrentScreen('edit');
  };

  const handleSaveWarehouse = () => {
    setCurrentScreen('list');
    setSelectedWarehouse(null);
  };

  const handleCancelEdit = () => {
    setCurrentScreen('list');
    setSelectedWarehouse(null);
  };

  const handleBack = () => {
    setCurrentScreen('list');
    setSelectedWarehouse(null);
  };

  const handleDeleteWarehouse = (warehouse: Warehouse) => {
    // Handle delete - for now just go back to list
    // In a real app, you'd show confirmation and call delete API
    setCurrentScreen('list');
    setSelectedWarehouse(null);
  };

  return (
    <WarehousesProvider>
      {currentScreen === 'list' && (
        <WarehouseListScreen
          onWarehousePress={handleWarehousePress}
          onAddWarehouse={handleAddWarehouse}
        />
      )}
      {currentScreen === 'detail' && selectedWarehouse && (
        <WarehousesDetailScreen
          warehouseId={selectedWarehouse.id}
          onEdit={handleEditWarehouse}
          onDelete={handleDeleteWarehouse}
          onBack={handleBack}
        />
      )}
      {currentScreen === 'edit' && (
        <WarehouseEditScreen
          warehouse={selectedWarehouse}
          onSave={handleSaveWarehouse}
          onCancel={handleCancelEdit}
        />
      )}
    </WarehousesProvider>
  );
};

const LocationsTab = () => {
  const [currentScreen, setCurrentScreen] = React.useState<'list' | 'detail' | 'edit'>('list');
  const [selectedLocation, setSelectedLocation] = React.useState<Location | null>(null);

  const handleLocationPress = (location: Location) => {
    setSelectedLocation(location);
    setCurrentScreen('detail');
  };

  const handleAddLocation = () => {
    setSelectedLocation(null);
    setCurrentScreen('edit');
  };

  const handleEditLocation = (location: Location) => {
    setSelectedLocation(location);
    setCurrentScreen('edit');
  };

  const handleSaveLocation = () => {
    setCurrentScreen('list');
    setSelectedLocation(null);
  };

  const handleCancelEdit = () => {
    setCurrentScreen('list');
    setSelectedLocation(null);
  };

  const handleBack = () => {
    setCurrentScreen('list');
    setSelectedLocation(null);
  };

  const handleDeleteLocation = (location: Location) => {
    setCurrentScreen('list');
    setSelectedLocation(null);
  };

  return (
    <LocationsProvider>
      {currentScreen === 'list' && (
        <LocationsListScreen
          onLocationPress={handleLocationPress}
          onAddLocation={handleAddLocation}
        />
      )}
      {currentScreen === 'detail' && selectedLocation && (
        <LocationDetailScreen
          locationId={selectedLocation.id}
          onEdit={handleEditLocation}
          onDelete={handleDeleteLocation}
          onBack={handleBack}
        />
      )}
      {currentScreen === 'edit' && (
        <LocationEditScreen
          location={selectedLocation}
          onSave={handleSaveLocation}
          onCancel={handleCancelEdit}
        />
      )}
    </LocationsProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    margin: 16,
    marginBottom: 8,
  },
  searchInput: {
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  addButton: {
    margin: 16,
    marginBottom: 8,
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
  warehouseItem: {
    margin: 16,
    marginBottom: 8,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  warehouseName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  warehouseDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  warehouseCode: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  warehouseType: {
    fontSize: 12,
    color: '#999',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 50,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Edit Screen Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  saveButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
});

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray400,
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Items"
        component={ItemsTab}
        options={{
          title: 'Items',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Warehouses"
        component={WarehousesTab}
        options={{
          title: 'Warehouses',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="business" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Locations"
        component={LocationsTab}
        options={{
          title: 'Locations',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="location" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatTab}
        options={{
          title: '✨ SPARK Chat',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsTab}
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileTab}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const LoginScreenWithProvider = () => (
  <LoginScreenProvider>
    <LoginScreen />
  </LoginScreenProvider>
);

const AppNavigator = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Login" component={LoginScreenWithProvider} />
      ) : (
        <Stack.Screen name="Main" component={MainTabs} />
      )}
    </Stack.Navigator>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
};
