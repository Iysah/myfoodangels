import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { firestore } from './config';
import { doc, setDoc } from 'firebase/firestore';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Register for push notifications
export const registerForPushNotifications = async (userId: string) => {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    })).data;
  } else {
    console.log('Must use physical device for Push Notifications');
    return;
  }

  // Save the token to Firestore
  if (token) {
    try {
      await setDoc(doc(firestore, 'userTokens', userId), {
        token,
        device: Device.modelName,
        platform: Platform.OS,
        updatedAt: new Date(),
      });
      return token;
    } catch (error) {
      console.error('Error saving push token:', error);
      throw error;
    }
  }
};

// Add notification listeners
export const addNotificationListeners = () => {
  const notificationListener = Notifications.addNotificationReceivedListener(
    notification => {
      console.log('Notification received:', notification);
    }
  );

  const responseListener = Notifications.addNotificationResponseReceivedListener(
    response => {
      console.log('Notification response received:', response);
      // Handle notification response (e.g., navigate to a specific screen)
    }
  );

  return () => {
    notificationListener.remove();
    responseListener.remove();
  };
};

// Send local notification for testing
export const sendLocalNotification = async (title: string, body: string, data: any = {}) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: null, // null means send immediately
  });
};