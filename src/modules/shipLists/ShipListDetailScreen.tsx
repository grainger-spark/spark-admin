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
  Modal,
} from 'react-native';
import { useShipList } from './ShipListProvider';
import { useAuth } from '../../providers';
import {
  workflowApi,
  ShipList,
  ShipListItem,
  ShipListPackage,
  ShipListStatus,
  getShipListStatusConfig,
  formatDateTime,
  formatDimensions,
  formatWeight,
  calculateShipListProgress,
} from '../../services/salesOrders';

interface ShipListDetailScreenProps {
  shipListId: string;
  onBack: () => void;
}

export const ShipListDetailScreen: React.FC<ShipListDetailScreenProps> = ({
  shipListId,
  onBack,
}) => {
  const { state, setLoading, setError, setCurrentShipList, updateShipList } = useShipList();
  const { user } = useAuth();
  const [shipList, setShipList] = useState<ShipList | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [packingModalVisible, setPackingModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ShipListItem | null>(null);
  const [packQuantity, setPackQuantity] = useState('1');
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const loadShipList = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!user?.token || !user?.tenantId) {
        setError('Authentication required. Please log in again.');
        return;
      }
      
      const data = await workflowApi.shipList.getShipList(
        shipListId,
        user.token,
        user.tenantId
      );
      setShipList(data);
      setCurrentShipList(data);
    } catch (error) {
      console.error('Failed to load ship list:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load ship list';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [shipListId, setLoading, setError, setCurrentShipList, user]);

  useEffect(() => {
    loadShipList();
  }, [loadShipList]);

  const handleStartPacking = async () => {
    if (!shipList || !user?.token || !user?.tenantId) return;

    try {
      setActionLoading(true);
      const updated = await workflowApi.shipList.startShipList(
        shipList.id,
        {},
        user.token,
        user.tenantId
      );
      setShipList(updated);
      updateShipList(updated);
      Alert.alert('Success', 'Packing started');
    } catch (error) {
      console.error('Failed to start packing:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to start packing');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinishPacking = async () => {
    if (!shipList || !user?.token || !user?.tenantId) return;

    try {
      setActionLoading(true);
      const updated = await workflowApi.shipList.finishPacking(
        shipList.id,
        user.token,
        user.tenantId
      );
      setShipList(updated);
      updateShipList(updated);
      Alert.alert('Success', 'Packing completed');
    } catch (error) {
      console.error('Failed to finish packing:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to finish packing');
    } finally {
      setActionLoading(false);
    }
  };

  const handleShipOut = async () => {
    if (!shipList || !user?.token || !user?.tenantId) return;

    Alert.alert(
      'Ship Out',
      'Are you sure you want to mark this shipment as shipped?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Ship',
          onPress: async () => {
            try {
              setActionLoading(true);
              const updated = await workflowApi.shipList.shipOut(
                shipList.id,
                user.token,
                user.tenantId
              );
              setShipList(updated);
              updateShipList(updated);
              Alert.alert('Success', 'Shipment marked as shipped');
            } catch (error) {
              console.error('Failed to ship out:', error);
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to ship out');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handlePackItem = async () => {
    if (!shipList || !selectedItem || !user?.token || !user?.tenantId) return;

    const quantity = parseInt(packQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    const remaining = selectedItem.quantityToShip - selectedItem.quantityPacked;
    if (quantity > remaining) {
      Alert.alert('Error', 'Quantity exceeds remaining items');
      return;
    }

    try {
      setActionLoading(true);
      await workflowApi.shipList.packItem(
        shipList.id,
        selectedItem.id,
        {
          quantity,
          shipListPackageId: selectedPackage || undefined,
        },
        user.token,
        user.tenantId
      );

      Alert.alert('Success', 'Item packed successfully');
      setPackingModalVisible(false);
      setSelectedItem(null);
      setPackQuantity('1');
      setSelectedPackage(null);
      loadShipList();
    } catch (error) {
      console.error('Failed to pack item:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to pack item');
    } finally {
      setActionLoading(false);
    }
  };

  const openPackingModal = (item: ShipListItem) => {
    setSelectedItem(item);
    setPackQuantity(String(item.quantityToShip - item.quantityPacked));
    setPackingModalVisible(true);
  };

  const renderItem = (item: ShipListItem) => {
    const progress = calculateShipListProgress(item.quantityToShip, item.quantityPacked);
    const isComplete = item.quantityPacked >= item.quantityToShip;

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.itemCard, isComplete && styles.itemCardComplete]}
        onPress={() => openPackingModal(item)}
        disabled={shipList?.status === ShipListStatus.SHIPPED}
      >
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{item.item.name}</Text>
          {isComplete && (
            <View style={styles.completeBadge}>
              <Text style={styles.completeText}>✓</Text>
            </View>
          )}
        </View>

        {item.item.sku && (
          <Text style={styles.itemSku}>SKU: {item.item.sku}</Text>
        )}

        <View style={styles.quantityRow}>
          <Text style={styles.quantityText}>
            Packed: {item.quantityPacked} / {item.quantityToShip}
          </Text>
          <Text style={[styles.progressPercent, isComplete && styles.progressComplete]}>
            {progress}%
          </Text>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%` },
              isComplete && styles.progressFillComplete,
            ]}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderPackage = (pkg: ShipListPackage) => {
    return (
      <View key={pkg.id} style={styles.packageCard}>
        <Text style={styles.packageTitle}>Package {pkg.id.slice(-6)}</Text>
        
        <View style={styles.packageInfo}>
          <Text style={styles.packageLabel}>Dimensions:</Text>
          <Text style={styles.packageValue}>
            {formatDimensions(pkg.length, pkg.width, pkg.height)}
          </Text>
        </View>

        <View style={styles.packageInfo}>
          <Text style={styles.packageLabel}>Weight:</Text>
          <Text style={styles.packageValue}>
            {formatWeight(pkg.weight)}
          </Text>
        </View>

        {pkg.trackingNumber && (
          <View style={styles.packageInfo}>
            <Text style={styles.packageLabel}>Tracking:</Text>
            <Text style={styles.packageValue}>{pkg.trackingNumber}</Text>
          </View>
        )}

        <Text style={styles.packageItems}>
          {pkg.items.length} item(s) in package
        </Text>
      </View>
    );
  };

  if (state.loading && !shipList) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading ship list...</Text>
      </View>
    );
  }

  if (!shipList) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Ship list not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusConfig = getShipListStatusConfig(shipList.status);
  const canStart = shipList.status === ShipListStatus.PENDING;
  const canFinish = shipList.status === ShipListStatus.IN_PROGRESS;
  const canShip = shipList.status === ShipListStatus.READY_TO_SHIP;
  const isShipped = shipList.status === ShipListStatus.SHIPPED;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Ship List</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.number}>{shipList.number}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.color }]}>
              <Text style={styles.statusText}>{statusConfig.label}</Text>
            </View>
          </View>

          {shipList.salesOrderNumber && (
            <Text style={styles.salesOrder}>Sales Order: {shipList.salesOrderNumber}</Text>
          )}

          {shipList.warehouse && (
            <Text style={styles.warehouse}>Warehouse: {shipList.warehouse.name}</Text>
          )}

          {shipList.shipperName && (
            <Text style={styles.shipper}>Shipper: {shipList.shipperName}</Text>
          )}

          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Created:</Text>
            <Text style={styles.dateValue}>{formatDateTime(shipList.createdAt)}</Text>
          </View>
        </View>

        {/* Actions */}
        {!isShipped && (
          <View style={styles.actionsCard}>
            {canStart && (
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton]}
                onPress={handleStartPacking}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.actionButtonText}>Start Packing</Text>
                )}
              </TouchableOpacity>
            )}

            {canFinish && (
              <TouchableOpacity
                style={[styles.actionButton, styles.successButton]}
                onPress={handleFinishPacking}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.actionButtonText}>Finish Packing</Text>
                )}
              </TouchableOpacity>
            )}

            {canShip && (
              <TouchableOpacity
                style={[styles.actionButton, styles.shipButton]}
                onPress={handleShipOut}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.actionButtonText}>Ship Out</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items to Pack</Text>
          {shipList.items.map(renderItem)}
        </View>

        {/* Packages */}
        {shipList.packages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Packages</Text>
            {shipList.packages.map(renderPackage)}
          </View>
        )}
      </ScrollView>

      {/* Packing Modal */}
      <Modal
        visible={packingModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPackingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pack Item</Text>
            
            {selectedItem && (
              <>
                <Text style={styles.modalItemName}>{selectedItem.item.name}</Text>
                <Text style={styles.modalRemaining}>
                  Remaining: {selectedItem.quantityToShip - selectedItem.quantityPacked}
                </Text>

                <Text style={styles.modalLabel}>Quantity:</Text>
                <TextInput
                  style={styles.modalInput}
                  value={packQuantity}
                  onChangeText={setPackQuantity}
                  keyboardType="number-pad"
                  placeholder="Enter quantity"
                />

                <Text style={styles.modalLabel}>Package:</Text>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setSelectedPackage(null)}
                >
                  <Text style={styles.modalButtonText}>New Package</Text>
                </TouchableOpacity>

                {shipList?.packages.map((pkg) => (
                  <TouchableOpacity
                    key={pkg.id}
                    style={[
                      styles.modalButton,
                      selectedPackage === pkg.id && styles.modalButtonSelected,
                    ]}
                    onPress={() => setSelectedPackage(pkg.id)}
                  >
                    <Text style={styles.modalButtonText}>
                      Package {pkg.id.slice(-6)}
                    </Text>
                  </TouchableOpacity>
                ))}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalActionButton, styles.modalCancelButton]}
                    onPress={() => setPackingModalVisible(false)}
                  >
                    <Text style={styles.modalActionButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalActionButton, styles.modalConfirmButton]}
                    onPress={handlePackItem}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={[styles.modalActionButtonText, styles.modalConfirmButtonText]}>
                        Pack
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
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
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  number: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
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
    marginBottom: 4,
  },
  shipper: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  dateLabel: {
    fontSize: 13,
    color: '#8E8E93',
  },
  dateValue: {
    fontSize: 13,
    color: '#000000',
  },
  actionsCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  successButton: {
    backgroundColor: '#34C759',
  },
  shipButton: {
    backgroundColor: '#32ADE6',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemCardComplete: {
    backgroundColor: '#F0FFF4',
    borderWidth: 1,
    borderColor: '#34C759',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  completeBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  itemSku: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 8,
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quantityText: {
    fontSize: 14,
    color: '#000000',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#32ADE6',
  },
  progressComplete: {
    color: '#34C759',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#32ADE6',
  },
  progressFillComplete: {
    backgroundColor: '#34C759',
  },
  packageCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  packageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  packageLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  packageValue: {
    fontSize: 14,
    color: '#000000',
  },
  packageItems: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  modalRemaining: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    marginTop: 12,
  },
  modalInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000000',
    marginBottom: 16,
  },
  modalButton: {
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalButtonSelected: {
    backgroundColor: '#007AFF',
  },
  modalButtonText: {
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalActionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#E5E5EA',
  },
  modalConfirmButton: {
    backgroundColor: '#34C759',
  },
  modalActionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  modalConfirmButtonText: {
    color: '#FFFFFF',
  },
});
