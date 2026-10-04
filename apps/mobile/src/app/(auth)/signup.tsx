import { useState } from 'react';
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

import {
  AuthFooter,
  AuthHeader,
  BackButton,
  Banner,
  BrandBadge,
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
    <Pressable className="px-2 py-2 active:opacity-60" onPress={toggle}>
      <Ionicons
        name={show ? 'eye-off-outline' : 'eye-outline'}
        size={18}
        color={isDark ? '#9CA3AF' : '#6B7280'}
      />
    </Pressable>
  );

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
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow justify-center px-6 py-10"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Row: Back button */}
          <View className="mb-4">
            <BackButton />
          </View>

          {/* Central Dhansplit Brand Identity */}
          <BrandBadge />

          {/* Floating Luminous Card Container */}
          <View className="rounded-[32px] bg-white/85 dark:bg-[#151322]/90 p-6 border border-white/80 dark:border-white/10 shadow-2xl shadow-neutral-900/10">
            <AuthHeader
              tagline="// Join Dhansplit"
              title="Create Account"
              subtitle="Start tracking group expenses and settle debts seamlessly."
            />

            {formError ? (
              <View className="mb-5">
                <Banner tone="error" message={formError} />
              </View>
            ) : null}

            {/* Profile Avatar Upload with polished styling */}
            <View className="items-center mb-5">
              <View className="relative">
                <Pressable
                  onPress={() => setSheetOpen(true)}
                  className="h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-violet-400 dark:border-violet-600 bg-violet-50 dark:bg-neutral-800 shadow-sm active:opacity-75"
                >
                  {photo ? (
                    <Image source={{ uri: photo.uri }} className="h-full w-full" />
                  ) : (
                    <Ionicons
                      name="camera-outline"
                      size={26}
                      color={isDark ? '#A78BFA' : '#7C3AED'}
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
                placeholder="John Doe"
                autoCapitalize="words"
                value={fullName}
                onChangeText={setFullName}
                error={errors.fullName}
                leftIcon={
                  <Ionicons
                    name="person-outline"
                    size={18}
                    color={isDark ? '#A78BFA' : '#7C3AED'}
                  />
                }
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
                leftIcon={
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color={isDark ? '#A78BFA' : '#7C3AED'}
                  />
                }
              />

              <Field
                label="Password"
                placeholder="At least 8 characters"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                error={errors.password}
                leftIcon={
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={isDark ? '#A78BFA' : '#7C3AED'}
                  />
                }
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
                leftIcon={
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={18}
                    color={isDark ? '#A78BFA' : '#7C3AED'}
                  />
                }
                rightIcon={eyeIcon(showConfirmPassword, () =>
                  setShowConfirmPassword((p) => !p)
                )}
              />
            </View>

            <PrimaryButton
              title="Create Account"
              loadingTitle="Creating account..."
              onPress={onSubmit}
              loading={loading}
              wrapperClassName="mt-6"
            />
          </View>

          {/* Footer Link */}
          <View className="mt-6">
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
    </LinearGradient>
  );
}
