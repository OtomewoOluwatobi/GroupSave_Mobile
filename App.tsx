import React, { useEffect, useState } from 'react';
import { StatusBar, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Toast, { BaseToast, BaseToastProps, ErrorToast } from 'react-native-toast-message';
import { AlertNotificationRoot } from 'react-native-alert-notification';
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

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        setIsAuthenticated(!!token);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuthStatus();
  }, []);

  if (isAuthenticated === null) {
    return null; // Optionally, render a loading indicator here
  }

  return (
    <SafeAreaProvider>
      <AlertNotificationRoot>
        <View style={{ flex: 1 }}>
          <StatusBar barStyle="light-content" />
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{ headerShown: false }}
              initialRouteName="Dashboard"
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
