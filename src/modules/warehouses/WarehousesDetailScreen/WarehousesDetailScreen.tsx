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
import { useWarehouses } from '../WarehousesScreen/WarehousesScreenProvider';
import { useAuth } from '../../../providers';
import { warehouseApi, Warehouse } from '../../../services/warehouses';

interface WarehousesDetailScreenProps {
  warehouseId: string;
  onEdit: (warehouse: Warehouse) => void;
  onDelete: (warehouse: Warehouse) => void;
  onBack: () => void;
}

const WarehousesDetailScreen: React.FC<WarehousesDetailScreenProps> = ({
  warehouseId,
  onEdit,
  onDelete,
  onBack,
}) => {
  const { state, setLoading, setError, setCurrentWarehouse } = useWarehouses();
  const { user } = useAuth();
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);

  const loadWarehouse = useCallback(async () => {
    try {
      setLoading(true);
      const warehouseData = await warehouseApi.getWarehouse(warehouseId, user?.token, user?.tenantId);
      setWarehouse(warehouseData);
      setCurrentWarehouse(warehouseData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load warehouse');
    } finally {
      setLoading(false);
    }
  }, [warehouseId, setLoading, setError, setCurrentWarehouse, user]);

  useEffect(() => {
    loadWarehouse();
  }, [loadWarehouse]);

  const handleDelete = () => {
    if (!warehouse) return;
    
    Alert.alert(
      'Delete Warehouse',
      `Are you sure you want to delete "${warehouse.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(warehouse),
        },
      ]
    );
  };

  const InfoRow: React.FC<{ label: string; value: string | number | null | undefined }> = ({ label, value }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || 'N/A'}</Text>
    </View>
  );

  if (state.loading && !warehouse) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading warehouse...</Text>
      </View>
    );
  }

  if (state.error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{state.error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadWarehouse}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!warehouse) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Warehouse not found</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onBack}>
          <Text style={styles.retryButtonText}>Go Back</Text>
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
            onPress={() => onEdit(warehouse)}
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
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <InfoRow label="Name" value={warehouse.name} />
          <InfoRow label="Code" value={warehouse.code} />
          <InfoRow label="Description" value={warehouse.description} />
          <InfoRow label="Type" value={warehouse.type} />
          <InfoRow label="ID" value={warehouse.id} />
        </View>

        {/* Location Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location Information</Text>
          <InfoRow label="Default Location" value={warehouse.defaultLocation?.name} />
          <InfoRow label="Packaging Location" value={warehouse.packagingLocation?.name} />
          <InfoRow label="Receiving Location" value={warehouse.defaultReceivingLocation?.name} />
        </View>

        {/* Business Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Information</Text>
          <InfoRow label="Supplier" value={warehouse.supplier?.name} />
          <InfoRow label="Item Type" value={warehouse.itemType} />
          <InfoRow label="Not Available for Sale" value={warehouse.isNotAvailableForSale ? 'Yes' : 'No'} />
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
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ff3b30',
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 2,
    textAlign: 'right',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WarehousesDetailScreen;