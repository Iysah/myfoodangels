import { StatusBar, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native'
import React, { FC } from 'react'
import PageWrapper from '../../../components/wrapper'
import { GLOBALSTYLES } from '../../../styles/globalStyles'
import SolidButton from '../../../components/button/solidButton'
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../../config/theme'
import { typography } from '../../../config/typography'
import { spacing } from '../../../config/spacing'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import Constants from 'expo-constants'
import BlueLogo from '../../../../assets/icons/navigation/blueLogo'
import OnboardIcon from '../../../../assets/icons/navigation/onboard'


const OnboardingWelcomeScreen: FC<any> = ({ navigation }) => {

  return (
    <LinearGradient
        // Button Linear Gradient
        colors={['#FFFFFF', '#75ACFF', '#060667', '#060667']}
        style={{
            flex: 1,
        }}
    >
        <SafeAreaProvider style={{ backgroundColor: 'transparent', position: 'relative', paddingTop: Constants.statusBarHeight }}>
            <StatusBar backgroundColor={'#fff'} barStyle={'dark-content'} />
            <View style={styles.wrapper}>
                <View style={styles.logoContainer}>
                    <BlueLogo style={{ height: 30 }} />
                    <Text style={styles.welcomeText}>Connecting Athletes and Scouts worldwide</Text>
                </View>

                <View style={styles.welcomeWrapper}>
                    <Image source={require('../../../../assets/onboard.png')} />
                </View>

                <View style={styles.welcomeWrapper}>
                    <TouchableOpacity onPress={() => navigation.navigate('RoleSelection')} style={styles.buttonContainer}>
                        <Text style={styles.buttonText}>Get Started</Text>
                    </TouchableOpacity>
                    {/* <SolidButton title='Get Started' onPress={() => navigation.navigate('RoleSelection')} /> */}

                    <View style={styles.authText}>
                        <Text style={styles.terms}>Already on Confluexe?</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text  style={[styles.terms, { fontWeight: '600' }]}>Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaProvider>
    </LinearGradient>
  )
}

export default OnboardingWelcomeScreen

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'column',
        marginBottom: spacing.xl
    },
    welcomeWrapper: {
        gap: theme.spacing.md,
    },
    welcomeText: {
        // marginBottom: theme.spacing.md,
        textAlign: 'center',
        color: theme.colors.primary,
        fontSize: 30,
        fontWeight: '600',
        marginBottom: spacing.sm,
        // lineHeight: 30,
    },
    buttonContainer: {
        backgroundColor: theme.colors.lightBg,
        paddingVertical: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        width: 350
      },
      buttonText: {
        color: theme.colors.primary,
        fontSize: 16,
        // fontFamily: 'Averta-Bold',
      },
      logoContainer: {
        marginTop: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.lg,
      },
    logoText: {
        fontSize: 40,
        textAlign: 'center',
        fontWeight: '600',
        color: '#fff',
    },
    authText: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing.sm
    },
    terms: {
        fontSize: typography.fontSize.sm,
        fontWeight: '400',
        lineHeight: 20,
        color: '#fff', 
        // marginHorizontal: theme.spacing.xl,
        textAlign: 'center',
        marginBottom: spacing.lg
    },
})