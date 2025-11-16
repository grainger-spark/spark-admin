import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { usePickList } from '../PickListsScreen/PickListsScreenProvider';
import { useAuth } from '../../../providers';
import {
  workflowApi,
  PickList,
  PickListItem,
  PickListItemLocation,
  formatTrackingSerial,
} from '../../../services/salesOrders';

interface PickingScreenProps {
  pickList: PickList;
  item: PickListItem;
  onBack: () => void;
  onComplete: () => void;
}

export const PickingScreen: React.FC<PickingScreenProps> = ({
  pickList,
  item,
  onBack,
  onComplete,
}) => {
  const { setLoading, setError, setItemLocations, state } = usePickList();
  const { user } = useAuth();
  const [locations, setLocations] = useState<PickListItemLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<PickListItemLocation | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [serialNumbers, setSerialNumbers] = useState<string[]>([]);
  const [serialInput, setSerialInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadLocations = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!user?.token || !user?.tenantId) {
        setError('Authentication required. Please log in again.');
        return;
      }
      
      const data = await workflowApi.pickList.getItemLocations(
        pickList.id,
        item.id,
        user.token,
        user.tenantId
      );
      setLocations(data);
      setItemLocations(data);
    } catch (error) {
      console.error('Failed to load locations:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load locations';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [pickList.id, item.id, setLoading, setError, setItemLocations, user]);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  const handlePickItem = async () => {
    if (!selectedLocation || !user?.token || !user?.tenantId) {
      Alert.alert('Error', 'Please select a location');
      return;
    }

    const pickQuantity = parseInt(quantity);
    if (isNaN(pickQuantity) || pickQuantity <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    if (pickQuantity > selectedLocation.quantity) {
      Alert.alert('Error', 'Quantity exceeds available stock');
      return;
    }

    // Check if serial tracking is required
    const requiresSerial = item.item.trackingType === 'serial';
    if (requiresSerial && serialNumbers.length !== pickQuantity) {
      Alert.alert('Error', `Please scan ${pickQuantity} serial number(s)`);
      return;
    }

    try {
      setActionLoading(true);
      
      await workflowApi.pickList.pickItem(
        pickList.id,
        item.id,
        {
          itemId: item.item.id,
          locationId: selectedLocation.location.id,
          quantity: pickQuantity,
          trackingSerial: requiresSerial ? serialNumbers : undefined,
        },
        user.token,
        user.tenantId
      );

      Alert.alert('Success', 'Item picked successfully', [
        {
          text: 'OK',
          onPress: () => {
            // Reset form
            setQuantity('1');
            setSerialNumbers([]);
            setSerialInput('');
            setSelectedLocation(null);
            
            // Reload locations to get updated quantities
            loadLocations();
            
            // Check if item is fully picked
            const remaining = item.quantityToPick - item.quantityCollected - pickQuantity;
            if (remaining <= 0) {
              onComplete();
            }
          },
        },
      ]);
    } catch (error) {
      console.error('Failed to pick item:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to pick item');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddSerial = () => {
    if (!serialInput.trim()) return;
    
    if (serialNumbers.includes(serialInput.trim())) {
      Alert.alert('Error', 'Serial number already added');
      return;
    }

    setSerialNumbers([...serialNumbers, serialInput.trim()]);
    setSerialInput('');
  };

  const handleRemoveSerial = (serial: string) => {
    setSerialNumbers(serialNumbers.filter(s => s !== serial));
  };

  const renderLocation = (location: PickListItemLocation) => {
    const isSelected = selectedLocation?.location.id === location.location.id;
    const available = location.quantity - location.pickedQuantity;

    return (
      <TouchableOpacity
        key={location.location.id}
        style={[styles.locationCard, isSelected && styles.locationCardSelected]}
        onPress={() => setSelectedLocation(location)}
        disabled={available <= 0}
      >
        <View style={styles.locationHeader}>
          <Text style={styles.locationName}>{location.location.name}</Text>
          {isSelected && (
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedText}>✓</Text>
            </View>
          )}
        </View>

        <Text style={styles.locationCode}>Code: {location.location.code || 'N/A'}</Text>
        
        <View style={styles.quantityRow}>
          <Text style={styles.quantityLabel}>Available:</Text>
          <Text style={[styles.quantityValue, available <= 0 && styles.quantityZero]}>
            {available}
          </Text>
        </View>

        {location.trackingSerial && location.trackingSerial.length > 0 && (
          <Text style={styles.tracking}>
            Serial: {formatTrackingSerial(location.trackingSerial)}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  if (state.loading && locations.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading locations...</Text>
      </View>
    );
  }

  const requiresSerial = item.item.trackingType === 'serial';
  const remaining = item.quantityToPick - item.quantityCollected;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Pick Item</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Item Info */}
        <View style={styles.itemCard}>
          <Text style={styles.itemName}>{item.item.name}</Text>
          {item.item.sku && (
            <Text style={styles.itemSku}>SKU: {item.item.sku}</Text>
          )}
          <View style={styles.quantityRow}>
            <Text style={styles.quantityLabel}>To Pick:</Text>
            <Text style={styles.quantityValue}>{remaining}</Text>
          </View>
          <View style={styles.quantityRow}>
            <Text style={styles.quantityLabel}>Already Collected:</Text>
            <Text style={styles.quantityValue}>{item.quantityCollected}</Text>
          </View>
        </View>

        {/* Locations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Location</Text>
          {locations.length === 0 ? (
            <Text style={styles.emptyText}>No locations available</Text>
          ) : (
            locations.map(renderLocation)
          )}
        </View>

        {/* Quantity Input */}
        {selectedLocation && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quantity to Pick</Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="number-pad"
              placeholder="Enter quantity"
            />
            <Text style={styles.hint}>
              Max: {selectedLocation.quantity - selectedLocation.pickedQuantity}
            </Text>
          </View>
        )}

        {/* Serial Number Input */}
        {requiresSerial && selectedLocation && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Serial Numbers ({serialNumbers.length} / {quantity})
            </Text>
            
            <View style={styles.serialInputRow}>
              <TextInput
                style={[styles.input, styles.serialInput]}
                value={serialInput}
                onChangeText={setSerialInput}
                placeholder="Scan or enter serial number"
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddSerial}
                disabled={!serialInput.trim()}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            {serialNumbers.length > 0 && (
              <View style={styles.serialList}>
                {serialNumbers.map((serial, index) => (
                  <View key={index} style={styles.serialChip}>
                    <Text style={styles.serialText}>{serial}</Text>
                    <TouchableOpacity onPress={() => handleRemoveSerial(serial)}>
                      <Text style={styles.removeText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Pick Button */}
        {selectedLocation && (
          <TouchableOpacity
            style={[styles.pickButton, actionLoading && styles.pickButtonDisabled]}
            onPress={handlePickItem}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.pickButtonText}>Pick Item</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  itemSku: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  locationCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  selectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  locationCode: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 8,
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  quantityLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  quantityValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  quantityZero: {
    color: '#FF3B30',
  },
  tracking: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000000',
  },
  hint: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  serialInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  serialInput: {
    flex: 1,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  serialList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serialChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 8,
  },
  serialText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  removeText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  pickButton: {
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  pickButtonDisabled: {
    opacity: 0.6,
  },
  pickButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#8E8E93',
    padding: 16,
  },
});
