import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ImageBackground,
  ScrollView,
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
  withTiming,
  Easing,
  withSequence,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Validation states
  const [emailValid, setEmailValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const formOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const emailBorderColor = useSharedValue(0);
  const passwordBorderColor = useSharedValue(0);
  const confirmBorderColor = useSharedValue(0);
  
  // Load custom fonts
  const [fontsLoaded] = useFonts({
    'Bangers': require('../../assets/fonts/Bangers-Regular.ttf'),
    'Roboto': require('../../assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Bold': require('../../assets/fonts/Roboto-Bold.ttf'),
  });

  useEffect(() => {
    // Animations for screen elements
    headerOpacity.value = withTiming(1, { duration: 600 });
    formOpacity.value = withTiming(1, { 
      duration: 800,
      easing: Easing.out(Easing.cubic)
    });
  }, []);

  // Validate email
  useEffect(() => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    setEmailValid(isValid);
    
    if (email) {
      emailBorderColor.value = withTiming(isValid ? 1 : 2, { duration: 300 });
    } else {
      emailBorderColor.value = withTiming(0, { duration: 300 });
    }
  }, [email]);

  // Validate password
  useEffect(() => {
    const isValid = password.length >= 6;
    setPasswordValid(isValid);
    
    if (password) {
      passwordBorderColor.value = withTiming(isValid ? 1 : 2, { duration: 300 });
    } else {
      passwordBorderColor.value = withTiming(0, { duration: 300 });
    }
  }, [password]);

  // Validate passwords match
  useEffect(() => {
    const doMatch = password === confirmPassword && password.length > 0;
    setPasswordsMatch(doMatch);
    
    if (confirmPassword) {
      confirmBorderColor.value = withTiming(doMatch ? 1 : 2, { duration: 300 });
    } else {
      confirmBorderColor.value = withTiming(0, { duration: 300 });
    }
  }, [password, confirmPassword]);

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
      transform: [{ translateY: (1 - headerOpacity.value) * -30 }]
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

  const emailContainerStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      emailBorderColor.value,
      [0, 1, 2],
      ['rgba(255, 255, 255, 0.15)', '#1AE92F', '#FF3B55']
    );
    
    return {
      borderColor
    };
  });

  const passwordContainerStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      passwordBorderColor.value,
      [0, 1, 2],
      ['rgba(255, 255, 255, 0.15)', '#1AE92F', '#FF3B55']
    );
    
    return {
      borderColor
    };
  });

  const confirmContainerStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      confirmBorderColor.value,
      [0, 1, 2],
      ['rgba(255, 255, 255, 0.15)', '#1AE92F', '#FF3B55']
    );
    
    return {
      borderColor
    };
  });

  const handlePressIn = () => {
    buttonScale.value = withTiming(0.95, { duration: 100 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    buttonScale.value = withTiming(1, { duration: 200 });
  };

  const handleRegister = () => {
    if (emailValid && passwordValid && passwordsMatch && fullName && username) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      console.log('Registration attempt');
      // Navigate to main app or verification screen
      // router.replace('/(tabs)');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1564417510515-b3d20c821653?q=80&w=1664&auto=format&fit=crop' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']}
          style={styles.gradient}
        >
          <StatusBar style="light" />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
          >
            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Animated.View style={[styles.headerContainer, headerAnimatedStyle]}>
                <FontAwesome5 name="fire" size={32} color="#FF47D2" style={styles.headerIcon} />
                <Text style={styles.headerText}>Join the Crew</Text>
              </Animated.View>
              
              <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
                <View style={styles.inputContainer}>
                  <FontAwesome5 name="user-alt" size={16} color="#FF47D2" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor="#999"
                    onChangeText={setFullName}
                  />
                </View>
                
                <Animated.View style={[styles.inputContainer, emailContainerStyle]}>
                  <FontAwesome5 name="envelope" size={16} color="#FF47D2" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onChangeText={setEmail}
                  />
                  {email ? (
                    <FontAwesome5 
                      name={emailValid ? "check-circle" : "exclamation-circle"} 
                      size={18} 
                      color={emailValid ? "#1AE92F" : "#FF3B55"} 
                    />
                  ) : null}
                </Animated.View>
                
                <View style={styles.inputContainer}>
                  <FontAwesome5 name="user" size={16} color="#FF47D2" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Username"
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                    onChangeText={setUsername}
                  />
                </View>
                
                <Animated.View style={[styles.inputContainer, passwordContainerStyle]}>
                  <FontAwesome5 name="lock" size={16} color="#FF47D2" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#999"
                    secureTextEntry
                    onChangeText={setPassword}
                  />
                  {password ? (
                    <FontAwesome5 
                      name={passwordValid ? "check-circle" : "exclamation-circle"} 
                      size={18} 
                      color={passwordValid ? "#1AE92F" : "#FF3B55"} 
                    />
                  ) : null}
                </Animated.View>
                
                <Animated.View style={[styles.inputContainer, confirmContainerStyle]}>
                  <FontAwesome5 name="lock" size={16} color="#FF47D2" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor="#999"
                    secureTextEntry
                    onChangeText={setConfirmPassword}
                  />
                  {confirmPassword ? (
                    <FontAwesome5 
                      name={passwordsMatch ? "check-circle" : "exclamation-circle"} 
                      size={18} 
                      color={passwordsMatch ? "#1AE92F" : "#FF3B55"} 
                    />
                  ) : null}
                </Animated.View>
                
                <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
                  <Pressable
                    style={styles.registerButton}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    onPress={handleRegister}
                  >
                    <LinearGradient
                      colors={['#FF47D2', '#FF2876']}
                      start={[0, 0]}
                      end={[1, 0]}
                      style={styles.buttonGradient}
                    >
                      <Text style={styles.registerButtonText}>Sign Up</Text>
                    </LinearGradient>
                  </Pressable>
                </Animated.View>
                
                <View style={styles.loginLinkContainer}>
                  <Text style={styles.loginText}>Already part of the crew?</Text>
                  <Link href="/auth/login" asChild>
                    <Pressable>
                      <Text style={styles.loginLink}>Login</Text>
                    </Pressable>
                  </Link>
                </View>
              </Animated.View>
            </ScrollView>
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
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 40,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  headerIcon: {
    marginRight: 5,
  },
  headerText: {
    fontFamily: 'Bangers',
    fontSize: 40,
    color: '#FFF',
    textShadowColor: 'rgba(255, 71, 210, 0.75)',
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
    height: 55,
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
    shadowColor: '#FF47D2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  registerButton: {
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
  registerButtonText: {
    fontFamily: 'Roboto-Bold',
    fontSize: 18,
    color: '#FFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  loginText: {
    fontFamily: 'Roboto',
    color: '#CCC',
  },
  loginLink: {
    fontFamily: 'Roboto-Bold',
    color: '#FF47D2',
  },
}); 