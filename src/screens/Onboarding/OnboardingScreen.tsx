import React, { useState, useRef } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Text, Dimensions, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList, RootStackParamList } from '../../navigation/types';
import { CompositeNavigationProp } from '@react-navigation/native';
import { observer } from 'mobx-react-lite';
import OnboardingSlide from '../../components/OnboardingSlide';
import { useStores } from '../../contexts/StoreContext';
import { Colors } from '../../styles/globalStyles';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Farm to Table, Made Easy',
    description: 'Get the freshest produce straight from trusted local farmers.',
    image: require('../../assets/onboarding/onboarding-a.png'),
  },
  {
    id: '2',
    title: 'Freshness You Can Trust',
    description: 'Freshness guaranteed with every order.',
    image: require('../../assets/onboarding/onboarding-b.png'), 
  },
  {
    id: '3',
    title: 'Your Farm Shop, Anytime, Anywhere',
    description: 'Shop with just a tap and get your produce delivered straight to your doorstep.',
    image: require('../../assets/onboarding/onboarding-c.png'),
  },
];

type OnboardingScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<AuthStackParamList, 'Onboarding'>,
  StackNavigationProp<RootStackParamList>
>;

const OnboardingScreen = observer(() => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  const { onboardingStore, authStore } = useStores();

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      try {
        flatListRef.current?.scrollToIndex({ 
          index: nextIndex, 
          animated: true 
        });
      } catch (error) {
        // Fallback to scrollToOffset if scrollToIndex fails
        flatListRef.current?.scrollToOffset({
          offset: nextIndex * width,
          animated: true
        });
      }
      // Update state after a small delay to ensure scroll completes
      setTimeout(() => {
        setCurrentIndex(nextIndex);
      }, 100);
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = async () => {
    // Complete onboarding
    await onboardingStore.completeOnboarding();
    // Navigate to Login screen
    navigation.navigate('Login');
  };

  const handleContinueAsGuest = async () => {
    // Complete onboarding and enter guest mode
    await onboardingStore.completeOnboarding();
    authStore.enterGuestMode();
    // Navigate to main app using parent navigation
    navigation.getParent()?.navigate('Main');
  };

  const handleSignUp = async () => {
    // Complete onboarding
    await onboardingStore.completeOnboarding();
    // Navigate to Register screen
    navigation.navigate('Register');
  };

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  const handleDotPress = (index: number) => {
    try {
      flatListRef.current?.scrollToIndex({ 
        index, 
        animated: true 
      });
    } catch (error) {
      // Fallback to scrollToOffset if scrollToIndex fails
      flatListRef.current?.scrollToOffset({
        offset: index * width,
        animated: true
      });
    }
    // Update state after a small delay to ensure scroll completes
    setTimeout(() => {
      setCurrentIndex(index);
    }, 100);
  };

  const renderDots = () => {
    return slides.map((_, index) => (
      <TouchableOpacity
        key={index}
        style={[
          styles.dot,
          { backgroundColor: index === currentIndex ? '#7AB42C' : '#E4F0D5' },
        ]}
        onPress={() => handleDotPress(index)}
      />
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.skipContainer}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={({ item }) => (
          <OnboardingSlide
            title={item.title}
            description={item.description}
            image={item.image}
          />
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />

      <View style={styles.bottomContainer}>
        <View style={styles.dotsContainer}>{renderDots()}</View>

        {currentIndex === slides.length - 1 ? (
          <View style={styles.finalButtonsContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleGetStarted}>
              <Text style={styles.primaryButtonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.guestButton, { justifyContent: 'center', flexDirection: 'row', gap: 4 }]} onPress={handleSignUp}>
              <Text>Don't have an account?</Text>
              <Text style={styles.guestButtonText}>Sign Up</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.guestButton} onPress={handleContinueAsGuest}>
              <Text style={styles.guestButtonText}>Continue as Guest</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  skipContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  skipText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  finalButtonsContainer: {
    width: '100%',
    paddingHorizontal: 20,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#7AB42C',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    // elevation: 3,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.2,
    // shadowRadius: 3,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#7AB42C',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#7AB42C',
    fontSize: 16,
    fontWeight: 'bold',
  },
  guestButton: {
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  guestButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
    textDecorationColor: Colors.primary
  },
});

export default OnboardingScreen;