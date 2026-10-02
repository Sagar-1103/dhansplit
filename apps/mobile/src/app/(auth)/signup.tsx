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

import { AuthFooter, AuthHeader, BackButton, Banner } from '@/components/auth';
import { PhotoSheet } from '@/components/photo-sheet';
import { Field, PrimaryButton } from '@/components/form';
import { signup } from '@/api/auth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Signup() {
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
    if (!result.canceled) {
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
    if (!result.canceled) {
      setPhoto(result.assets[0]);
    }
  }

  async function onSubmit() {
    const next: typeof errors = {};
    if (fullName.trim().length < 2) next.fullName = 'Enter your full name';
    if (!EMAIL_REGEX.test(email)) next.email = 'Enter a valid email address';
    if (password.length < 8) next.password = 'Password must be at least 8 characters';
    if (confirmPassword !== password) next.confirmPassword = "Passwords don't match";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

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

  const passwordEyeIcon = (
    <Pressable className="px-3 py-3 active:opacity-60" onPress={() => setShowPassword((s) => !s)}>
      <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#a3a3a3" />
    </Pressable>
  );

  const confirmPasswordEyeIcon = (
    <Pressable className="px-3 py-3 active:opacity-60" onPress={() => setShowConfirmPassword((s) => !s)}>
      <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#a3a3a3" />
    </Pressable>
  );

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-neutral-950"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow justify-center px-8 py-12"
        keyboardShouldPersistTaps="handled"
      >
        <BackButton />
        <AuthHeader title="Create your account" subtitle="Start splitting expenses in minutes" />

        {formError ? (
          <View className="mt-6">
            <Banner tone="error" message={formError} />
          </View>
        ) : null}

        <View className="mt-8 items-center gap-3">
          <Pressable
            onPress={() => setSheetOpen(true)}
            className="h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-neutral-700 bg-neutral-900 active:opacity-60"
          >
            {photo ? (
              <Image source={{ uri: photo.uri }} className="h-full w-full" />
            ) : (
              <Ionicons name="camera-outline" size={28} color="#525252" />
            )}
          </Pressable>
          <Pressable onPress={() => setSheetOpen(true)} className="active:opacity-60">
            <Text className="text-sm font-medium text-emerald-400">
              {photo ? 'Change photo' : 'Upload photo'}
            </Text>
          </Pressable>
        </View>

        <View className="mt-8 gap-5">
          <Field
            label="Full name"
            placeholder="Your name"
            autoCapitalize="words"
            autoComplete="name"
            value={fullName}
            onChangeText={setFullName}
            error={errors.fullName}
          />
          <Field
            label="Email address"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
          />
          <Field
            label="Password"
            placeholder="At least 8 characters"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            rightIcon={passwordEyeIcon}
          />
          <Field
            label="Confirm password"
            placeholder="Repeat your password"
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={errors.confirmPassword}
            onSubmitEditing={onSubmit}
            rightIcon={confirmPasswordEyeIcon}
          />
        </View>

        <PrimaryButton
          title="Create account"
          loadingTitle="Creating account..."
          onPress={onSubmit}
          loading={loading}
          wrapperClassName="mt-8"
        />

        <View className="mt-8">
          <AuthFooter
            question="Already have an account?"
            linkText="Log in"
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
  );
}
