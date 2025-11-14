import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../providers';
import { dashboardApi } from '../../services/dashboard';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, icon, color, trend }) => (
  <View style={[styles.card, { borderLeftColor: color, borderLeftWidth: 4 }]}>
    <View style={styles.cardHeader}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardValue}>{value}</Text>
        {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
        {trend && (
          <View style={styles.trendContainer}>
            <Ionicons
              name={trend.isPositive ? 'trending-up' : 'trending-down'}
              size={14}
              color={trend.isPositive ? '#34C759' : '#FF3B30'}
            />
            <Text style={[styles.trendText, { color: trend.isPositive ? '#34C759' : '#FF3B30' }]}>
              {trend.value}
            </Text>
          </View>
        )}
      </View>
    </View>
  </View>
);

const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Sales data state
  const [salesOverview, setSalesOverview] = useState<any>(null);
  const [salesDetails, setSalesDetails] = useState<any>(null);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  const loadDashboardData = useCallback(async () => {
    try {
      setError(null);
      
      // Load all sales data in parallel
      const [overview, details, recent, products] = await Promise.allSettled([
        dashboardApi.getSales({}, user?.token, user?.tenantId),
        dashboardApi.getSalesDetails({}, user?.token, user?.tenantId),
        dashboardApi.getSalesRecent(user?.token, user?.tenantId),
        dashboardApi.getSalesProducts({}, user?.token, user?.tenantId),
      ]);

      if (overview.status === 'fulfilled') setSalesOverview(overview.value);
      if (details.status === 'fulfilled') setSalesDetails(details.value);
      if (recent.status === 'fulfilled') setRecentSales(Array.isArray(recent.value) ? recent.value : recent.value?.data || []);
      if (products.status === 'fulfilled') setTopProducts(Array.isArray(products.value) ? products.value : products.value?.data || []);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading sales dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#007AFF" />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Sales Dashboard</Text>
          <Text style={styles.userName}>{user?.email || 'User'}</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Ionicons name="refresh" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Sales Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sales Overview</Text>
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(salesOverview?.totalRevenue || 0)}
          subtitle="All time"
          icon="cash-outline"
          color="#34C759"
        />
        <MetricCard
          title="Total Orders"
          value={salesOverview?.totalOrders?.toLocaleString() || '0'}
          subtitle="Completed sales"
          icon="receipt-outline"
          color="#007AFF"
        />
        <MetricCard
          title="Average Order Value"
          value={formatCurrency(salesOverview?.averageOrderValue || 0)}
          subtitle="Per transaction"
          icon="stats-chart-outline"
          color="#5856D6"
        />
      </View>

      {/* Sales Details Breakdown */}
      {salesDetails && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sales Breakdown</Text>
          <MetricCard
            title="This Month"
            value={formatCurrency(salesDetails?.thisMonth || 0)}
            subtitle={`${salesDetails?.thisMonthOrders || 0} orders`}
            icon="calendar-outline"
            color="#007AFF"
          />
          <MetricCard
            title="Last Month"
            value={formatCurrency(salesDetails?.lastMonth || 0)}
            subtitle={`${salesDetails?.lastMonthOrders || 0} orders`}
            icon="calendar-outline"
            color="#5856D6"
          />
          <MetricCard
            title="This Year"
            value={formatCurrency(salesDetails?.thisYear || 0)}
            subtitle={`${salesDetails?.thisYearOrders || 0} orders`}
            icon="calendar-outline"
            color="#34C759"
          />
        </View>
      )}

      {/* Recent Sales Activity */}
      {recentSales.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Sales</Text>
          <View style={styles.listContainer}>
            {recentSales.slice(0, 5).map((sale: any, index: number) => (
              <View key={sale.id || index} style={styles.listItem}>
                <View style={styles.listItemLeft}>
                  <Text style={styles.listItemTitle}>
                    {sale.orderNumber || sale.number || `Order #${index + 1}`}
                  </Text>
                  <Text style={styles.listItemSubtitle}>
                    {sale.customerName || 'Customer'} • {formatDate(sale.createdAt || sale.date)}
                  </Text>
                </View>
                <Text style={styles.listItemValue}>
                  {formatCurrency(sale.totalAmount || sale.total || 0)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Top Selling Products */}
      {topProducts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Selling Products</Text>
          <View style={styles.listContainer}>
            {topProducts.slice(0, 10).map((product: any, index: number) => (
              <View key={product.id || index} style={styles.productItem}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>
                    {product.itemName || product.name || 'Product'}
                  </Text>
                  <Text style={styles.productStats}>
                    {product.quantitySold || product.quantity || 0} sold • {formatCurrency(product.revenue || product.totalRevenue || 0)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Last Updated */}
      <Text style={styles.lastUpdated}>
        Last updated: {new Date().toLocaleString()}
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 8,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  refreshButton: {
    padding: 8,
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  lastUpdated: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    marginBottom: 24,
  },
  listContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listItemLeft: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  listItemSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  listItemValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34C759',
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productStats: {
    fontSize: 13,
    color: '#666',
  },
});

export default DashboardScreen;
