import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface SalesOrderEditScreenProps {
  order?: any | null;
  onSave: (order: any) => void;
  onCancel: () => void;
}

const SalesOrderEditScreen: React.FC<SalesOrderEditScreenProps> = ({ order, onSave, onCancel }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{order ? 'Edit' : 'New'} Order</Text>
        <TouchableOpacity onPress={() => onSave({})}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.placeholder}>Order form coming soon...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  cancelButton: { color: '#007AFF', fontSize: 16 },
  title: { fontSize: 18, fontWeight: '600' },
  saveButton: { color: '#007AFF', fontSize: 16, fontWeight: '600' },
  content: { flex: 1, padding: 16 },
  placeholder: { fontSize: 16, color: '#666' },
});

export default SalesOrderEditScreen;
