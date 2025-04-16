import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ImageBackground,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
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

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const username = useSharedValue('');
  const password = useSharedValue('');
  
  // Animation values
  const logoScale = useSharedValue(0);
  const formOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  
  // Load custom fonts
  const [fontsLoaded] = useFonts({
    'Bangers': require('../../assets/fonts/Bangers-Regular.ttf'),
    'Roboto': require('../../assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Bold': require('../../assets/fonts/Roboto-Bold.ttf'),
  });

  useEffect(() => {
    // Animate logo on mount
    logoScale.value = withSequence(
      withTiming(1.2, { duration: 500 }),
      withSpring(1)
    );
    
    // Fade in form elements
    formOpacity.value = withTiming(1, { 
      duration: 800,
      easing: Easing.out(Easing.cubic)
    });
  }, []);

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

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }]
    };
  });

  const handlePressIn = () => {
    buttonScale.value = withTiming(0.95, { duration: 100 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    buttonScale.value = withTiming(1, { duration: 200 });
  };

  const handleLogin = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Add login logic here
    console.log('Login attempt');
    // Navigate to main app
    // router.replace('/(tabs)');
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
          colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.85)']}
          style={styles.gradient}
        >
          <StatusBar style="light" />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
          >
            <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
              <Text style={styles.appName}>SK8 </Text>
              <FontAwesome5 name="faSnowboarding" size={42} color="#00E5FF" />
            </Animated.View>
            
            <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
              <View style={styles.inputContainer}>
                <FontAwesome5 name="user" size={18} color="#00E5FF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor="#999"
                  onChangeText={(text) => username.value = text}
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <FontAwesome5 name="lock" size={18} color="#00E5FF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#999"
                  secureTextEntry
                  onChangeText={(text) => password.value = text}
                />
              </View>
              
              <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
                <Pressable
                  style={styles.loginButton}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  onPress={handleLogin}
                >
                  <LinearGradient
                    colors={['#00E5FF', '#00ADFF']}
                    start={[0, 0]}
                    end={[1, 0]}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.loginButtonText}>Login</Text>
                  </LinearGradient>
                </Pressable>
              </Animated.View>
              
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
              
              <View style={styles.registerLinkContainer}>
                <Text style={styles.registerText}>New to the park?</Text>
                <Link href="/auth/register" asChild>
                  <Pressable>
                    <Text style={styles.registerLink}>Sign up</Text>
                  </Pressable>
                </Link>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </LinearGradient>
      </ImageBackground>
    </SafeAreaView>
  );
}

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
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  appName: {
    fontFamily: 'Bangers',
    fontSize: 60,
    color: '#FFF',
    textShadowColor: 'rgba(0, 229, 255, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: 16,
    height: 60,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 15,
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontFamily: 'Roboto',
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButton: {
    borderRadius: 30,
    overflow: 'hidden',
    height: 55,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loginButtonText: {
    fontFamily: 'Roboto-Bold',
    fontSize: 18,
    color: '#FFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  forgotPassword: {
    fontFamily: 'Roboto',
    color: '#00E5FF',
    textAlign: 'center',
    marginBottom: 20,
  },
  registerLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  registerText: {
    fontFamily: 'Roboto',
    color: '#CCC',
  },
  registerLink: {
    fontFamily: 'Roboto-Bold',
    color: '#00E5FF',
  },
}); 