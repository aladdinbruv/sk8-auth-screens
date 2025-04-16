import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '../../contexts/ThemeContext';
import ThemeToggle from '../../components/ui/ThemeToggle';
import { SPACING } from '../../constants/theme';

export default function AuthLayout() {
  return (
    <ThemeProvider defaultMode="dark">
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
    </ThemeProvider>
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