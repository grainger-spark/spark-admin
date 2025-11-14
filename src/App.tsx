import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './providers';
import { LoginScreen, LoginScreenProvider } from './modules/auth/LoginScreen';
import { ChatScreen, ChatScreenProvider } from './modules/chat/ChatScreen';
import { NotificationsScreen, NotificationsScreenProvider } from './modules/notifications/NotificationsScreen';
import { ProfileScreen, ProfileScreenProvider } from './modules/profile/ProfileScreen';
import { colors } from './theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const ChatTab = () => (
  <ChatScreenProvider>
    <ChatScreen />
  </ChatScreenProvider>
);

const NotificationsTab = () => (
  <NotificationsScreenProvider>
    <NotificationsScreen />
  </NotificationsScreenProvider>
);

const ProfileTab = () => (
  <ProfileScreenProvider>
    <ProfileScreen />
  </ProfileScreenProvider>
);

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray400,
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Chat"
        component={ChatTab}
        options={{
          title: '✨ SPARK Chat',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsTab}
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileTab}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const LoginScreenWithProvider = () => (
  <LoginScreenProvider>
    <LoginScreen />
  </LoginScreenProvider>
);

const AppNavigator = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Login" component={LoginScreenWithProvider} />
      ) : (
        <Stack.Screen name="Main" component={MainTabs} />
      )}
    </Stack.Navigator>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
};
