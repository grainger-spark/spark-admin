import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../providers';
import { colors, spacing, typography } from '../../theme';

const { width } = Dimensions.get('window');
const TILE_SIZE = (width - (spacing.md * 2 + spacing.sm * 4)) / 3; // 3 columns with proper spacing

interface ModuleTileProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}

const ModuleTile: React.FC<ModuleTileProps> = ({ title, icon, color, onPress }) => (
  <TouchableOpacity 
    style={[styles.tile, { backgroundColor: color }]} 
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.tileContent}>
      <Ionicons name={icon} size={28} color="#fff" />
      <Text style={styles.tileTitle}>{title}</Text>
    </View>
  </TouchableOpacity>
);

interface HomeScreenProps {
  navigation?: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user } = useAuth();

  const modules = [
    {
      title: 'Dashboard',
      icon: 'grid-outline' as keyof typeof Ionicons.glyphMap,
      color: colors.primary,
      screen: 'Dashboard',
    },
    {
      title: 'Items',
      icon: 'cube-outline' as keyof typeof Ionicons.glyphMap,
      color: colors.success,
      screen: 'Items',
    },
    {
      title: 'Sales Orders',
      icon: 'receipt-outline' as keyof typeof Ionicons.glyphMap,
      color: colors.secondary,
      screen: 'SalesOrders',
    },
    {
      title: 'Purchase Orders',
      icon: 'cart-outline' as keyof typeof Ionicons.glyphMap,
      color: colors.warning,
      screen: 'PurchaseOrders',
    },
    {
      title: 'Warehouses',
      icon: 'business-outline' as keyof typeof Ionicons.glyphMap,
      color: colors.error,
      screen: 'Warehouses',
    },
    {
      title: 'Locations',
      icon: 'location-outline' as keyof typeof Ionicons.glyphMap,
      color: colors.info,
      screen: 'Locations',
    },
    {
      title: 'Chat',
      icon: 'chatbubble-outline' as keyof typeof Ionicons.glyphMap,
      color: colors.primaryDark,
      screen: 'Chat',
    },
    {
      title: 'Notifications',
      icon: 'notifications-outline' as keyof typeof Ionicons.glyphMap,
      color: colors.secondaryDark,
      screen: 'Notifications',
    },
    {
      title: 'Profile',
      icon: 'person-outline' as keyof typeof Ionicons.glyphMap,
      color: colors.gray600,
      screen: 'Profile',
    },
  ];

  const handleTilePress = (screenName: string) => {
    if (navigation) {
      navigation.navigate(screenName);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Welcome back</Text>
          <Text style={styles.userName}>{user?.email || 'User'}</Text>
        </View>
        <View style={styles.avatar}>
          <Ionicons name="person" size={24} color={colors.white} />
        </View>
      </View>

      {/* Section Title */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Modules</Text>
      </View>

      {/* Module Tiles Grid */}
      <View style={styles.tilesGrid}>
        {modules.map((module, index) => (
          <ModuleTile
            key={index}
            title={module.title}
            icon={module.icon}
            color={module.color}
            onPress={() => handleTilePress(module.screen)}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    paddingBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerContent: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  userName: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionContainer: {
    backgroundColor: colors.white,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.textPrimary,
  },
  tilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: 12,
    margin: spacing.sm / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tileContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.sm,
  },
  tileTitle: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginTop: spacing.xs,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default HomeScreen;
