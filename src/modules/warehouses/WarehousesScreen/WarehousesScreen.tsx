import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useWarehouses } from './WarehousesScreenProvider';

const WarehousesScreen: React.FC = () => {
  const { state } = useWarehouses();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Warehouses</Text>
      <Text style={styles.subtitle}>
        Total: {state.pagination.totalCount} warehouses
      </Text>
      
      {state.loading && (
        <Text style={styles.loadingText}>Loading...</Text>
      )}
      
      {state.error && (
        <Text style={styles.errorText}>{state.error}</Text>
      )}
      
      {/* Warehouses list will be rendered here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#ff0000',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default WarehousesScreen;