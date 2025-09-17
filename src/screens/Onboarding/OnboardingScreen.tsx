import React, { useState, useRef } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Text, Dimensions, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import OnboardingSlide from '../../components/OnboardingSlide';

const { width, height } = Dimensions.get('window');

// Import SVG assets
import ShoppingSvg from '../../assets/onboarding/shopping.svg';
import DeliverySvg from '../../assets/onboarding/delivery.svg';
import CheckoutSvg from '../../assets/onboarding/checkout.svg';

const slides = [
  {
    id: '1',
    title: 'Welcome to MyFoodAngels',
    description: 'Discover a world of delicious food and groceries at your fingertips. Browse through thousands of products from local and international vendors.',
    image: ShoppingSvg,
  },
  {
    id: '2',
    title: 'Quick Delivery',
    description: 'Get your orders delivered to your doorstep quickly. Track your delivery in real-time and enjoy our fast and reliable service.',
    image: DeliverySvg,
  },
  {
    id: '3',
    title: 'Secure Checkout',
    description: 'Pay securely using multiple payment methods. Your transactions are protected with industry-standard security measures.',
    image: CheckoutSvg,
  },
];

const OnboardingScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const navigation = useNavigation();

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = () => {
    // Navigate to Login screen
    navigation.navigate('Auth', { screen: 'Login' });
  };

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  const renderDots = () => {
    return slides.map((_, index) => (
      <View
        key={index}
        style={[
          styles.dot,
          { backgroundColor: index === currentIndex ? '#FF6B6B' : '#DDDDDD' },
        ]}
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

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

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
    backgroundColor: '#FF6B6B',
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
});

export default OnboardingScreen;