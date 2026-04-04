/**
 * App.tsx — Navigation root and Authentication Gateway with OTP Verification
 */

import './src/tasks/backgroundTasks';
import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing,
  interpolate,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { io } from 'socket.io-client';

import HomeScreen from './src/screens/HomeScreen';
import ContactsScreen from './src/screens/ContactsScreen';
import RiskMapScreen from './src/screens/RiskMapScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { COLORS, SPACING, STORAGE_KEYS } from './src/constants';
import type { RootStackParamList, MainTabParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const { width, height } = Dimensions.get('window');

// ─── Bottom Tab Navigator ──────────────────────────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 65,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarIcon: ({ color, size, focused }) => {
          const icons: Record<string, string> = {
            Home:     focused ? 'shield'   : 'shield-outline',
            Contacts: focused ? 'people'   : 'people-outline',
            RiskMap:  focused ? 'map'      : 'map-outline',
            Settings: focused ? 'settings' : 'settings-outline',
          };
          return <Ionicons name={icons[route.name] as any || 'ellipse'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Contacts" component={ContactsScreen} />
      <Tab.Screen name="RiskMap" component={RiskMapScreen} options={{ tabBarLabel: 'Map' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

// ─── AUTH SCREEN (OTP Flow & Redirection) ──────────────────────────────────────────
function AuthScreen({ navigation }: { navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'> }) {
  const [isLogin, setIsLogin] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  // Background Animation
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const sc = useSharedValue(1);
  const op = useSharedValue(0.4);

  useEffect(() => {
    tx.value = withRepeat(withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.ease) }), -1, true);
    ty.value = withRepeat(withTiming(1, { duration: 11000, easing: Easing.inOut(Easing.ease) }), -1, true);
    sc.value = withRepeat(withTiming(1.5, { duration: 5000, easing: Easing.inOut(Easing.ease) }), -1, true);
    op.value = withRepeat(withTiming(0.7, { duration: 4000, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, []);

  const animatedGlow = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(tx.value, [0, 1], [-width * 0.2, width * 0.7]) },
      { translateY: interpolate(ty.value, [0, 1], [-height * 0.1, height * 0.8]) },
      { scale: sc.value },
    ],
    opacity: op.value,
  }));

  const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://10.114.213.92:5000/api';

  const handleAuth = async () => {
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!isLogin) {
      if (!name.trim()) return Alert.alert('Name Required', 'Please enter your full name.');
      const nameRegex = /^[a-zA-Z][a-zA-Z\s]{2,}$/;
      if (!nameRegex.test(name.trim())) return Alert.alert('Invalid Name', 'Name should start with a letter and have no numbers/symbols.');
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        // STEP 1: LOGIN REQUEST (OTP REQUEST)
        const { data } = await axios.post(`${API_BASE}/auth/login`, { phone: phoneNumber });
        if (data.success) {
          setShowOtpModal(true);
          // For Dev: Show OTP code in alert if backend mocks it in response
          if (data.mockedOtp) console.log("🔐 [DEV] OTP CODE:", data.mockedOtp);
        }
      } else {
        // STEP 1: REGISTER REQUEST
        const { data } = await axios.post(`${API_BASE}/auth/register`, { phone: phoneNumber, name: name.trim() });
        if (data.success) {
          setIsLogin(true); // Switch to Login mode as requested
          Alert.alert('Registration Successful', 'Your profile is ready. Please log in with the same number to verify your phone.');
        }
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Connection refused. Ensure server is running.";
      Alert.alert(isLogin ? 'Login Request Failed' : 'Registration Failed', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) return;
    setIsLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE}/auth/verify-otp`, { phone: phoneNumber, otp });
      if (data.success) {
        if (data.user?.name) await AsyncStorage.setItem(STORAGE_KEYS.USER_NAME, data.user.name);
        if (data.user?.phone) await AsyncStorage.setItem(STORAGE_KEYS.USER_PHONE, data.user.phone);
        if (data.token) await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
        
        setShowOtpModal(false);
        navigation.replace('MainTabs');
      }
    } catch (err: any) {
      Alert.alert('Verification Failed', err?.response?.data?.message || "Invalid OTP code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.authRoot} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.authContent}>
          <Animated.View style={[styles.glow, animatedGlow]} pointerEvents="none" />
          
          <View style={styles.topSection}>
            <Ionicons name="shield-checkmark" size={60} color={COLORS.primary} />
            <Text style={styles.authHeader}>VEERA</Text>
            <Text style={styles.authSub}>SECURE TWO-FACTOR PASS</Text>
          </View>

          <View style={styles.authCard}>
            <View style={styles.modeTabs}>
              <TouchableOpacity style={[styles.tab, isLogin && styles.tabActive]} onPress={() => setIsLogin(true)}>
                <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>LOG IN</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tab, !isLogin && styles.tabActive]} onPress={() => setIsLogin(false)}>
                <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>SIGN UP</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="call-outline" size={20} color={COLORS.textMuted} style={{ marginRight: 12 }} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 9876543210"
                  placeholderTextColor={COLORS.textMuted}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>

              {!isLogin && (
                <>
                  <Text style={[styles.inputLabel, { marginTop: 15 }]}>Full Name</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="person-outline" size={20} color={COLORS.textMuted} style={{ marginRight: 12 }} />
                    <TextInput
                      style={styles.input}
                      placeholder="Jane Doe"
                      placeholderTextColor={COLORS.textMuted}
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                    />
                  </View>
                </>
              )}
            </View>

            <TouchableOpacity style={styles.mainBtn} onPress={handleAuth} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.mainBtnText}>{isLogin ? 'REQUEST OTP CODE' : 'CREATE PROTECTED PROFILE'}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* ─── OTP VERIFICATION MODAL ─────────────────────────────────────── */}
      <Modal visible={showOtpModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.otpCard}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowOtpModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            
            <Ionicons name="mail-unread-outline" size={48} color={COLORS.primary} style={{ alignSelf: 'center' }} />
            <Text style={styles.otpTitle}>Verify Phone</Text>
            <Text style={styles.otpSub}>A 6-digit code has been sent to +91 {phoneNumber}</Text>

            <TextInput
              style={styles.otpInput}
              placeholder="000 000"
              placeholderTextColor="#333"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
              autoFocus
            />

            <TouchableOpacity style={styles.mainBtn} onPress={handleVerifyOtp} disabled={isLoading || otp.length < 6}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.mainBtnText}>VERIFY & ENTER</Text>
              )}
            </TouchableOpacity>
            
            <Text style={styles.resendTxt}>Didn't receive code? <Text style={{ color: COLORS.primary }}>Resend</Text></Text>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const CustomTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#000000',
    card: COLORS.surface,
    border: COLORS.border,
    text: COLORS.textPrimary,
  },
};

export default function App() {
  const [initialRoute, setInitialRoute] = useState<'Onboarding' | 'MainTabs' | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN).then(async (token) => {
      setInitialRoute(token ? 'MainTabs' : 'Onboarding');
      
      if (token) {
        // Initialize Socket for Volunteer Notifications
        const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://10.114.213.92:5000/api';
        const SOCKET_URL = API_BASE.replace('/api', '');
        const socket = io(SOCKET_URL);
        
        const userId = await AsyncStorage.getItem('@veera/user_id');
        if (userId) {
          socket.emit('join', userId);
        }

        socket.on('sos:volunteer_nearby', (data) => {
          Alert.alert(
            '🚨 COMMUNITY SOS 🚨',
            `A user needs help nearby! Risk Score: ${(data.risk_score * 100).toFixed(0)}%.\n\nOpen the map to see their location.`,
            [
              { text: 'Ignore', style: 'cancel' },
              { text: 'I am coming!', onPress: () => console.log("Volunteer responding to SOS") }
            ],
            { cancelable: false }
          );
        });
      }
    });
  }, []);

  if (!initialRoute) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer theme={CustomTheme}>
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}>
          <Stack.Screen name="Onboarding" component={AuthScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  authRoot: { flex: 1, backgroundColor: '#000000' },
  authContent: { flex: 1, paddingHorizontal: 25, justifyContent: 'center' },
  topSection: { alignItems: 'center', marginBottom: 40, position: 'relative' },
  glow: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: COLORS.primary, zIndex: -1 },
  authHeader: { color: 'white', fontSize: 44, fontWeight: '900', letterSpacing: 8, marginTop: 10 },
  authSub: { color: COLORS.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 3, marginTop: 5 },
  authCard: { backgroundColor: '#0A0A0A', borderRadius: 30, padding: 25, borderWidth: 1, borderColor: '#1C1C1E' },
  modeTabs: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 15, alignItems: 'center' },
  tabActive: { backgroundColor: '#1C1C1E' },
  tabText: { color: COLORS.textMuted, fontWeight: '800', fontSize: 12, letterSpacing: 1 },
  tabTextActive: { color: COLORS.primary },
  inputGroup: { marginBottom: 30 },
  inputLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 12 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#161618', borderRadius: 18, paddingHorizontal: 20, borderWidth: 1, borderColor: '#2C2C2E', height: 60 },
  input: { flex: 1, color: 'white', fontSize: 16, fontWeight: '600' },
  mainBtn: { backgroundColor: COLORS.primary, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  mainBtnText: { color: 'white', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', padding: 25 },
  otpCard: { backgroundColor: '#111', borderRadius: 30, padding: 30, borderWidth: 1, borderColor: '#222' },
  closeBtn: { position: 'absolute', top: 20, right: 20 },
  otpTitle: { color: 'white', fontSize: 24, fontWeight: '800', textAlign: 'center', marginTop: 15 },
  otpSub: { color: '#666', fontSize: 14, textAlign: 'center', marginTop: 8, marginBottom: 30 },
  otpInput: { borderBottomWidth: 2, borderBottomColor: COLORS.primary, color: 'white', fontSize: 32, fontWeight: '800', textAlign: 'center', marginBottom: 40, paddingVertical: 10, letterSpacing: 10 },
  resendTxt: { color: '#444', textAlign: 'center', marginTop: 25, fontSize: 13 },
});
