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
            Map:      focused ? 'map'      : 'map-outline',
            Settings: focused ? 'settings' : 'settings-outline',
          };
          return <Ionicons name={icons[route.name] as any || 'ellipse'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Contacts" component={ContactsScreen} />
      <Tab.Screen name="Map" component={RiskMapScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

// ─── AUTH SCREEN (OTP Flow & Redirection) ──────────────────────────────────────────
function AuthScreen({ navigation }: { navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'> }) {
  const [isLogin, setIsLogin] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const otpInputsRef = useRef<Array<TextInput | null>>([]);

  const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://10.114.213.92:5000/api';

  const handleAuth = async () => {
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!isLogin) {
      if (!name.trim()) return Alert.alert('Name Required', 'Please enter your full name.');
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        const { data } = await axios.post(`${API_BASE}/auth/login`, { phone: phoneNumber });
        if (data.success) {
          setShowOtpModal(true);
          setOtpArray(['', '', '', '', '', '']);
        }
      } else {
        const { data } = await axios.post(`${API_BASE}/auth/register`, { phone: phoneNumber, name: name.trim() });
        if (data.success) {
          setIsLogin(true);
          Alert.alert('Profile Created', 'Profile saved! Now request an OTP for your first login.');
        }
      }
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || "Check network connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpInput = (val: string, idx: number) => {
    const newArr = [...otpArray];
    newArr[idx] = val.replace(/\D/g, '').slice(0, 1);
    setOtpArray(newArr);

    if (val && idx < 5) {
      otpInputsRef.current[idx + 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const fullOtp = otpArray.join('');
    if (fullOtp.length < 6) return;

    setIsLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE}/auth/verify-otp`, { phone: phoneNumber, otp: fullOtp });
      if (data.success) {
        if (data.user?.name) await AsyncStorage.setItem(STORAGE_KEYS.USER_NAME, data.user.name);
        if (data.user?.phone) await AsyncStorage.setItem(STORAGE_KEYS.USER_PHONE, data.user.phone);
        if (data.token) await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
        setShowOtpModal(false);
        navigation.replace('MainTabs');
      } else {
        Alert.alert('Verification Failed', data.message || 'Invalid OTP');
      }
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || "Invalid OTP or network error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#000' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.authContent}>
          <Text style={styles.authHeader}>VEERA</Text>
          <View style={styles.authCard}>
            <View style={styles.modeTabs}>
              <TouchableOpacity style={[styles.tab, isLogin && styles.tabActive]} onPress={() => setIsLogin(true)}>
                <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>LOGIN</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tab, !isLogin && styles.tabActive]} onPress={() => setIsLogin(false)}>
                <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>SIGN UP</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              placeholderTextColor="#555"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              maxLength={10}
            />

            {!isLogin && (
              <TextInput
                style={[styles.input, { marginTop: 15 }]}
                placeholder="Full Name"
                placeholderTextColor="#555"
                value={name}
                onChangeText={setName}
              />
            )}

            <TouchableOpacity style={styles.mainBtn} onPress={handleAuth} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainBtnText}>{isLogin ? 'LOG IN' : 'REGISTER'}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal visible={showOtpModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.otpCard}>
            <Text style={styles.otpTitle}>Verify Security Code</Text>
            <View style={styles.otpRow}>
              {otpArray.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={(r) => (otpInputsRef.current[i] = r)}
                  style={styles.otpBox}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={(v) => handleOtpInput(v, i)}
                  onKeyPress={({ nativeEvent: { key } }) => {
                    if (key === 'Backspace' && !digit && i > 0) {
                      otpInputsRef.current[i - 1]?.focus();
                    }
                  }}
                  autoFocus={i === 0}
                />
              ))}
            </View>
            <TouchableOpacity style={styles.mainBtn} onPress={() => handleVerifyOtp()} disabled={isLoading || otpArray.join('').length < 6}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainBtnText}>VERIFY</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const CustomTheme = {
    ...DarkTheme,
    colors: { ...DarkTheme.colors, background: '#000000', card: '#0A0A0A', border: '#1C1C1E', text: '#FFFFFF' }
};

export default function App() {
  const [initialRoute, setInitialRoute] = useState<'Onboarding' | 'MainTabs' | null>(null);
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN).then(token => setInitialRoute(token ? 'MainTabs' : 'Onboarding'));
  }, []);
  if (!initialRoute) return null;
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer theme={CustomTheme}>
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Onboarding" component={AuthScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  authContent: { flex: 1, padding: 25, justifyContent: 'center' },
  authHeader: { color: '#fff', fontSize: 48, fontWeight: '900', letterSpacing: 8, textAlign: 'center', marginBottom: 50 },
  authCard: { backgroundColor: '#0A0A0A', borderRadius: 30, padding: 25, borderWidth: 1, borderColor: '#1C1C1E' },
  modeTabs: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 15, alignItems: 'center' },
  tabActive: { backgroundColor: '#1C1C1E' },
  tabText: { color: '#555', fontWeight: '800', fontSize: 12 },
  tabTextActive: { color: COLORS.primary },
  input: { backgroundColor: '#161618', borderRadius: 18, padding: 20, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: '#2C2C2E' },
  mainBtn: { backgroundColor: COLORS.primary, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginTop: 30 },
  mainBtnText: { color: '#fff', fontWeight: '900', letterSpacing: 1 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', padding: 25 },
  otpCard: { backgroundColor: '#111', borderRadius: 30, padding: 30, borderWidth: 1, borderColor: '#333' },
  otpTitle: { color: '#fff', fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 30 },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  otpBox: { width: 45, height: 60, backgroundColor: '#000', borderRadius: 12, borderWidth: 1, borderColor: '#444', color: '#fff', fontSize: 24, fontWeight: '800', textAlign: 'center' },
});
