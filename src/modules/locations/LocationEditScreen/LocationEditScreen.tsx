import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { useLocations } from '../LocationsScreen/LocationsScreenProvider';
import { useAuth } from '../../../providers';
import { locationApi, Location, LocationAddRequest, INITIAL_LOCATION } from '../../../services/locations';

interface LocationEditScreenProps {
  location?: Location | null;
  onSave: (location: Location) => void;
  onCancel: () => void;
}

const LocationEditScreen: React.FC<LocationEditScreenProps> = ({ location, onSave, onCancel }) => {
  const { state, setLoading, setError, addLocation, updateLocation } = useLocations();
  const { user } = useAuth();
  const [formData, setFormData] = useState<LocationAddRequest>(INITIAL_LOCATION);

  useEffect(() => {
    if (location) {
      setFormData({
        name: location.name || null,
        code: location.code || null,
        description: location.description || null,
        warehouseId: location.warehouse?.id || null,
        type: location.type || null,
        barcode: location.barcode || null,
        isPickable: location.isPickable || false,
        isReceivable: location.isReceivable || false,
        isShippable: location.isShippable || false,
        isActive: location.isActive !== undefined ? location.isActive : true,
        sortOrder: location.sortOrder || null,
        content: location.content || null,
      });
    }
  }, [location]);

  const handleSave = async () => {
    try {
      setLoading(true);
      
      if (!formData.name?.trim()) {
        Alert.alert('Validation Error', 'Location name is required');
        return;
      }

      let savedLocation: Location;
      
      if (location) {
        savedLocation = await locationApi.updateLocation(location.id, formData, user?.token, user?.tenantId);
        updateLocation(savedLocation);
      } else {
        savedLocation = await locationApi.createLocation(formData, user?.token, user?.tenantId);
        addLocation(savedLocation);
      }
      
      onSave(savedLocation);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save location');
      Alert.alert('Error', 'Failed to save location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof LocationAddRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (state.loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Saving location...</Text>
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
        <Text style={styles.headerTitle}>{location ? 'Edit' : 'New'} Location</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Form */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Name *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.name || ''}
              onChangeText={(value) => updateFormData('name', value)}
              placeholder="Enter location name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Code</Text>
            <TextInput
              style={styles.textInput}
              value={formData.code || ''}
              onChangeText={(value) => updateFormData('code', value)}
              placeholder="Enter location code"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.description || ''}
              onChangeText={(value) => updateFormData('description', value)}
              placeholder="Enter location description"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Type</Text>
            <TextInput
              style={styles.textInput}
              value={formData.type || ''}
              onChangeText={(value) => updateFormData('type', value)}
              placeholder="e.g., Storage, Picking, Receiving"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Barcode</Text>
            <TextInput
              style={styles.textInput}
              value={formData.barcode || ''}
              onChangeText={(value) => updateFormData('barcode', value)}
              placeholder="Enter barcode"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Sort Order</Text>
            <TextInput
              style={styles.textInput}
              value={formData.sortOrder?.toString() || ''}
              onChangeText={(value) => updateFormData('sortOrder', value ? parseInt(value) : null)}
              placeholder="Enter sort order"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Capabilities</Text>
          
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Pickable</Text>
            <Switch
              value={formData.isPickable || false}
              onValueChange={(value) => updateFormData('isPickable', value)}
            />
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Receivable</Text>
            <Switch
              value={formData.isReceivable || false}
              onValueChange={(value) => updateFormData('isReceivable', value)}
            />
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Shippable</Text>
            <Switch
              value={formData.isShippable || false}
              onValueChange={(value) => updateFormData('isShippable', value)}
            />
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Active</Text>
            <Switch
              value={formData.isActive !== undefined ? formData.isActive : true}
              onValueChange={(value) => updateFormData('isActive', value)}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
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
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
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
  },
  sectionTitle: {
    fontSize: 18,
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
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
});

export default LocationEditScreen;
