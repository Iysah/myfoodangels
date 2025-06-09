import { StatusBar, StyleSheet, Text, View, Image } from 'react-native'
import React, { FC, useState } from 'react'
import PageWrapper from '../../../components/wrapper'
import { GLOBALSTYLES } from '../../../styles/globalStyles'
import { theme } from '../../../config/theme'
import { Check } from 'lucide-react-native'
import { typography } from '../../../config/typography'
import { UserRole } from '../../../types/user'
import { store } from '../../../store/root'
import SolidButton from '../../../components/button/solidButton'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import Constants from 'expo-constants'
import { spacing } from '../../../config/spacing'
import { LinearGradient } from 'expo-linear-gradient'

const OnboardingRoleScreen:FC<any> = ({ navigation }) => {
  const [step, setStep] = useState('')
  const [currentStep, setCurrentStep] = useState<'role' | 'features'>('role');

  const handleNext = () => {
    if (currentStep === 'role') {
      setCurrentStep('features');
    } else {
      navigation.navigate('Signup');
    }
  };
  
  const renderRoleFeatures = () => {
    if (store.auth.role === UserRole.ATHLETE) {
      return (
        <View style={styles.card}>
          <View style={styles.cardItem}>
            <View style={styles.iconWrapper}>
              <Check color={theme.colors.lightBg} size={18} />
            </View>
            <Text style={[styles.cardText, { flexShrink: 1 }]}>Create a verified profile with stats and videos.</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.cardItem}>
            <View style={styles.iconWrapper}>
              <Check color={theme.colors.lightBg} size={18} />
            </View>
            <Text style={[styles.cardText, { flexShrink: 1 }]}>Apply for trials and track your status.</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.cardItem}>
            <View style={styles.iconWrapper}>
              <Check color={theme.colors.lightBg} size={18} />
            </View>
            <Text style={[styles.cardText, { flexShrink: 1 }]}>Get discovered by professional scouts.</Text>
          </View>
        </View>
      );
    } else if (store.auth.role === UserRole.SCOUT) {
      return (
        <View style={styles.card}>
          <View style={styles.cardItem}>
            <View style={styles.iconWrapper}>
              <Check color={theme.colors.lightBg} size={18} />
            </View>
            <Text style={[styles.cardText, { flexShrink: 1 }]}>Discover athletes with advanced filters.</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.cardItem}>
            <View style={styles.iconWrapper}>
              <Check color={theme.colors.lightBg} size={18} />
            </View>
            <Text style={[styles.cardText, { flexShrink: 1 }]}>Post and manage trials and events.</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.cardItem}>
            <View style={styles.iconWrapper}>
              <Check color={theme.colors.lightBg} size={18} />
            </View>
            <Text style={[styles.cardText, { flexShrink: 1 }]}>Connect directly through messaging and video calls.</Text>
          </View>
        </View>
      );
    }

    return null;
  }

  const renderPlatformFeatures = () => {
    return (
      <View style={styles.card}>
        <View style={styles.cardItem}>
          <View style={styles.iconWrapper}>
            <Check color={theme.colors.lightBg} size={18} />
          </View>
          <Text style={[styles.cardText, { flexShrink: 1 }]}>Verified profiles for credibility.</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardItem}>
          <View style={styles.iconWrapper}>
            <Check color={theme.colors.lightBg} size={18} />
          </View>
          <Text style={[styles.cardText, { flexShrink: 1 }]}>Secure application and trial processes.</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardItem}>
          <View style={styles.iconWrapper}>
            <Check color={theme.colors.lightBg} size={18} />
          </View>
          <Text style={[styles.cardText, { flexShrink: 1 }]} numberOfLines={2}>Endorsements to showcase achievements.</Text>
        </View>
      </View>
    );
  }

  const renderRoleImage = () => {
    if (store.auth.role === UserRole.ATHLETE) {
      return (
        <View style={styles.imageWrapper}>
          <Image source={require('../../../../assets/athlete.png')} />
        </View>
      )
    } else if (store.auth.role === UserRole.SCOUT) {
      return (
        <View style={styles.imageWrapper}>
          <Image source={require('../../../../assets/scout.png')} />
        </View>
      )
    } 
    return null
  }
  return (
    <LinearGradient
      // Button Linear Gradient
      colors={['#FFFFFF', '#EEEEFF']}
      style={{
          flex: 1,
      }}
    >
      <SafeAreaProvider style={{ backgroundColor: 'transparent', position: 'relative', paddingTop: Constants.statusBarHeight }}>
        <StatusBar backgroundColor={'#fff'} barStyle={'dark-content'} />
        <View style={styles.wrapper}>
          <View style={styles.welcomeWrapper}>
            {currentStep === 'role' ? (
              <View>
                {renderRoleImage()}
                <Text style={[GLOBALSTYLES.title, { marginBottom: spacing.xs }]}>What You Can Do</Text>
                {renderRoleFeatures()}
              </View>
            ) : (
              <View>
                <View style={[styles.imageWrapper, { height: 350 }]}>
                  <Image source={require('../../../../assets/platform.png')} />
                </View>
                <Text style={styles.title}>Building Trust in Sports</Text>
                <Text>Confluenx ensures verified profiles, secure connections, and transparent interactions.</Text>
                {renderPlatformFeatures()}
              </View>
            )}

            <SolidButton title={currentStep === 'role' ? 'Next' : 'Continue'} onPress={handleNext} />
          </View>
        </View>
      </SafeAreaProvider>
    </LinearGradient>
  )
}

export default OnboardingRoleScreen

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'column',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg
  },
  welcomeWrapper: {
    width: '100%',
  },
  imageWrapper: {
    width: '100%',
    height: 400,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  card: {
    backgroundColor: '#D9D9FF',
    borderRadius: theme.borderRadius.xl,
    padding: spacing.md,
    marginTop: spacing.md,
    // color: '#F4F4F4'
  },
  cardItem: {
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrapper: {
    borderRadius: theme.borderRadius.xl,
    width: spacing.lg,
    height: spacing.lg,
    backgroundColor: theme.colors.primary,
    padding: spacing.md,

    justifyContent: 'center',
    alignItems: 'center'
  },
  cardText: {
    fontSize: typography.fontSize.md,
    fontWeight: '400',
  },
  divider: {
    height: 1,
    backgroundColor: '#ECECEC',
    marginHorizontal: 30,
    marginVertical: spacing.sm
  }
})