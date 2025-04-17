import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeToggle from '../../components/ui/ThemeToggle';
import { SPACING } from '../../constants/theme';

export default function AuthLayout() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { colors } = useTheme();

  // Redirect authenticated users to home
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading spinner while checking auth status
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primaryBlue} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack 
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen 
          name="login"
          options={{
            title: 'Login',
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="register" 
          options={{
            title: 'Register',
            headerShown: false,
          }}
        />
      </Stack>
      
      {/* Theme Toggle positioned in top right */}
      <View style={styles.themeToggleContainer}>
        <ThemeToggle size="small" />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  themeToggleContainer: {
    position: 'absolute',
    top: SPACING.xl + 30, // Extra space for the status bar
    right: SPACING.l,
    zIndex: 100,
  },
}); 