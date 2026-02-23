import React, { useEffect, useState, useRef, useCallback } from 'react';
import { StatusBar, View, AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Toast, { BaseToast, BaseToastProps, ErrorToast } from 'react-native-toast-message';
import { AlertNotificationRoot, ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './screens/HomeScreen';
import SigninScreen from './screens/SigninScreen';
import SignupScreen from './screens/SignupScreen';
import DashboardScreen from './screens/auth/user/DashboardScreen';
import CreateGroupScreen from './screens/auth/user/groups/CreateGroupScreen';
import GroupDetailsScreen from './screens/auth/user/groups/GroupDetailsScreen';

type RootStackParamList = {
  Home: undefined;
  Signin: undefined;
  Signup: undefined;
  Dashboard: undefined;
  CreateGroup: undefined;
  GroupDetails: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const toastConfig = {
  success: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#00a97b' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 15, fontWeight: '500' }}
      text2Style={{ fontSize: 13 }}
    />
  ),
  error: (props: BaseToastProps) => (
    <ErrorToast
      {...props}
      text1Style={{ fontSize: 15, fontWeight: '500' }}
      text2Style={{ fontSize: 13 }}
    />
  )
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  const tokenCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef(AppState.currentState);

  // Logout function
  const handleLogout = useCallback(async (showMessage: boolean = true) => {
    await AsyncStorage.multiRemove(['token', 'user', 'tokenExpiresAt']);
    setIsAuthenticated(false);
    
    if (showMessage) {
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: 'Session Expired',
        textBody: 'Your session has expired. Please sign in again.',
        button: 'OK',
      });
    }

    // Navigate to Signin
    if (navigationRef.current?.isReady()) {
      navigationRef.current.reset({
        index: 0,
        routes: [{ name: 'Signin' }],
      });
    }
  }, []);

  // Check if token is expired
  const checkTokenExpiration = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const expiresAtStr = await AsyncStorage.getItem('tokenExpiresAt');
      
      if (!token || !expiresAtStr) {
        return false;
      }

      const expiresAt = parseInt(expiresAtStr, 10);
      const now = Date.now();
      
      // Check if token is expired or will expire in next 30 seconds
      if (now >= expiresAt - 30000) {
        await handleLogout(true);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return false;
    }
  }, [handleLogout]);

  // Setup token expiration timer
  const setupExpirationTimer = useCallback(async () => {
    // Clear existing interval
    if (tokenCheckInterval.current) {
      clearInterval(tokenCheckInterval.current);
    }

    const expiresAtStr = await AsyncStorage.getItem('tokenExpiresAt');
    if (!expiresAtStr) return;

    const expiresAt = parseInt(expiresAtStr, 10);
    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;

    // If already expired
    if (timeUntilExpiry <= 0) {
      await handleLogout(true);
      return;
    }

    // Set timeout to logout when token expires
    const timeoutId = setTimeout(async () => {
      await handleLogout(true);
    }, timeUntilExpiry - 30000); // Logout 30 seconds before expiry

    // Also check every minute as a safety net
    tokenCheckInterval.current = setInterval(checkTokenExpiration, 60000);

    return () => clearTimeout(timeoutId);
  }, [handleLogout, checkTokenExpiration]);

  // Handle app state changes (foreground/background)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      // App came to foreground
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        await checkTokenExpiration();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [checkTokenExpiration]);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const expiresAtStr = await AsyncStorage.getItem('tokenExpiresAt');
        
        if (!token) {
          setIsAuthenticated(false);
          return;
        }

        // Check if token is expired
        if (expiresAtStr) {
          const expiresAt = parseInt(expiresAtStr, 10);
          if (Date.now() >= expiresAt) {
            // Token expired, clear storage and set as not authenticated
            await AsyncStorage.multiRemove(['token', 'user', 'tokenExpiresAt']);
            setIsAuthenticated(false);
            return;
          }
        }

        setIsAuthenticated(true);
        // Setup expiration timer for valid token
        await setupExpirationTimer();
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuthStatus();

    // Cleanup interval on unmount
    return () => {
      if (tokenCheckInterval.current) {
        clearInterval(tokenCheckInterval.current);
      }
    };
  }, [setupExpirationTimer]);

  // Handle navigation state changes to setup timer after login
  const onNavigationStateChange = useCallback(async () => {
    const currentRoute = navigationRef.current?.getCurrentRoute()?.name;
    if (currentRoute === 'Dashboard') {
      const token = await AsyncStorage.getItem('token');
      const expiresAtStr = await AsyncStorage.getItem('tokenExpiresAt');
      if (token && expiresAtStr && !tokenCheckInterval.current) {
        await setupExpirationTimer();
      }
    }
  }, [setupExpirationTimer]);

  if (isAuthenticated === null) {
    return null; // Optionally, render a loading indicator here
  }

  return (
    <SafeAreaProvider>
      <AlertNotificationRoot>
        <View style={{ flex: 1 }}>
          <StatusBar barStyle="light-content" />
          <NavigationContainer ref={navigationRef} onStateChange={onNavigationStateChange}>
            <Stack.Navigator
              screenOptions={{ headerShown: false }}
              initialRouteName={isAuthenticated ? "Dashboard" : "Signin"}
            >
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Signin" component={SigninScreen} />
              <Stack.Screen name="Signup" component={SignupScreen} />
              <Stack.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{ gestureEnabled: false }}
              />
              <Stack.Screen
                name="CreateGroup"
                component={CreateGroupScreen}
                options={{ gestureEnabled: false }}
              />
              <Stack.Screen
                name="GroupDetails"
                component={GroupDetailsScreen}
                options={{
                  headerShown: false
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
          <Toast config={toastConfig} />
        </View>
      </AlertNotificationRoot>
    </SafeAreaProvider>
  );
}
