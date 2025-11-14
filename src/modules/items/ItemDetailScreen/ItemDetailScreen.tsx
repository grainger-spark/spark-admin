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
import { useItems } from '../ItemsScreen/ItemsScreenProvider';
import { useAuth } from '../../../providers';
import { itemsApi, Item, formatCurrency, formatQuantity } from '../../../services/items';

interface ItemDetailScreenProps {
  itemId: string;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  onBack: () => void;
}

const ItemDetailScreen: React.FC<ItemDetailScreenProps> = ({
  itemId,
  onEdit,
  onDelete,
  onBack,
}) => {
  const { state, setLoading, setError, setCurrentItem } = useItems();
  const { user } = useAuth();
  const [item, setItem] = useState<Item | null>(null);

  const loadItem = useCallback(async () => {
    try {
      setLoading(true);
      const itemData = await itemsApi.getItem(itemId, undefined, undefined, user?.token, user?.tenantId);
      setItem(itemData);
      setCurrentItem(itemData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load item');
    } finally {
      setLoading(false);
    }
  }, [itemId, setLoading, setError, setCurrentItem, user]);

  useEffect(() => {
    loadItem();
  }, [loadItem]);

  const handleDelete = () => {
    if (!item) return;
    
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(item),
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

  if (state.loading && !item) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading item details...</Text>
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Item not found</Text>
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
            style={[styles.actionButton, styles.editButton]}
            onPress={() => onEdit(item)}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <InfoRow label="Name" value={item.name} />
          <InfoRow label="SKU" value={item.sku} />
          <InfoRow label="Description" value={item.description} />
          <InfoRow label="Type" value={item.type} />
          <InfoRow label="Kind" value={item.kind} />
          {item.itemGroup && <InfoRow label="Item Group" value={item.itemGroup.name} />}
          {item.itemBrand && <InfoRow label="Brand" value={item.itemBrand.name} />}
        </View>

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing</Text>
          <InfoRow label="Cost" value={formatCurrency(item.cost)} />
          <InfoRow label="Price" value={formatCurrency(item.price)} />
          <InfoRow label="Price with Tax" value={formatCurrency(item.priceWithTax)} />
          <InfoRow label="Total Available Value" value={formatCurrency(item.totalAvailableValue)} />
          <InfoRow label="Taxable" value={item.taxable ? 'Yes' : 'No'} />
        </View>

        {/* Inventory */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inventory</Text>
          <InfoRow label="Available" value={formatQuantity(item.available)} />
          <InfoRow label="On Hand" value={formatQuantity(item.onHand)} />
          <InfoRow label="Reserved" value={formatQuantity(item.reserved)} />
          <InfoRow label="Sold" value={formatQuantity(item.sold)} />
          <InfoRow label="Total Quantity" value={formatQuantity(item.totalQuantity)} />
          <InfoRow label="Reorder Point" value={formatQuantity(item.reorderPoint)} />
          <InfoRow label="Reorder Quantity" value={formatQuantity(item.reorderQuantity)} />
          <InfoRow label="Reorder Required" value={item.reorder ? 'Yes' : 'No'} />
        </View>

        {/* Physical Properties */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Physical Properties</Text>
          <InfoRow label="Weight" value={item.weight ? `${item.weight} ${item.weightUom?.code || ''}` : null} />
          <InfoRow label="Length" value={item.length ? `${item.length} ${item.dimensionUom?.code || ''}` : null} />
          <InfoRow label="Width" value={item.width ? `${item.width} ${item.dimensionUom?.code || ''}` : null} />
          <InfoRow label="Height" value={item.height ? `${item.height} ${item.dimensionUom?.code || ''}` : null} />
          <InfoRow label="Volume" value={item.volume ? `${item.volume} ${item.volumeUom?.code || ''}` : null} />
          <InfoRow label="Default UOM" value={item.defaultUom?.name} />
          <InfoRow label="Tracking Type" value={item.trackingType} />
        </View>

        {/* Categories */}
        {item.itemCategories && item.itemCategories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            {item.itemCategories.map((category) => (
              <Text key={category.id} style={styles.categoryText}>
                • {category.name}
              </Text>
            ))}
          </View>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {item.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Additional Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          <InfoRow label="Order Number" value={item.orderNumber} />
          <InfoRow label="Notes" value={item.note} />
          <InfoRow label="E-commerce Available" value={item.isECommerceAvailable ? 'Yes' : 'No'} />
          <InfoRow label="Is Package" value={item.isPackage ? 'Yes' : 'No'} />
          <InfoRow label="Is Raw Material" value={item.isRawMaterial ? 'Yes' : 'No'} />
          <InfoRow label="Is Inventory Item" value={item.isInventoryItem ? 'Yes' : 'No'} />
          <InfoRow label="Backorder Allowed" value={item.isBackorderAllowed ? 'Yes' : 'No'} />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
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
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#e6f4fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#007AFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    marginBottom: 16,
  },
});

export default ItemDetailScreen;
