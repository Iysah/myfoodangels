import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import { Colors, GlobalStyles, Spacing, Typography } from '../../styles/globalStyles';
import { useStores } from '../../contexts/StoreContext';
import AuthPrompt from '../../components/AuthPrompt';

const ViewedScreen = observer(() => {
  const navigation = useNavigation();
  const { authStore, productStore } = useStores();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  useEffect(() => {
    // Check if user is authenticated when screen loads
    if (authStore.requiresAuthentication()) {
      setShowAuthPrompt(true);
    }
    // Recently viewed products are automatically available in productStore.recentlyViewedProducts
  }, [authStore.isAuthenticated]);

  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetails', { productId });
  };

  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(item.id)}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>${item.price}</Text>
        <Text style={styles.viewedDate}>Viewed {item.viewedAt}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>👁️</Text>
      <Text style={styles.emptyTitle}>No Recently Viewed Products</Text>
      <Text style={styles.emptyMessage}>
        Products you view will appear here for easy access later.
      </Text>
      <TouchableOpacity
        style={[GlobalStyles.primaryButton, styles.browseButton]}
        onPress={() => navigation.navigate('Main', { screen: 'Home' })}
      >
        <Text style={GlobalStyles.primaryButtonText}>Browse Products</Text>
      </TouchableOpacity>
    </View>
  );

  if (authStore.requiresAuthentication()) {
    return (
      <SafeAreaView style={[GlobalStyles.safeArea, styles.container]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Recently Viewed</Text>
        </View>
        
        <View style={styles.authRequiredContainer}>
          <Text style={styles.authRequiredIcon}>🔒</Text>
          <Text style={styles.authRequiredTitle}>Sign In Required</Text>
          <Text style={styles.authRequiredMessage}>
            Sign in to view your recently viewed products and keep track of items you're interested in.
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
          feature="recently viewed products"
          message="Sign in to keep track of products you've viewed and easily find them later."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[GlobalStyles.safeArea, styles.container]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recently Viewed</Text>
      </View>

      <FlatList
        data={productStore?.recentlyViewedProducts || []}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.label,
  },
  listContainer: {
    padding: Spacing.md,
    flexGrow: 1,
  },
  productCard: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    marginBottom: Spacing.md,
    shadowColor: Colors.label,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  productImage: {
    width: 100,
    height: 100,
  },
  productInfo: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.label,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
    marginBottom: 4,
  },
  viewedDate: {
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

export default ViewedScreen;