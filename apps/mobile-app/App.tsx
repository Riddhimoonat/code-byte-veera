/**
 * App.tsx — Navigation root for Veera mobile app
 */

import './src/tasks/backgroundTasks';
import React, { useEffect, useState } from 'react';
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

// ─── AUTH SCREEN (Integrated & Animated) ──────────────────────────────────────────
function AuthScreen({ navigation }: { navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'> }) {
  const [isLogin, setIsLogin] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Background Animation - Random Floating Effect
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const sc = useSharedValue(1);
  const op = useSharedValue(0.4);

  useEffect(() => {
    // Horizontal movement
    tx.value = withRepeat(
      withTiming(1, { duration: 7000, easing: Easing.inOut(Easing.sin) }),
      -1, true
    );
    // Vertical movement
    ty.value = withRepeat(
      withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.sin) }),
      -1, true
    );
    // Pulse effect
    sc.value = withRepeat(
      withTiming(1.5, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
      -1, true
    );
    // Opacity pulse
    op.value = withRepeat(
      withTiming(0.7, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
      -1, true
    );
  }, []);

  const animatedGlow = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: interpolate(tx.value, [0, 1], [-100, width - 150]) },
        { translateY: interpolate(ty.value, [0, 1], [-100, height - 150]) },
        { scale: sc.value },
      ],
      opacity: op.value,
    };
  });

  const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://veera-final-bolt.loca.lt/api';

  const handleAuth = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit number.');
      return;
    }
    if (!isLogin && !name.trim()) {
      Alert.alert('Name Required', 'Please enter your name for registration.');
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = isLogin ? `${API_BASE}/auth/login` : `${API_BASE}/auth/register`;
      const payload = isLogin ? { phone: phoneNumber } : { phone: phoneNumber, name: name.trim() };
      
      console.log(`[AUTH] Calling ${endpoint} with`, payload);
      const response = await axios.post(endpoint, payload);
      
      const { user, token } = response.data;
      
      if (user?.name) await AsyncStorage.setItem(STORAGE_KEYS.USER_NAME, user.name);
      if (user?.phone) await AsyncStorage.setItem(STORAGE_KEYS.USER_PHONE, user.phone);
      if (token) await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      
      navigation.replace('MainTabs');
    } catch (err: any) {
      console.log("❌ [AUTH ERROR]", err?.response?.data || err.message);
      const errorMsg = err?.response?.data?.message || "Failed to connect to Veera servers.";
      Alert.alert(isLogin ? 'Login Failed' : 'Registration Failed', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.authRoot} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Absolute Full Screen Glow Background */}
      <Animated.View 
        style={[styles.glow, animatedGlow]} 
        pointerEvents="none" 
      />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.authContent}>
          
          <View style={styles.topSection}>
            <Ionicons name="shield-checkmark" size={60} color={COLORS.primary} />
            <Text style={styles.authHeader}>VEERA</Text>
            <Text style={styles.authSub}>PROACTIVE PERSONAL SECURITY</Text>
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
              <Text style={styles.inputLabel}>Registered Mobile Number</Text>
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
                <Text style={styles.mainBtnText}>{isLogin ? 'ENTER PROTECTED ZONE' : 'CREATE PROTECTED PROFILE'}</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.footerNote}>
            🔒 Your security is our absolute priority.{'\n'}Data is encrypted end-to-end.
          </Text>
        </View>
      </ScrollView>
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

// ─── Root Navigator ────────────────────────────────────────────────────────────
export default function App() {
  const [initialRoute, setInitialRoute] = useState<'Onboarding' | 'MainTabs' | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN).then((token) => {
      setInitialRoute(token ? 'MainTabs' : 'Onboarding');
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
  glow: { 
    position: 'absolute', 
    top: 0,
    left: 0,
    width: 250, 
    height: 250, 
    borderRadius: 125, 
    backgroundColor: COLORS.primaryGlow,
    shadowColor: COLORS.primary,
    shadowRadius: 80,
    shadowOpacity: 1,
    elevation: 30,
    zIndex: -1 
  },
  authHeader: { color: 'white', fontSize: 44, fontWeight: '900', letterSpacing: 8, marginTop: 10 },
  authSub: { color: COLORS.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 3, marginTop: 5 },
  authCard: {
    backgroundColor: '#0A0A0A',
    borderRadius: 30,
    padding: 25,
    borderWidth: 1,
    borderColor: '#1C1C1E',
  },
  modeTabs: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 15, alignItems: 'center' },
  tabActive: { backgroundColor: '#1C1C1E' },
  tabText: { color: COLORS.textMuted, fontWeight: '800', fontSize: 12, letterSpacing: 1 },
  tabTextActive: { color: COLORS.primary },
  inputGroup: { marginBottom: 30 },
  inputLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 12 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161618',
    borderRadius: 18,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    height: 60,
  },
  input: { flex: 1, color: 'white', fontSize: 16, fontWeight: '600' },
  mainBtn: {
    backgroundColor: COLORS.primary,
    height: 65,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainBtnText: { color: 'white', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
  footerNote: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center', marginTop: 30, lineHeight: 18 },
});
