import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useWarehouses } from '../WarehousesScreen/WarehousesScreenProvider';
import { useAuth } from '../../../providers';
import { warehouseApi, Warehouse, WarehouseAddRequest, INITIAL_WAREHOUSE } from '../../../services/warehouses';

interface WarehousesEditScreenProps {
  warehouse?: Warehouse | null;
  onSave: (warehouse: Warehouse) => void;
  onCancel: () => void;
}

const WarehousesEditScreen: React.FC<WarehousesEditScreenProps> = ({ warehouse, onSave, onCancel }) => {
  const { state, setLoading, setError, addWarehouse, updateWarehouse } = useWarehouses();
  const { user } = useAuth();
  const [formData, setFormData] = useState<WarehouseAddRequest>(INITIAL_WAREHOUSE);

  useEffect(() => {
    if (warehouse) {
      // Load existing warehouse data for editing
      setFormData({
        name: warehouse.name || null,
        code: warehouse.code || null,
        description: warehouse.description || null,
        addressId: warehouse.address?.id || null,
        supplierId: warehouse.supplier?.id || null,
        type: warehouse.type || null,
        content: warehouse.content || null,
        defaultLocationId: warehouse.defaultLocation?.id || undefined,
        defaultReceivingLocationId: warehouse.defaultReceivingLocation?.id || null,
        defaultScrapLocationId: warehouse.defaultScrapLocation?.id || null,
        itemType: warehouse.itemType || null,
        isNotAvailableForSale: warehouse.isNotAvailableForSale || false,
      });
    }
  }, [warehouse]);

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Validation
      if (!formData.name?.trim()) {
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

  const updateFormData = (field: keyof WarehouseAddRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (state.loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
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
              value={formData.name || ''}
              onChangeText={(value) => updateFormData('name', value)}
              placeholder="Enter warehouse name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Code</Text>
            <TextInput
              style={styles.textInput}
              value={formData.code || ''}
              onChangeText={(value) => updateFormData('code', value)}
              placeholder="Enter warehouse code"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.description || ''}
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
              value={formData.type || ''}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
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
    height: 44,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

export default WarehousesEditScreen;