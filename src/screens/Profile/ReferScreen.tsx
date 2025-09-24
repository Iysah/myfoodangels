import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView, SafeAreaView } from 'react-native'
import * as Clipboard from 'expo-clipboard'
import React, { useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { useNavigation } from '@react-navigation/native';
import { GlobalStyles, Colors, Typography, Spacing, BorderRadius } from '../../styles/globalStyles'
import { authStore, walletStore } from '../../stores'
import ReferIcon from '../../../assets/icons/refer'
import { getOrCreateReferral, withdrawReferralPoints, ReferralData } from '../../services/firebase'
import { ArrowLeft } from 'lucide-react-native'

const ReferScreen = observer(() => {
  const [referralData, setReferralData] = useState<ReferralData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true)
    const navigation = useNavigation();

  useEffect(() => {
    // Fetch user's referral data when component mounts
    if (authStore.user?.id) {
      fetchReferralData()
    }
  }, [authStore.user?.id])

  const fetchReferralData = async () => {
    if (!authStore.user?.id) return

    try {
      setIsLoadingData(true)
      
      // Fetch or create referral data using Firebase
      const data = await getOrCreateReferral(authStore.user.id)
      setReferralData(data)
    } catch (error) {
      console.error('Error fetching referral data:', error)
      Alert.alert('Error', 'Failed to load referral data. Please try again.')
    } finally {
      setIsLoadingData(false)
    }
  }

  const copyReferralCode = async () => {
    try {
      if (!referralData?.referralCode) {
        Alert.alert('Error', 'No referral code available')
        return
      }
      await Clipboard.setStringAsync(referralData.referralCode)
      Alert.alert(
        'Copied!', 
        'Your referral code has been copied to clipboard',
        [{ text: 'OK', style: 'default' }]
      )
    } catch (error) {
      Alert.alert('Error', 'Failed to copy referral code')
    }
  }

  const withdrawPointsToWallet = async () => {
    if (!authStore.user?.id) {
      Alert.alert('Error', 'Please log in to withdraw points')
      return
    }

    if (!referralData || referralData.points <= 0) {
      Alert.alert('Error', 'You have no points to withdraw')
      return
    }

    Alert.alert(
      'Withdraw Points',
      `Are you sure you want to withdraw ${referralData.points} points (₦${referralData.points}) to your wallet?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Withdraw', 
          style: 'default',
          onPress: async () => {
            setIsLoading(true)
            try {
              // In a real app, you would call your backend API to process the withdrawal
              // For now, we'll simulate the process
              
              // Fetch current wallet
              await walletStore.fetchUserWallet(authStore.user!.id, authStore.user!.email || '', authStore.user!.displayName || '')
              
              if (walletStore.wallet) {
                // Add points to wallet balance (1 point = ₦1)
                const pointsToWithdraw = referralData.points
                const newBalance = (walletStore.wallet.balance || 0) + pointsToWithdraw
                await walletStore.updateWalletBalance(walletStore.wallet.id, newBalance)
                
                // Update referral points via Firebase
                if (authStore.user?.id) {
                  await withdrawReferralPoints(authStore.user.id)
                  
                  // Update local state
                  setReferralData({ ...referralData, points: 0 })
                }
                
                Alert.alert(
                  'Success!', 
                  `₦${pointsToWithdraw} has been added to your wallet`,
                  [{ text: 'OK', style: 'default' }]
                )
              } else {
                Alert.alert('Error', 'Unable to access wallet. Please try again.')
              }
            } catch (error) {
              console.error('Withdrawal error:', error)
              Alert.alert('Error', 'Failed to withdraw points. Please try again.')
            } finally {
              setIsLoading(false)
            }
          }
        }
      ]
    )
  }

  const shareReferralCode = () => {
    if (!referralData?.referralCode) {
      Alert.alert('Error', 'No referral code available')
      return
    }
    
    const message = `Join MyFoodAngels using my referral code: ${referralData.referralCode} and get amazing deals on fresh food!`
    
    Alert.alert(
      'Share Referral Code',
      'How would you like to share your referral code?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Copy Message', 
          onPress: async () => {
            try {
              await Clipboard.setStringAsync(message)
              Alert.alert('Copied!', 'Referral message copied to clipboard')
            } catch (error) {
              Alert.alert('Error', 'Failed to copy message')
            }
          }
        }
      ]
    )
  }

  if (!authStore.user) {
    return (
      <SafeAreaView style={GlobalStyles.safeArea}>
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Please log in to access referral features</Text>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={Colors.label} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Refer & Earn</Text>
          <View style={styles.placeholder} />
        </View>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>
            Share your referral code with friends and earn points for every successful referral!
          </Text>
        </View>

        {/* Referral Points Card */}
        <View style={styles.pointsCard}>
          <Text style={styles.pointsLabel}>Your Referral Points</Text>
          <Text style={styles.pointsValue}>{isLoadingData ? '...' : (referralData?.points || 0).toLocaleString()}</Text>
          <Text style={styles.pointsSubtext}>Points = ₦{isLoadingData ? '...' : (referralData?.points || 0).toLocaleString()}</Text>
          
          {!isLoadingData && referralData && referralData.points > 0 && (
            <TouchableOpacity 
              style={styles.withdrawButton}
              onPress={withdrawPointsToWallet}
              disabled={isLoading}
            >
              <Text style={styles.withdrawButtonText}>
                {isLoading ? 'Processing...' : 'Withdraw to Wallet'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Referral Code Card */}
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Your Referral Code</Text>
          <View style={styles.codeContainer}>
            <Text style={styles.codeText}>{isLoadingData ? 'Loading...' : (referralData?.referralCode || 'N/A')}</Text>
            <TouchableOpacity style={styles.copyButton} onPress={copyReferralCode}>
              <Text style={styles.copyButtonText}>Copy</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.shareButton} onPress={shareReferralCode}>
            <Text style={styles.shareButtonText}>Share Referral Code</Text>
          </TouchableOpacity>
        </View>

        {/* How it Works */}
        <View style={styles.howItWorksCard}>
          <Text style={styles.howItWorksTitle}>How it Works</Text>
          
          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Share Your Code</Text>
              <Text style={styles.stepDescription}>
                Share your unique referral code with friends and family
              </Text>
            </View>
          </View>

          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Friend Signs Up</Text>
              <Text style={styles.stepDescription}>
                Your friend creates an account using your referral code
              </Text>
            </View>
          </View>

          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Earn Points</Text>
              <Text style={styles.stepDescription}>
                Get 50 points for each successful referral that can be withdrawn to your wallet
              </Text>
            </View>
          </View>
        </View>

        {/* Terms */}
        <View style={styles.termsCard}>
          <Text style={styles.termsTitle}>Terms & Conditions</Text>
          <Text style={styles.termsText}>
            • Referral points are awarded when your referred friend makes their first purchase{'\n'}
            • Points can be withdrawn to your wallet as cash{'\n'}
            • 1 point = ₦1{'\n'}
            • Minimum withdrawal amount is 50 points{'\n'}
            • Referral codes are unique and cannot be changed{'\n'}
            • MyFoodAngels reserves the right to modify these terms at any time
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
})

export default ReferScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  placeholder: {
    width: 32,
  },
  headerTitle: {
    ...GlobalStyles.h2,
    textAlign: 'center',
  },
  headerSubtitle: {
    ...GlobalStyles.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  pointsCard: {
    ...GlobalStyles.card,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderColor: Colors.border,
    borderWidth: 1,
  },
  pointsLabel: {
    ...GlobalStyles.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  pointsValue: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize['4xl'],
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  pointsSubtext: {
    ...GlobalStyles.caption,
    marginBottom: Spacing.lg,
  },
  withdrawButton: {
    ...GlobalStyles.primaryButton,
    width: '100%',
  },
  withdrawButtonText: {
    ...GlobalStyles.primaryButtonText,
  },
  codeCard: {
    ...GlobalStyles.card,
    marginBottom: Spacing.lg,
  },
  codeLabel: {
    ...GlobalStyles.h4,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  codeText: {
    flex: 1,
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.lg,
    color: Colors.label,
    textAlign: 'center',
  },
  copyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.sm,
  },
  copyButtonText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.sm,
    color: Colors.white,
  },
  shareButton: {
    ...GlobalStyles.secondaryButton,
    width: '100%',
  },
  shareButtonText: {
    ...GlobalStyles.secondaryButtonText,
  },
  howItWorksCard: {
    ...GlobalStyles.card,
    marginBottom: Spacing.lg,
        borderColor: Colors.border,
    borderWidth: 1,
  },
  howItWorksTitle: {
    ...GlobalStyles.h3,
    marginBottom: Spacing.lg,
    textAlign: 'left',
    fontWeight: '600'
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  stepNumberText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.sm,
    color: Colors.white,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    ...GlobalStyles.h4,
    marginBottom: Spacing.xs,
  },
  stepDescription: {
    ...GlobalStyles.body,
    color: Colors.textSecondary,
  },
  termsCard: {
    ...GlobalStyles.card,
    marginBottom: Spacing.xl,
    borderColor: Colors.border,
    borderWidth: 1,
  },
  termsTitle: {
    ...GlobalStyles.h4,
    marginBottom: Spacing.md,
        fontWeight: '600'
  },
  termsText: {
    ...GlobalStyles.body,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  errorText: {
    ...GlobalStyles.errorText,
    textAlign: 'center',
  },
})
