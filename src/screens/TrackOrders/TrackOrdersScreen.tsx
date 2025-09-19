import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import { Colors, GlobalStyles, Spacing, Typography } from '../../styles/globalStyles';
import { useStores } from '../../contexts/StoreContext';
import AuthPrompt from '../../components/AuthPrompt';
import Constants from 'expo-constants';
import { Bell, Heart, ShoppingCart } from 'lucide-react-native';

const TrackOrdersScreen = observer(() => {
  const navigation = useNavigation();
  const { authStore, orderStore, cartStore } = useStores();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  useEffect(() => {
    // Check if user is authenticated when screen loads
    if (authStore.requiresAuthentication()) {
      setShowAuthPrompt(true);
    } else {
      // Load user orders for authenticated users
      if (orderStore && authStore.user) {
        orderStore.fetchUserOrders(authStore.user.id);
      }
    }
  }, [authStore.isAuthenticated]);

  const handleOrderPress = (orderId: string) => {
    navigation.navigate('OrderDetails', { orderId });
  };

  const handleCartPress = () => {
    // Check if user is authenticated for cart access
    if (authStore.requiresAuthentication()) {
      // Show authentication prompt
      navigation.navigate('Auth', { screen: 'Login' });
      return;
    }
    navigation.navigate('Cart');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return Colors.warning;
      case 'confirmed':
        return Colors.info;
      case 'preparing':
        return Colors.warning;
      case 'out_for_delivery':
        return Colors.primary;
      case 'delivered':
        return Colors.success;
      case 'cancelled':
        return Colors.error;
      default:
        return Colors.textSecondary;
    }
  };

  const renderOrder = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => handleOrderPress(item.id)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>Order #{item.orderNumber}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>
      
      <Text style={styles.orderDate}>{item.createdAt}</Text>
      <Text style={styles.orderTotal}>Total: ${item.total}</Text>
      
      <View style={styles.orderItems}>
        <Text style={styles.itemsText}>
          {item.items.length} item{item.items.length > 1 ? 's' : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📦</Text>
      <Text style={styles.emptyTitle}>No Orders Yet</Text>
      <Text style={styles.emptyMessage}>
        When you place orders, you'll be able to track them here.
      </Text>
      <TouchableOpacity
        style={[GlobalStyles.primaryButton, styles.browseButton]}
        onPress={() => navigation.navigate('Main', { screen: 'Home' })}
      >
        <Text style={GlobalStyles.primaryButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  if (authStore.requiresAuthentication()) {
    return (
      <SafeAreaView style={[GlobalStyles.safeArea, styles.container]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Track Orders</Text>
        </View>
        
        <View style={styles.authRequiredContainer}>
          <Text style={styles.authRequiredIcon}>🔒</Text>
          <Text style={styles.authRequiredTitle}>Sign In Required</Text>
          <Text style={styles.authRequiredMessage}>
            Sign in to view and track your orders. Get real-time updates on your delivery status.
          </Text>
          <TouchableOpacity
            style={[GlobalStyles.primaryButton, styles.signInButton]}
            onPress={() => setShowAuthPrompt(true)}
          >
            <Text style={GlobalStyles.primaryButtonText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.browseAsGuestButton}
            onPress={() => navigation.navigate('Main', { screen: 'Home' })}
          >
            <Text style={styles.browseAsGuestText}>Continue Browsing</Text>
          </TouchableOpacity>
        </View>

        <AuthPrompt
          visible={showAuthPrompt}
          onClose={() => setShowAuthPrompt(false)}
          feature="order tracking"
          message="Sign in to view your order history and track current deliveries."
        />
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container]}>
      <SafeAreaProvider style={{ backgroundColor: '#fff', position: 'relative', paddingTop: Constants.statusBarHeight }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Track Orders</Text>
          
          <View style={styles.rowContainer}>
            <TouchableOpacity style={styles.cartButton} onPress={handleCartPress}>
              <View style={styles.cartIconContainer}>
                <ShoppingCart size={22} color={'#000'}/>
                {cartStore.itemCount > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>
                      {cartStore.itemCount > 99 ? '99+' : cartStore.itemCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cartButton}>
              <Bell size={22} color={'#000'}/>
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={orderStore?.orders || []}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaProvider>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: '600',
    color: Colors.label,
  },
  rowContainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5
  },
  cartButton: {
    padding: Spacing.sm,
  },
  cartIcon: {
    color: '#000'
  },
  cartIconContainer: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  listContainer: {
    padding: Spacing.md,
    flexGrow: 1,
  },
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.label,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  orderNumber: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.label,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
  },
  orderDate: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  orderItems: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  itemsText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.label,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  emptyMessage: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  browseButton: {
    paddingHorizontal: Spacing.xl,
  },
  authRequiredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  authRequiredIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  authRequiredTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.label,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  authRequiredMessage: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  signInButton: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  browseAsGuestButton: {
    paddingVertical: Spacing.sm,
  },
  browseAsGuestText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
  },
});

export default TrackOrdersScreen;