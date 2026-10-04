import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '@/lib/auth-store';
import { logout as apiLogout } from '@/api/auth';
import { updateProfile } from '@/api/users';
import { Banner } from '@/components/auth';
import { Field, PrimaryButton } from '@/components/form';
import { PhotoSheet } from '@/components/photo-sheet';
import { useAppTheme, type ThemePreference } from '@/hooks/use-theme';

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'CAD'];

export default function AccountScreen() {
  const { user } = useAuth();
  const { theme, setTheme, isDark } = useAppTheme();

  const [name, setName] = useState(user?.name || '');
  const [currency, setCurrency] = useState(user?.defaultCurrency || 'INR');
  const [photoUri, setPhotoUri] = useState<string | null>(
    user?.photoUri || user?.avatarUrl || null
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync state whenever user changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setCurrency(user.defaultCurrency || 'INR');
      setPhotoUri(user.photoUri || user.avatarUrl || null);
    }
  }, [user]);

  const openCamera = async () => {
    setSheetOpen(false);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const openGallery = async () => {
    setSheetOpen(false);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Name cannot be empty');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await updateProfile({
        name: name.trim(),
        defaultCurrency: currency,
        avatarUrl: photoUri || undefined,
      });

      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => {
        setSuccessMsg(null);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const performLogout = async () => {
      try {
        await apiLogout();
      } catch {
        // Ignored
      }
      router.replace('/');
    };

    if (Platform.OS === 'web') {
      if (
        typeof window !== 'undefined' &&
        window.confirm('Are you sure you want to log out of DhanSplit?')
      ) {
        await performLogout();
      }
    } else {
      Alert.alert('Log Out', 'Are you sure you want to log out of DhanSplit?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: performLogout,
        },
      ]);
    }
  };

  const screenGradient = isDark
    ? (['#18122B', '#110E1D', '#0C0A14', '#151024'] as const)
    : (['#EBE2FB', '#F4EEFD', '#FAF8FE', '#F6F3FA'] as const);

  return (
    <LinearGradient
      colors={screenGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
      {/* Top Header / Nav Bar */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 active:bg-neutral-100 dark:active:bg-neutral-700"
          accessibilityLabel="Go back"
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={isDark ? '#E5E7EB' : '#1A1A2E'}
          />
        </Pressable>

        <Text className="text-lg font-bold text-neutral-900 dark:text-white">
          Account & Profile
        </Text>

        <View className="h-10 w-10" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 py-6 pb-20"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {error && (
            <View className="mb-4">
              <Banner tone="error" message={error} />
            </View>
          )}

          {successMsg && (
            <View className="mb-4">
              <Banner tone="success" message={successMsg} />
            </View>
          )}

          {/* Profile Overview Card */}
          <View className="rounded-3xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 items-center">
            <View className="relative">
              <Pressable
                onPress={() => setSheetOpen(true)}
                className="h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-violet-300 dark:border-violet-600 bg-violet-50 dark:bg-neutral-800 active:opacity-75"
              >
                {photoUri ? (
                  <Image source={{ uri: photoUri }} className="h-full w-full" />
                ) : (
                  <View className="h-full w-full items-center justify-center bg-violet-100 dark:bg-violet-900/40">
                    <Text className="text-3xl font-bold text-violet-700 dark:text-violet-400">
                      {name ? name.charAt(0).toUpperCase() : 'U'}
                    </Text>
                  </View>
                )}
              </Pressable>
              <Pressable
                onPress={() => setSheetOpen(true)}
                className="absolute bottom-0 right-0 h-7 w-7 items-center justify-center rounded-full bg-neutral-900 dark:bg-white border-2 border-white dark:border-neutral-900 active:opacity-80"
              >
                <Ionicons
                  name="camera"
                  size={14}
                  color={isDark ? '#1A1A2E' : '#FFFFFF'}
                />
              </Pressable>
            </View>

            <Pressable
              onPress={() => setSheetOpen(true)}
              className="mt-3 active:opacity-60"
            >
              <Text className="text-xs font-semibold text-violet-600 dark:text-violet-400">
                Change Photo
              </Text>
            </Pressable>

            <Text className="mt-2 text-xl font-bold text-neutral-900 dark:text-white text-center">
              {user?.name || 'User'}
            </Text>
            <Text className="text-xs text-neutral-500 dark:text-neutral-400 text-center mt-0.5">
              {user?.email || 'user@dhansplit.com'}
            </Text>

            <View className="mt-4 flex-row items-center gap-2">
              <View className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-3.5 py-1.5 border border-neutral-200 dark:border-neutral-700">
                <Text className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Currency: {currency}
                </Text>
              </View>
              {user?.isPro ? (
                <View className="rounded-full bg-amber-100 dark:bg-amber-900/30 px-3.5 py-1.5 border border-amber-300 dark:border-amber-700">
                  <Text className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                    PRO MEMBER
                  </Text>
                </View>
              ) : (
                <View className="rounded-full bg-violet-100 dark:bg-violet-900/30 px-3.5 py-1.5 border border-violet-300 dark:border-violet-700">
                  <Text className="text-xs font-semibold text-violet-700 dark:text-violet-400">
                    STANDARD
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Theme & Appearance Section */}
          <View className="mt-6 gap-3">
            <Text className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Appearance & Theme
            </Text>

            <View className="flex-row items-center gap-2">
              {[
                { key: 'light', label: 'Light', icon: 'sunny-outline' },
                { key: 'dark', label: 'Dark', icon: 'moon-outline' },
                { key: 'system', label: 'System', icon: 'phone-portrait-outline' },
              ].map((item) => {
                const isSelected = theme === item.key;
                return (
                  <Pressable
                    key={item.key}
                    onPress={() => setTheme(item.key as ThemePreference)}
                    className={`flex-1 flex-row items-center justify-center gap-2 rounded-2xl border py-3 px-2 ${
                      isSelected
                        ? 'border-violet-500 bg-violet-100 dark:bg-violet-900/30 dark:border-violet-600'
                        : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900'
                    }`}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={16}
                      color={
                        isSelected
                          ? isDark
                            ? '#A78BFA'
                            : '#7C3AED'
                          : isDark
                          ? '#9CA3AF'
                          : '#6B7280'
                      }
                    />
                    <Text
                      className={`text-xs font-semibold ${
                        isSelected
                          ? 'text-violet-700 dark:text-violet-400'
                          : 'text-neutral-700 dark:text-neutral-400'
                      }`}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Edit Profile Section */}
          <View className="mt-6 gap-4">
            <Text className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Edit Profile Details
            </Text>

            <Field
              label="Full Name"
              placeholder="Your name"
              value={name}
              onChangeText={setName}
            />

            {/* Currency Selector */}
            <View>
              <Text className="text-xs uppercase font-bold tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                Default Currency
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row gap-2"
              >
                {CURRENCIES.map((curr) => {
                  const isSelected = currency === curr;
                  return (
                    <Pressable
                      key={curr}
                      onPress={() => setCurrency(curr)}
                      className={`rounded-2xl border px-3.5 py-2.5 ${
                        isSelected
                          ? 'border-violet-500 bg-violet-100 dark:bg-violet-900/30 dark:border-violet-600'
                          : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900'
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          isSelected
                            ? 'text-violet-700 dark:text-violet-400'
                            : 'text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        {curr}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <PrimaryButton
              title="Save Changes"
              loadingTitle="Saving..."
              onPress={handleSubmit}
              loading={loading}
              wrapperClassName="mt-2"
            />
          </View>

          {/* Log Out Action */}
          <View className="mt-8">
            <Pressable
              onPress={handleLogout}
              className="flex-row items-center justify-center gap-2 rounded-2xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 py-4 active:bg-red-100 dark:active:bg-red-500/20"
            >
              <Ionicons name="log-out-outline" size={18} color="#EF4444" />
              <Text className="text-sm font-semibold text-red-600 dark:text-red-400">
                Log out
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <PhotoSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onCamera={openCamera}
        onGallery={openGallery}
        onRemove={
          photoUri
            ? () => {
                setPhotoUri(null);
                setSheetOpen(false);
              }
            : undefined
        }
      />
      </SafeAreaView>
    </LinearGradient>
  );
}
