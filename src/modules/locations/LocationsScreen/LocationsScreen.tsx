import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocations } from './LocationsScreenProvider';

const LocationsScreen: React.FC = () => {
  const { state } = useLocations();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Locations</Text>
      <Text style={styles.subtitle}>
        Total: {state.pagination.totalCount} locations
      </Text>
      
      {state.loading && (
        <Text style={styles.loadingText}>Loading...</Text>
      )}
      
      {state.error && (
        <Text style={styles.errorText}>{state.error}</Text>
      )}
      
      {/* Locations list will be rendered here */}
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

export default LocationsScreen;
