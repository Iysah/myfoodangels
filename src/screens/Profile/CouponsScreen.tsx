import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Coupon } from '../../types/Coupon';
import { couponService } from '../../services/firebase/couponService';
import CouponCard from '../../components/CouponCard';
import { Colors, Typography, Spacing, GlobalStyles } from '../../styles/globalStyles';

const CouponsScreen = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCoupons = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const fetchedCoupons = await couponService.getAllUserCoupons();
      setCoupons(fetchedCoupons);
    } catch (err) {
      console.error('Error fetching coupons:', err);
      setError('Failed to load coupons. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCouponPress = (coupon: Coupon) => {
    // Handle coupon press - could copy code to clipboard, show details, etc.
    console.log('Coupon pressed:', coupon.code);
  };

  const renderCouponCard = ({ item }: { item: Coupon }) => (
    <CouponCard coupon={item} onPress={handleCouponPress} />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Coupons Available</Text>
      <Text style={styles.emptySubtitle}>
        You don't have any active coupons at the moment. Check back later for new offers!
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>My Coupons</Text>
      <Text style={styles.subtitle}>
        {coupons.length > 0
          ? `You have ${coupons.length} active coupon${coupons.length > 1 ? 's' : ''}`
          : 'No active coupons'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={GlobalStyles.container}>
        <View style={GlobalStyles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading your coupons...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={GlobalStyles.container}>
        <View style={GlobalStyles.errorContainer}>
          <Text style={GlobalStyles.errorText}>{error}</Text>
          <Text style={styles.retryText} onPress={() => fetchCoupons()}>
            Tap to retry
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={GlobalStyles.container}>
      <FlatList
        data={coupons}
        renderItem={renderCouponCard}
        keyExtractor={(item) => item.id || item.code}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchCoupons(true)}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      />
    </SafeAreaView>
  );
};

export default CouponsScreen;

const styles = StyleSheet.create({
  listContainer: {
    padding: Spacing.md,
    flexGrow: 1,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    ...GlobalStyles.h1,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...GlobalStyles.body,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing['3xl'],
  },
  emptyTitle: {
    ...GlobalStyles.h2,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...GlobalStyles.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingText: {
    ...GlobalStyles.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  retryText: {
    ...GlobalStyles.body,
    color: Colors.primary,
    fontFamily: Typography.fontFamily.semiBold,
    textDecorationLine: 'underline',
  },
});