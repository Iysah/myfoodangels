import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import { Colors, GlobalStyles, Spacing, Typography, BorderRadius } from '../../styles/globalStyles';
import { useStores } from '../../contexts/StoreContext';
import { Eye, EyeOff, Plus, CreditCard, ArrowLeft, ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';
import { Transaction } from '../../types/Wallet';
import Constants from 'expo-constants';

const WalletScreen = observer(() => {
  const navigation = useNavigation();
  const { authStore, walletStore } = useStores();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (authStore.requiresAuthentication()) {
      Alert.alert(
        'Authentication Required',
        'You must be signed in to access your wallet.',
        [
          {
            text: 'Sign In',
            onPress: () => navigation.navigate('Auth', { screen: 'Login' }),
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => navigation.goBack(),
          },
        ]
      );
      return;
    }

    // Load wallet data
    if (authStore.user) {
      loadWalletData();
    }
  }, [authStore.isAuthenticated]);

  const loadWalletData = async () => {
    if (!authStore.user) return;
    
    try {
      await walletStore.fetchUserWallet(
        authStore.user.id, 
        authStore.user.email, 
        authStore.user.displayName || authStore.user.email
      );
      if (walletStore.wallet) {
        await walletStore.fetchTransactions(authStore.user.id);
        await walletStore.fetchPaymentCards(authStore.user.id);
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
      Alert.alert('Error', 'Failed to load wallet data. Please try again.');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };

  const handleTopUp = () => {
    navigation.navigate('TopUp');
  };

  const handleAddCard = () => {
    navigation.navigate('AddCard');
  };

  const handleToggleBalanceVisibility = () => {
    walletStore.toggleBalanceVisibility();
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'refund':
        return <ArrowDownLeft size={20} color={Colors.success} />;
      case 'withdrawal':
      case 'payment':
        return <ArrowUpRight size={20} color={Colors.error} />;
      default:
        return <ArrowUpRight size={20} color={Colors.textSecondary} />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'credit':
      case 'top_up':
        return Colors.success;
      case 'debit':
      case 'payment':
        return Colors.error;
      default:
        return Colors.textSecondary;
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <View style={styles.transactionIcon}>
          {getTransactionIcon(item.type)}
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionDescription}>{item.description}</Text>
          <Text style={styles.transactionDate}>{formatDate(item.createdAt)}</Text>
        </View>
      </View>
      <Text style={[
        styles.transactionAmount,
        { color: getTransactionColor(item.type) }
      ]}>
        {item.type === 'deposit' || item.type === 'refund' ? '+' : '-'}
        ₦{item.amount.toFixed(2)}
      </Text>
    </View>
  );

  if (authStore.requiresAuthentication()) {
    return (
      <SafeAreaView style={[GlobalStyles.safeArea, styles.container]}>
        <View style={styles.authRequiredContainer}>
          <Text style={styles.authRequiredTitle}>Sign In Required</Text>
          <Text style={styles.authRequiredMessage}>
            Please sign in to access your wallet
          </Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container]}>
      <SafeAreaProvider style={{ backgroundColor: '#fff', position: 'relative', paddingTop: Constants.statusBarHeight }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={Colors.label} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Wallet</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Wallet Balance Card */}
          <View style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceLabel}>Wallet Balance</Text>
              <TouchableOpacity
                style={styles.visibilityButton}
                onPress={handleToggleBalanceVisibility}
              >
                {walletStore.isBalanceVisible ? (
                  <EyeOff size={20} color={Colors.textSecondary} />
                ) : (
                  <Eye size={20} color={Colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
            
            <Text style={styles.balanceAmount}>
              {walletStore.isBalanceVisible 
                ? walletStore.getDisplayBalance() 
                : '₦****'
              }
            </Text>
            
            {walletStore.error && (
              <Text style={styles.errorText}>{walletStore.error}</Text>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.topUpButton]}
              onPress={handleTopUp}
              disabled={walletStore.isTopUpLoading}
            >
              {walletStore.isTopUpLoading ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Plus size={20} color={Colors.white} />
              )}
              <Text style={styles.topUpButtonText}>Top Up</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.addCardButton]}
              onPress={handleAddCard}
              disabled={walletStore.isCardLoading}
            >
              {walletStore.isCardLoading ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <CreditCard size={20} color={Colors.primary} />
              )}
              <Text style={styles.addCardButtonText}>Add Card</Text>
            </TouchableOpacity>
          </View>

          {/* Payment Cards */}
          {walletStore.cards.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Cards</Text>
              {walletStore.cards.map((card: any) => (
                <View key={card.id} style={styles.cardItem}>
                  <View style={styles.cardLeft}>
                    <CreditCard size={24} color={Colors.primary} />
                    <View style={styles.cardDetails}>
                      <Text style={styles.cardNumber}>**** **** **** {card.last4}</Text>
                      <Text style={styles.cardBrand}>{card.brand.toUpperCase()}</Text>
                    </View>
                  </View>
                  {card.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Transaction History */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            {walletStore.transactions.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No transactions yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Your transaction history will appear here
                </Text>
              </View>
            ) : (
              <FlatList
                data={walletStore.transactions.slice(0, 10)} // Show last 10 transactions
                renderItem={renderTransaction}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </ScrollView>

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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    ...GlobalStyles.h3,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  balanceCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  balanceLabel: {
    ...GlobalStyles.body,
    color: Colors.textSecondary,
  },
  visibilityButton: {
    padding: Spacing.xs,
  },
  balanceAmount: {
    ...GlobalStyles.h1,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  errorText: {
    ...GlobalStyles.caption,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  topUpButton: {
    backgroundColor: Colors.primary,
  },
  topUpButtonText: {
    ...GlobalStyles.body,
    color: Colors.white,
    fontWeight: '600',
  },
  addCardButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  addCardButtonText: {
    ...GlobalStyles.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...GlobalStyles.h4,
    marginBottom: Spacing.md,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardDetails: {
    marginLeft: Spacing.md,
  },
  cardNumber: {
    ...GlobalStyles.body,
    fontWeight: '600',
  },
  cardBrand: {
    ...GlobalStyles.caption,
    color: Colors.textSecondary,
  },
  defaultBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  defaultText: {
    ...GlobalStyles.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gray.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionDetails: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  transactionDescription: {
    ...GlobalStyles.body,
    fontWeight: '600',
  },
  transactionDate: {
    ...GlobalStyles.caption,
    color: Colors.textSecondary,
  },
  transactionAmount: {
    ...GlobalStyles.body,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyStateText: {
    ...GlobalStyles.body,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  emptyStateSubtext: {
    ...GlobalStyles.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  authRequiredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  authRequiredTitle: {
    ...GlobalStyles.h2,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  authRequiredMessage: {
    ...GlobalStyles.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  signInButton: {
    ...GlobalStyles.primaryButton,
    paddingHorizontal: Spacing.xl,
  },
  signInButtonText: {
    ...GlobalStyles.primaryButtonText,
  },
});

export default WalletScreen;