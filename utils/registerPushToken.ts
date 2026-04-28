import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants';

/**
 * Requests notification permissions, retrieves the Expo push token,
 * and registers it with the backend. Fails silently so it never
 * blocks the login flow.
 *
 * @param authToken  - The JWT returned by the login endpoint
 */
export async function registerPushToken(authToken: string): Promise<void> {
  try {
    // Push tokens are only available on physical devices
    if (!Constants.isDevice) {
      return;
    }

    // Request / check permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return;
    }

    // Android requires a notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#00a97b',
      });
    }

    // Get the Expo push token
    const projectId: string | undefined =
      Constants.expoConfig?.extra?.eas?.projectId || undefined;

    const tokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );

    const expoPushToken = tokenData.data;

    if (!expoPushToken) {
      return;
    }

    // Register the token with the backend
    const apiUrl = Constants.expoConfig?.extra?.apiUrl || '';
    await axios.post(
      `${apiUrl}/user/push-token`,
      { expo_push_token: expoPushToken },
      { headers: { Authorization: `Bearer ${authToken}`, Accept: 'application/json' } },
    );
  } catch {
    // Silently ignore — push token registration must never break login
  }
}
