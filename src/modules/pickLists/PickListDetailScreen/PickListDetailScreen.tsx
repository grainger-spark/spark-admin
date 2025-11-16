import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { usePickList } from '../PickListsScreen/PickListsScreenProvider';
import { useAuth } from '../../../providers';
import {
  workflowApi,
  PickList,
  PickListItem,
  PickListStatus,
  getPickListStatusConfig,
  formatDateTime,
} from '../../../services/salesOrders';
import { apiRequest } from '../../../helpers/api';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface PickListDetailScreenProps {
  pickListId: string;
  onBack: () => void;
  onPickItem?: (pickList: PickList, item: PickListItem) => void;
}

export const PickListDetailScreen: React.FC<PickListDetailScreenProps> = ({
  pickListId,
  onBack,
  onPickItem,
}) => {
  const { state, setLoading, setError, setCurrentPickList } = usePickList();
  const { user } = useAuth();
  const [pickList, setPickList] = useState<PickList | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignedUser, setAssignedUser] = useState('');
  const [assignedUserId, setAssignedUserId] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const loadPickList = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!user?.token || !user?.tenantId) {
        setError('Authentication required');
        return;
      }
      
      const data = await workflowApi.pickList.getPickList(
        pickListId,
        user.token,
        user.tenantId
      );
      setPickList(data);
      setCurrentPickList(data);
    } catch (error) {
      console.error('Failed to load pick list:', error);
      setError(error instanceof Error ? error.message : 'Failed to load pick list');
    } finally {
      setLoading(false);
    }
  }, [pickListId, setLoading, setError, setCurrentPickList, user]);

  useEffect(() => {
    loadPickList();
  }, [loadPickList]);

  const loadUsers = async () => {
    if (!user?.token || !user?.tenantId) return;
    
    try {
      setLoadingUsers(true);
      const response = await apiRequest<{ data: User[] }>(
        '/users?page=1&pageSize=25&sortDirection=desc',
        { method: 'GET', token: user.token, tenantId: user.tenantId }
      );
      console.log('Users response:', response);
      console.log('Users data:', response.data);
      setUsers(response.data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleStart = () => {
    // Show assignment modal and load users
    setShowAssignModal(true);
    loadUsers();
    // Pre-fill with current user's name if available
    const currentUser = user as any;
    if (currentUser?.firstName && currentUser?.lastName) {
      setAssignedUser(`${currentUser.firstName} ${currentUser.lastName}`);
    } else if (currentUser?.name) {
      setAssignedUser(currentUser.name);
    }
  };

  const handleConfirmStart = async () => {
    if (!pickList || !user?.token || !user?.tenantId) return;

    try {
      setActionLoading(true);
      setShowAssignModal(false);
      
      const updated = await workflowApi.pickList.startPickList(
        pickList.id,
        assignedUserId ? { pickerId: assignedUserId } : {},
        user.token,
        user.tenantId
      );
      setPickList(updated);
      setCurrentPickList(updated);
    } catch (error) {
      console.error('Failed to start pick list:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to start pick list');
    } finally {
      setActionLoading(false);
    }
  };

  // Progress Bar Component
  const ProgressBar = () => {
    if (!pickList) return null;

    const totalItems = pickList.items.reduce((sum, item) => sum + item.quantityToPick, 0);
    const pickedItems = pickList.items.reduce((sum, item) => sum + item.quantityCollected, 0);
    const finishedItems = pickList.items.reduce((sum, item) => sum + item.quantityPicked, 0);

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressItem}>
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <Text style={styles.progressText}>{totalItems} ordered</Text>
        </View>
        <View style={styles.progressLine} />
        <View style={styles.progressItem}>
          <View style={[styles.progressDot, pickedItems > 0 && styles.progressDotActive]} />
          <Text style={styles.progressText}>{pickedItems} picked</Text>
        </View>
        <View style={styles.progressLine} />
        <View style={styles.progressItem}>
          <View style={[styles.progressDot, finishedItems > 0 && styles.progressDotActive]} />
          <Text style={styles.progressText}>{finishedItems} finished</Text>
        </View>
      </View>
    );
  };

  if (state.loading && !pickList) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading pick list...</Text>
      </View>
    );
  }

  if (!pickList) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Pick list not found</Text>
        <TouchableOpacity style={styles.button} onPress={onBack}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusConfig = getPickListStatusConfig(pickList.status);
  // Check status as string (API returns strings, not enum values)
  const statusStr = String(pickList.status).toLowerCase();
  const isCreated = statusStr === 'pending' || statusStr === 'created';
  const isInProgress = statusStr === 'inprogress' || statusStr === 'in progress';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Text style={styles.iconButtonText}>🖨</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Text style={styles.iconButtonText}>✉</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Title & Status */}
      <View style={styles.titleSection}>
        <Text style={styles.pickListNumber}>{pickList.number}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.color }]}>
          <Text style={styles.statusText}>{statusConfig.label}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <ProgressBar />

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Priority</Text>
            <Text style={styles.infoValue}>{pickList.priority === 'high' ? 'High' : 'Default'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Customer name</Text>
            <Text style={styles.infoValue}>{pickList.salesOrderNumber || '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Assigned to</Text>
            <Text style={styles.infoValue}>{pickList.pickerName || '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date of creation</Text>
            <Text style={styles.infoValue}>{formatDateTime(pickList.createdAt)}</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.tableSection}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 0.5 }]}>#</Text>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>Item</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>To pick</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Picked</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Finished</Text>
            {isInProgress && <View style={{ width: 40 }} />}
          </View>

          {pickList.items.map((item, index) => {
            const pickedRatio = `${item.quantityCollected}/${item.quantityToPick}`;
            const finishedRatio = `${item.quantityPicked}/${item.quantityToPick}`;
            const isItemComplete = item.quantityPicked >= item.quantityToPick;

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.tableRow, isInProgress && styles.tableRowClickable]}
                onPress={() => {
                  if (onPickItem && isInProgress) {
                    console.log('Picking item:', item.item.name);
                    onPickItem(pickList, item);
                  }
                }}
                disabled={!onPickItem || !isInProgress}
                activeOpacity={isInProgress ? 0.7 : 1}
              >
                <Text style={[styles.tableCell, { flex: 0.5 }]}>{index + 1}</Text>
                <View style={{ flex: 2 }}>
                  <Text style={[styles.tableCell, styles.itemName]}>{item.item.name}</Text>
                  {item.item.sku && <Text style={styles.itemSku}>{item.item.sku}</Text>}
                </View>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{item.quantityToPick}</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'center', color: item.quantityCollected > 0 ? '#FF3B30' : '#666' }]}>
                  {pickedRatio}
                </Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'center', color: isItemComplete ? '#34C759' : '#666' }]}>
                  {finishedRatio}
                </Text>
                {isInProgress && (
                  <View style={styles.pickIconContainer}>
                    <Text style={styles.pickIcon}>📦</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bottom spacing for fixed button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom Action Button */}
      {(isCreated || isInProgress) && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.startButton, actionLoading && styles.buttonDisabled]}
            onPress={isCreated ? handleStart : () => Alert.alert('Finish', 'Finish functionality coming soon')}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.startButtonText}>{isCreated ? 'Start' : 'Finish'}</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Assignment Modal */}
      <Modal
        visible={showAssignModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAssignModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Assign Pick List</Text>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Assign to</Text>
              <TouchableOpacity
                style={styles.modalInput}
                onPress={() => setShowUserDropdown(!showUserDropdown)}
              >
                <Text style={[styles.modalInputText, !assignedUser && styles.modalInputPlaceholder]}>
                  {assignedUser || 'Select user'}
                </Text>
                <Text style={styles.dropdownIcon}>{showUserDropdown ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              
              {showUserDropdown && (
                <ScrollView style={styles.userDropdown} nestedScrollEnabled>
                  {loadingUsers ? (
                    <View style={styles.dropdownLoading}>
                      <ActivityIndicator size="small" color="#00A3E0" />
                    </View>
                  ) : users.length > 0 ? (
                    users.map((u) => {
                      const fullName = `${u.firstName} ${u.lastName}`;
                      return (
                        <TouchableOpacity
                          key={u.id}
                          style={styles.userOption}
                          onPress={() => {
                            setAssignedUser(fullName);
                            setAssignedUserId(u.id);
                            setShowUserDropdown(false);
                          }}
                        >
                          <Text style={styles.userOptionText}>{fullName}</Text>
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    <Text style={styles.noUsersText}>No users found</Text>
                  )}
                </ScrollView>
              )}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowAssignModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalStartButton}
                onPress={handleConfirmStart}
              >
                <Text style={styles.modalStartText}>Start</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
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
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonText: {
    fontSize: 20,
  },
  titleSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
  },
  pickListNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  progressItem: {
    alignItems: 'center',
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#D0D0D0',
    marginBottom: 6,
  },
  progressDotActive: {
    backgroundColor: '#007AFF',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: '#D0D0D0',
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 15,
    color: '#666',
  },
  infoValue: {
    fontSize: 15,
    color: '#000',
    fontWeight: '500',
  },
  tableSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#E0E0E0',
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    alignItems: 'center',
  },
  tableRowClickable: {
    backgroundColor: '#FAFAFA',
  },
  tableCell: {
    fontSize: 14,
    color: '#000',
  },
  itemName: {
    fontWeight: '500',
  },
  itemSku: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  pickIconContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickIcon: {
    fontSize: 24,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  startButton: {
    backgroundColor: '#00A3E0',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    padding: 20,
    paddingBottom: 16,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalBody: {
    padding: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  modalInput: {
    borderWidth: 2,
    borderColor: '#00A3E0',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalInputText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  modalInputPlaceholder: {
    color: '#999',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  userDropdown: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownLoading: {
    padding: 20,
    alignItems: 'center',
  },
  userOption: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  userOptionText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  userOptionEmail: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  noUsersText: {
    padding: 20,
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  modalStartButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#00A3E0',
    alignItems: 'center',
  },
  modalStartText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
