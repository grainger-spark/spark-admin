import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSalesOrders } from './SalesOrdersScreenProvider';

const SalesOrdersScreen: React.FC = () => {
  const { state } = useSalesOrders();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sales Orders</Text>
      <Text style={styles.subtitle}>
        Total: {state.pagination.totalCount} orders
      </Text>
      
      {state.loading && (
        <Text style={styles.loadingText}>Loading...</Text>
      )}
      
      {state.error && (
        <Text style={styles.errorText}>{state.error}</Text>
      )}
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
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default SalesOrdersScreen;
