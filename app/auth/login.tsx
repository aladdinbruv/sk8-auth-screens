import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  TextInput,
  ScrollView,
  ViewStyle,
  TextStyle,
  ImageStyle,
  StyleProp,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Import custom components and hooks
import AnimatedInput from '../../components/ui/AnimatedInput';
import GradientButton from '../../components/ui/GradientButton';
import SocialButton from '../../components/ui/SocialButton';
import { useTheme } from '../../contexts/ThemeContext';
import useForm from '../../hooks/useForm';
import { isEmailValid, isPasswordValid } from '../../utils/validation';
import { COLORS, FONTS, LAYOUT, SPACING, ANIMATION } from '../../constants/theme';
import theme from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';

interface LoginFormValues {
  email: string;
  password: string;
}

const LoginScreen = () => {
  // Use SHADOWS from theme import
  const SHADOWS = theme.SHADOWS;
  
  const router = useRouter();
  const { isDark, colors } = useTheme();
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Refs for focusing inputs
  const passwordInputRef = useRef<TextInput>(null);
  
  // Form handling with validation
  const { 
    formState, 
    handleChange, 
    handleBlur, 
    validateForm, 
    isValid 
  } = useForm<LoginFormValues>(
    {
      email: '',
      password: '',
    },
    {
      email: {
        required: true,
        validate: isEmailValid,
        errorMessage: 'Please enter a valid email address',
      },
      password: {
        required: true,
        validate: isPasswordValid,
        errorMessage: 'Password must be at least 6 characters',
      },
    },
    true, // Validate on change
    300 // Debounce time
  );
  
  // Animation values
  const logoScale = useSharedValue(0);
  const formOpacity = useSharedValue(0);
  const socialOpacity = useSharedValue(0);
  
  // Load custom fonts
  const [fontsLoaded] = useFonts({
    'Bangers': require('../../assets/fonts/Bangers-Regular.ttf'),
    'Roboto': require('../../assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Bold': require('../../assets/fonts/Roboto-Bold.ttf'),
  });

  useEffect(() => {
    // Staggered animations
    setTimeout(() => {
      // Animate logo with bounce
      logoScale.value = withSequence(
        withTiming(ANIMATION.scale.emphasis, { duration: ANIMATION.duration.slow }),
        withSpring(ANIMATION.scale.normal)
      );
      
      // Fade in form elements with a slide up
      setTimeout(() => {
        formOpacity.value = withTiming(1, { 
          duration: ANIMATION.duration.extraSlow,
          easing: Easing.out(Easing.cubic)
        });
      }, 300);
      
      // Fade in social buttons last
      setTimeout(() => {
        socialOpacity.value = withTiming(1, { 
          duration: ANIMATION.duration.extraSlow,
          easing: Easing.out(Easing.cubic)
        });
      }, 600);
    }, 100);
  }, []);

  // Animated styles
  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: logoScale.value }]
    };
  });

  const formAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: formOpacity.value,
      transform: [{ translateY: (1 - formOpacity.value) * 50 }]
    };
  });
  
  const socialAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: socialOpacity.value,
      transform: [{ translateY: (1 - socialOpacity.value) * 30 }]
    };
  });

  // Handle login
  const handleLogin = async () => {
    const isFormValid = validateForm();
    setErrorMessage(''); // Clear previous errors
    
    if (isFormValid) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Call the login method from auth context
        const result = await login(formState.email.value, formState.password.value);
        
        if (result.success) {
          // If login is successful, the AuthProvider will update isAuthenticated
          // And the app/index.tsx will handle the redirect to tabs
          console.log('Login successful');
        } else {
          // Show error message
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          console.error('Login failed:', result.message);
          setErrorMessage(result.message || 'Login failed');
        }
      } catch (error) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        console.error('Login error:', error);
        setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrorMessage('Please fix the errors in the form');
    }
  };
  
  // Handle social login
  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Navigate to OAuth URL
    // This would typically open a web browser for OAuth flow
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1613427467826-928f2837f373?q=80&w=1742&auto=format&fit=crop' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.4)']}
          style={styles.gradient}
        >
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Animated.View 
                style={[styles.logoContainer, logoAnimatedStyle]}
                accessibilityRole="header"
              >
                <Text 
                  style={[styles.appName, { color: colors.text }]}
                  accessibilityLabel="SK8 App Logo"
                >
                  SK8
                </Text>
                <FontAwesome5 
                  name="bolt" 
                  size={42} 
                  color={colors.primaryBlue} 
                  accessibilityLabel="Lightning bolt icon"
                />
              </Animated.View>
              
              <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
                <AnimatedInput
                  icon="envelope"
                  iconColor={colors.primaryBlue}
                  placeholder="Email"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={formState.email.value}
                  onChangeText={(text) => handleChange('email', text)}
                  onBlur={() => handleBlur('email')}
                  validationState={formState.email.validationState}
                  errorMessage={formState.email.error}
                  returnKeyType="next"
                  nextInputRef={passwordInputRef}
                  accessibilityLabel="Email input"
                  accessibilityHint="Enter your email address"
                />
                
                <AnimatedInput
                  ref={passwordInputRef}
                  icon="lock"
                  iconColor={colors.primaryBlue}
                  placeholder="Password"
                  isSecure
                  value={formState.password.value}
                  onChangeText={(text) => handleChange('password', text)}
                  onBlur={() => handleBlur('password')}
                  validationState={formState.password.validationState}
                  errorMessage={formState.password.error}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  accessibilityLabel="Password input"
                  accessibilityHint="Enter your password"
                />
                
                {errorMessage ? (
                  <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: colors.error }]}>
                      {errorMessage}
                    </Text>
                  </View>
                ) : null}
                
                <GradientButton
                  title="Login"
                  onPress={handleLogin}
                  colors={colors.gradientBlue}
                  style={styles.loginButton}
                  disabled={!isValid}
                  accessibilityLabel="Login button"
                  accessibilityHint="Tap to login to your account"
                />
                
                <Text style={[styles.forgotPassword, { color: colors.primaryBlue }]}>
                  Forgot Password?
                </Text>
                
                <View style={styles.orContainer}>
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  <Text style={[styles.orText, { color: colors.textSecondary }]}>OR</Text>
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                </View>
              </Animated.View>
              
              <Animated.View style={[styles.socialContainer, socialAnimatedStyle]}>
                <SocialButton
                  provider="google"
                  onPress={() => handleSocialLogin('Google')}
                  style={styles.socialButton}
                />
                
                <SocialButton
                  provider="apple"
                  onPress={() => handleSocialLogin('Apple')}
                  style={styles.socialButton}
                />
                
                <View style={styles.registerLinkContainer}>
                  <Text style={[styles.registerText, { color: colors.textSecondary }]}>
                    New to the park?
                  </Text>
                  <Link href="/auth/register" asChild>
                    <Text style={[styles.registerLink, { color: colors.primaryBlue }]}>
                      Sign up
                    </Text>
                  </Link>
                </View>
              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.l,
    paddingTop: SPACING.xxl * 2,
    paddingBottom: SPACING.xxl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.m,
  },
  appName: {
    fontFamily: FONTS.bangers,
    fontSize: FONTS.h1,
    textShadowColor: 'rgba(0, 229, 255, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  loginButton: {
    marginTop: SPACING.s,
  },
  forgotPassword: {
    fontFamily: FONTS.roboto,
    textAlign: 'center',
    marginTop: SPACING.l,
    fontSize: FONTS.body,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  orText: {
    fontFamily: FONTS.roboto,
    marginHorizontal: SPACING.m,
    fontSize: FONTS.caption,
  },
  socialContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  socialButton: {
    marginBottom: SPACING.m,
  },
  registerLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.l,
    gap: SPACING.xs,
  },
  registerText: {
    fontFamily: FONTS.roboto,
  },
  registerLink: {
    fontFamily: FONTS.robotoBold,
  },
  errorContainer: {
    marginTop: SPACING.m,
    marginBottom: SPACING.m,
    padding: SPACING.s,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  errorText: {
    fontFamily: FONTS.roboto,
    fontSize: FONTS.body,
    textAlign: 'center',
  },
});

export default LoginScreen; 
