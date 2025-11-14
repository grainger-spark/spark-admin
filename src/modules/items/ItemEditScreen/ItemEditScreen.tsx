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
  Switch,
} from 'react-native';
import { useItems } from '../ItemsScreen/ItemsScreenProvider';
import { useAuth } from '../../../providers';
import { itemsApi, Item, ItemAddRequest, INITIAL_ITEM } from '../../../services/items';

interface ItemEditScreenProps {
  item?: Item | null;
  onSave: (item: Item) => void;
  onCancel: () => void;
}

const ItemEditScreen: React.FC<ItemEditScreenProps> = ({ item, onSave, onCancel }) => {
  const { state, setLoading, setError, addItem, updateItem } = useItems();
  const { user } = useAuth();
  const [formData, setFormData] = useState<ItemAddRequest>(INITIAL_ITEM as ItemAddRequest);

  useEffect(() => {
    if (item) {
      // Load existing item data for editing
      setFormData({
        name: item.name || '',
        slug: item.slug || '',
        description: item.description || '',
        sku: item.sku || '',
        note: item.note || '',
        type: item.type || 'Standard',
        kind: item.kind || undefined,
        cost: item.cost,
        price: item.price,
        depositFeeAmount: item.depositFeeAmount,
        reorderPoint: item.reorderPoint,
        reorderQuantity: item.reorderQuantity,
        taxable: item.taxable,
        isPackage: item.isPackage,
        isECommerceAvailable: item.isECommerceAvailable,
        upsell: item.upsell,
        isRawMaterial: item.isRawMaterial,
        isInventoryItem: item.isInventoryItem,
        isBackorderAllowed: item.isBackorderAllowed,
        length: item.length,
        width: item.width,
        height: item.height,
        weight: item.weight,
        diameter: item.diameter,
        volume: item.volume,
        packageQuantity: item.packageQuantity,
        orderNumber: item.orderNumber || undefined,
        cartonQuantity: item.cartonQuantity || undefined,
        procurementWriteOffPercentage: item.procurementWriteOffPercentage || undefined,
        procurementExpirationDays: item.procurementExpirationDays || undefined,
        upcs: item.upcs || [],
        tags: item.tags || [],
        imageIds: [],
        itemCategoryIds: [],
        linkedItemIds: [],
        external: [],
        translations: {},
        secondaryInventory: [],
        warehouseSettings: [],
        bundleComponents: [],
        // Required fields with default values
        defaultUomId: item.defaultUom?.id || '',
        salesTaxId: item.salesTax?.id || '',
        defaultSupplierId: item.defaultSupplier?.id || undefined,
        itemGroupId: item.itemGroup?.id || undefined,
        itemBrandId: item.itemBrand?.id || undefined,
        dimensionUomId: item.dimensionUom?.id || undefined,
        weightUomId: item.weightUom?.id || undefined,
        volumeUomId: item.volumeUom?.id || undefined,
        packageUomId: item.packageUom?.id || undefined,
        preferredLocationId: item.preferredLocation?.id || undefined,
        rawMaterialItemId: item.rawMaterialItem?.id || undefined,
        mainImageId: item.mainImage?.id || undefined,
        trackingType: item.trackingType || undefined,
        itemCostMethod: item.itemCostMethod || undefined,
      });
    }
  }, [item]);

  const handleInputChange = (field: keyof ItemAddRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Validation
      if (!formData.name?.trim()) {
        Alert.alert('Validation Error', 'Item name is required');
        return;
      }
      
      if (!formData.type) {
        Alert.alert('Validation Error', 'Item type is required');
        return;
      }

      let savedItem: Item;
      
      if (item) {
        // Update existing item
        savedItem = await itemsApi.updateItem(item.id, formData, user?.token, user?.tenantId);
        updateItem(savedItem);
      } else {
        // Create new item
        savedItem = await itemsApi.createItem(formData, user?.token, user?.tenantId);
        addItem(savedItem);
      }
      
      onSave(savedItem);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save item');
      Alert.alert('Error', 'Failed to save item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const renderTextInput = (label: string, field: keyof ItemAddRequest, placeholder?: string, multiline = false) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.textInput, multiline && styles.textInputMultiline]}
        value={formData[field]?.toString() || ''}
        onChangeText={(value) => handleInputChange(field, value)}
        placeholder={placeholder}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  );

  const renderNumberInput = (label: string, field: keyof ItemAddRequest, placeholder?: string) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.textInput}
        value={formData[field]?.toString() || ''}
        onChangeText={(value) => handleInputChange(field, parseFloat(value) || 0)}
        placeholder={placeholder}
        keyboardType="numeric"
      />
    </View>
  );

  const renderSwitch = (label: string, field: keyof ItemAddRequest) => (
    <View style={styles.switchGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <Switch
        value={formData[field] as boolean}
        onValueChange={(value) => handleInputChange(field, value)}
      />
    </View>
  );

  if (state.loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Saving item...</Text>
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
        <Text style={styles.headerTitle}>{item ? 'Edit Item' : 'New Item'}</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        {renderSection('Basic Information', (
          <>
            {renderTextInput('Name', 'name', 'Enter item name')}
            {renderTextInput('SKU', 'sku', 'Enter SKU')}
            {renderTextInput('Description', 'description', 'Enter description', true)}
            {renderTextInput('Notes', 'note', 'Enter notes', true)}
          </>
        ))}

        {/* Pricing */}
        {renderSection('Pricing', (
          <>
            {renderNumberInput('Cost', 'cost', '0.00')}
            {renderNumberInput('Price', 'price', '0.00')}
            {renderNumberInput('Deposit Fee', 'depositFeeAmount', '0.00')}
            {renderSwitch('Taxable', 'taxable')}
          </>
        ))}

        {/* Inventory */}
        {renderSection('Inventory', (
          <>
            {renderNumberInput('Reorder Point', 'reorderPoint', '0')}
            {renderNumberInput('Reorder Quantity', 'reorderQuantity', '0')}
            {renderSwitch('Is Inventory Item', 'isInventoryItem')}
            {renderSwitch('Backorder Allowed', 'isBackorderAllowed')}
          </>
        ))}

        {/* Physical Properties */}
        {renderSection('Physical Properties', (
          <>
            {renderNumberInput('Weight', 'weight', '0.00')}
            {renderNumberInput('Length', 'length', '0.00')}
            {renderNumberInput('Width', 'width', '0.00')}
            {renderNumberInput('Height', 'height', '0.00')}
            {renderNumberInput('Volume', 'volume', '0.00')}
          </>
        ))}

        {/* Settings */}
        {renderSection('Settings', (
          <>
            {renderSwitch('E-commerce Available', 'isECommerceAvailable')}
            {renderSwitch('Is Package', 'isPackage')}
            {renderSwitch('Is Raw Material', 'isRawMaterial')}
            {renderSwitch('Upsell', 'upsell')}
            {renderNumberInput('Order Number', 'orderNumber', '0')}
          </>
        ))}

        {/* Required IDs (for now, simplified) */}
        {renderSection('System Configuration', (
          <>
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                Note: Default UOM and Sales Tax are required fields. These will need dropdown selectors in a full implementation.
              </Text>
            </View>
            {renderTextInput('Default UOM ID', 'defaultUomId', 'Required')}
            {renderTextInput('Sales Tax ID', 'salesTaxId', 'Required')}
          </>
        ))}
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
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
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
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textInputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  warningBox: {
    backgroundColor: '#fff3cd',
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    padding: 12,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
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
});

export default ItemEditScreen;
