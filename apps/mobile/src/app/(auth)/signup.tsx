import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AuthFooter,
  AuthHeader,
  AuthTopBar,
  Banner,
} from '@/components/auth';
import { PhotoSheet } from '@/components/photo-sheet';
import { Field, PrimaryButton } from '@/components/form';
import { signup } from '@/api/auth';
import { useAppTheme } from '@/hooks/use-theme';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Signup() {
  const { isDark } = useAppTheme();
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  async function openCamera() {
    setSheetOpen(false);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0]);
    }
  }

  async function openGallery() {
    setSheetOpen(false);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0]);
    }
  }

  function validate() {
    const next: typeof errors = {};
    if (!fullName.trim()) next.fullName = 'Full name is required';
    if (!EMAIL_REGEX.test(email)) next.email = 'Enter a valid email address';
    if (password.length < 8) next.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword)
      next.confirmPassword = 'Passwords do not match';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit() {
    if (!validate()) return;
    setLoading(true);
    setFormError(null);
    try {
      await signup({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        photoUri: photo?.uri,
      });
      router.replace('/dashboard');
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const eyeIcon = (show: boolean, toggle: () => void) => (
    <Pressable
      className="py-1 px-1.5 active:opacity-60"
      onPress={toggle}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    >
      <Ionicons
        name={show ? 'eye-off-outline' : 'eye-outline'}
        size={18}
        color={isDark ? '#9CA3AF' : '#6B7280'}
      />
    </Pressable>
  );

  const gradientColors = isDark
    ? (['#18122C', '#120F20', '#0D0B16', '#1A132E'] as const)
    : (['#EDE3FD', '#F7F3FE', '#FFFFFF', '#ECE3FA'] as const);

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            className="flex-1"
            contentContainerClassName="flex-grow justify-between px-8 pb-8 pt-2"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Top Navigation Bar with Back & Wordmark */}
            <View>
              <AuthTopBar />

              {/* Clean Hero Header */}
              <AuthHeader
                title="Create account"
                subtitle="Join your friends and manage group expenses effortlessly."
              />

              {formError ? (
                <View className="mb-4">
                  <Banner tone="error" message={formError} />
                </View>
              ) : null}

              {/* Profile Avatar Upload with polished styling */}
              <View className="items-center mb-6">
                <View className="relative">
                  <Pressable
                    onPress={() => setSheetOpen(true)}
                    className="h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-violet-400/80 dark:border-violet-500/80 bg-white/80 dark:bg-white/[0.08] shadow-md active:opacity-75"
                  >
                    {photo ? (
                      <Image source={{ uri: photo.uri }} className="h-full w-full" />
                    ) : (
                      <Ionicons
                        name="camera-outline"
                        size={26}
                        color={isDark ? '#C4B5FD' : '#7C3AED'}
                      />
                    )}
                  </Pressable>
                  <Pressable
                    onPress={() => setSheetOpen(true)}
                    className="absolute bottom-0 right-0 h-6 w-6 items-center justify-center rounded-full bg-neutral-900 dark:bg-white shadow-sm active:opacity-80"
                  >
                    <Ionicons
                      name="add"
                      size={14}
                      color={isDark ? '#1A1A2E' : '#FFFFFF'}
                    />
                  </Pressable>
                </View>
                <Text className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mt-1.5">
                  Profile Photo (Optional)
                </Text>
              </View>

              <View className="gap-3.5">
                <Field
                  label="Full Name"
                  placeholder="Your name"
                  autoCapitalize="words"
                  value={fullName}
                  onChangeText={setFullName}
                  error={errors.fullName}
                  leftIcon={(color) => (
                    <Ionicons name="person-outline" size={18} color={color} />
                  )}
                />

                <Field
                  label="Email address"
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                  error={errors.email}
                  leftIcon={(color) => (
                    <Ionicons name="mail-outline" size={18} color={color} />
                  )}
                />

                <Field
                  label="Password"
                  placeholder="At least 8 characters"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  error={errors.password}
                  leftIcon={(color) => (
                    <Ionicons name="lock-closed-outline" size={18} color={color} />
                  )}
                  rightIcon={eyeIcon(showPassword, () =>
                    setShowPassword((p) => !p)
                  )}
                />

                <Field
                  label="Confirm Password"
                  placeholder="Repeat password"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  error={errors.confirmPassword}
                  leftIcon={(color) => (
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={18}
                      color={color}
                    />
                  )}
                  rightIcon={eyeIcon(showConfirmPassword, () =>
                    setShowConfirmPassword((p) => !p)
                  )}
                />
              </View>
            </View>

            {/* Bottom Actions */}
            <View className="mt-8 gap-3">
              <PrimaryButton
                title="Create Account"
                loadingTitle="Creating account..."
                onPress={onSubmit}
                loading={loading}
              />

              <AuthFooter
                question="Already have an account?"
                linkText="Sign in"
                href="/(auth)/login"
              />
            </View>
          </ScrollView>

          <PhotoSheet
            visible={sheetOpen}
            onClose={() => setSheetOpen(false)}
            onCamera={openCamera}
            onGallery={openGallery}
            onRemove={
              photo
                ? () => {
                    setPhoto(null);
                    setSheetOpen(false);
                  }
                : undefined
            }
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
