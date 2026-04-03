/**
 * App.tsx — Navigation root for Veera mobile app
 *
 * Architecture:
 *   Onboarding (Stack) → MainTabs (Bottom Tab Navigator)
 *     ├── Home
 *     ├── Contacts
 *     ├── RiskMap
 *     └── Settings
 *
 * WHY Stack + Tabs vs the prototype's 2-screen stack:
 * The spec defines 4 independent screens, each with their own responsibility.
 * Bottom tabs let the user switch freely without navigation history clutter.
 * The onboarding stack captures the user's name before entering the app,
 * stored in AsyncStorage so it persists across restarts.
 *
 * Background task MUST be imported here at the top level — BEFORE any
 * component mounts — because expo-task-manager requires task definitions
 * to exist when the JS bundle first loads (including background launches
 * when the OS wakes the app for a background fetch).
 */

// ─── CRITICAL: import background task definitions FIRST ───────────────────────
import './src/tasks/backgroundTasks';

import React, { useEffect, useState } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
// @ts-ignore: React Navigation 6 module resolution force-fix
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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen from './src/screens/HomeScreen';
import ContactsScreen from './src/screens/ContactsScreen';
import RiskMapScreen from './src/screens/RiskMapScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { COLORS, SPACING, STORAGE_KEYS } from './src/constants';
import type { RootStackParamList, MainTabParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

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
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => {
          const icons: Record<keyof MainTabParamList, { active: any; inactive: any }> = {
            Home:     { active: 'shield',          inactive: 'shield-outline' },
            Contacts: { active: 'people',          inactive: 'people-outline' },
            RiskMap:  { active: 'map',             inactive: 'map-outline' },
            Settings: { active: 'settings',        inactive: 'settings-outline' },
          };
          const cfg = icons[route.name as keyof MainTabParamList];
          const name = (focused ? cfg?.active : cfg?.inactive) ?? 'ellipse';
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Contacts" component={ContactsScreen} options={{ tabBarLabel: 'Contacts' }} />
      <Tab.Screen name="RiskMap" component={RiskMapScreen} options={{ tabBarLabel: 'Map' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'Settings' }} />
    </Tab.Navigator>
  );
}

function OnboardingScreen({ navigation }: { navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'> }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleProceed = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter your name to continue.');
      return;
    }
    await AsyncStorage.setItem(STORAGE_KEYS.USER_NAME, trimmed);
    navigation.replace('MainTabs');
  };

  return (
    <KeyboardAvoidingView
      style={styles.onboardingRoot}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }} 
        keyboardShouldPersistTaps="handled" 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.onboardingContent}>
          {/* Logo */}
          <View style={styles.logoRow}>
            <Ionicons name="shield" size={42} color={COLORS.primary} />
            <Text style={styles.appName}>VEERA</Text>
          </View>
          <Text style={styles.appTagline}>Your personal safety companion</Text>

          {/* Input */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Hi! What's your name?</Text>
            <TextInput
              style={[styles.input, error ? styles.inputErr : null]}
              placeholder="Enter your full name"
              placeholderTextColor={COLORS.textMuted}
              value={name}
              onChangeText={(t) => { setName(t); setError(''); }}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleProceed}
            />
            {error ? <Text style={styles.errText}>{error}</Text> : null}
            <TouchableOpacity style={styles.proceedBtn} onPress={handleProceed}>
              <Text style={styles.proceedText}>Get Started →</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.privacyNote}>
            🔒 Your name is stored only on this device. Veera never shares personal data.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

import { ActivityIndicator, ScrollView } from 'react-native';

const CustomTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: COLORS.background,
    card: COLORS.surface,
    border: COLORS.border,
    text: COLORS.textPrimary,
  },
};

// ─── Root Navigator ────────────────────────────────────────────────────────────
export default function App() {
  const [initialRoute, setInitialRoute] = useState<'Onboarding' | 'MainTabs' | null>(null);

  // Check if user has already onboarded
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.USER_NAME).then((name) => {
      setInitialRoute(name ? 'MainTabs' : 'Onboarding');
    });
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer theme={CustomTheme}>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{ headerShown: false, animation: 'fade' }}
        >
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  onboardingRoot: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  onboardingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  appName: {
    color: COLORS.primary,
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 6,
  },
  appTagline: {
    color: COLORS.textSecondary,
    fontSize: 15,
    marginBottom: SPACING.lg,
  },
  inputCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: SPACING.lg,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputLabel: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  input: {
    backgroundColor: COLORS.surfaceElevated,
    color: COLORS.textPrimary,
    padding: SPACING.md,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputErr: { borderColor: COLORS.danger },
  errText: { color: COLORS.danger, fontSize: 12 },
  proceedBtn: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  proceedText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  privacyNote: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
    marginTop: SPACING.lg,
  },
});
