import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useItems } from './ItemsScreenProvider';

const ItemsScreen: React.FC = () => {
  const { state } = useItems();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Items Management</Text>
      <Text style={styles.subtitle}>Total Items: {state.pagination.totalCount}</Text>
      
      {/* Items list will be implemented in ItemsListScreen */}
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Items list will be displayed here</Text>
        <Text style={styles.placeholderText}>Loading: {state.loading ? 'Yes' : 'No'}</Text>
        {state.error && <Text style={styles.errorText}>Error: {state.error}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#ff0000',
    textAlign: 'center',
  },
});

export default ItemsScreen;
