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
import { useLocations } from '../LocationsScreen/LocationsScreenProvider';
import { useAuth } from '../../../providers';
import { locationApi, Location } from '../../../services/locations';

interface LocationDetailScreenProps {
  locationId: string;
  onEdit: (location: Location) => void;
  onDelete: (location: Location) => void;
  onBack: () => void;
}

const LocationDetailScreen: React.FC<LocationDetailScreenProps> = ({
  locationId,
  onEdit,
  onDelete,
  onBack,
}) => {
  const { state, setLoading, setError, setCurrentLocation } = useLocations();
  const { user } = useAuth();
  const [location, setLocation] = useState<Location | null>(null);

  const loadLocation = useCallback(async () => {
    try {
      setLoading(true);
      const locationData = await locationApi.getLocation(locationId, user?.token, user?.tenantId);
      setLocation(locationData);
      setCurrentLocation(locationData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load location');
    } finally {
      setLoading(false);
    }
  }, [locationId, setLoading, setError, setCurrentLocation, user]);

  useEffect(() => {
    loadLocation();
  }, [loadLocation]);

  const handleDelete = () => {
    if (!location) return;
    
    Alert.alert(
      'Delete Location',
      `Are you sure you want to delete "${location.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(location),
        },
      ]
    );
  };

  const InfoRow: React.FC<{ label: string; value: string | number | boolean | null }> = ({ label, value }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>
        {value === null || value === undefined ? 'N/A' : String(value)}
      </Text>
    </View>
  );

  if (state.loading && !location) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading location...</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Location not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
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
            onPress={() => onEdit(location)}
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
          <InfoRow label="Name" value={location.name} />
          <InfoRow label="Code" value={location.code} />
          <InfoRow label="Description" value={location.description} />
          <InfoRow label="Type" value={location.type} />
          <InfoRow label="Barcode" value={location.barcode} />
        </View>

        {/* Warehouse Information */}
        {location.warehouse && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Warehouse</Text>
            <InfoRow label="Name" value={location.warehouse.name} />
            <InfoRow label="Code" value={location.warehouse.code} />
          </View>
        )}

        {/* Capabilities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Capabilities</Text>
          <InfoRow label="Pickable" value={location.isPickable ? 'Yes' : 'No'} />
          <InfoRow label="Receivable" value={location.isReceivable ? 'Yes' : 'No'} />
          <InfoRow label="Shippable" value={location.isShippable ? 'Yes' : 'No'} />
          <InfoRow label="Active" value={location.isActive ? 'Yes' : 'No'} />
          <InfoRow label="Sort Order" value={location.sortOrder} />
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#FF3B30',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
});

export default LocationDetailScreen;
