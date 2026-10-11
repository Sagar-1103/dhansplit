import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AuthFooter,
  AuthHeader,
  AuthTopBar,
  Banner,
} from '@/components/auth';
import { Field, PrimaryButton } from '@/components/form';
import { login } from '@/api/auth';
import { useAppTheme } from '@/hooks/use-theme';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { isDark } = useAppTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    const next: typeof errors = {};
    if (!EMAIL_REGEX.test(email)) next.email = 'Enter a valid email address';
    if (password.length < 8) next.password = 'Password must be at least 8 characters';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    setFormError(null);
    try {
      await login(email.trim().toLowerCase(), password);
      router.replace('/dashboard');
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

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
                title="Welcome back"
                subtitle="Sign in to access your groups, shared expenses, and settlements."
              />

              {formError ? (
                <View className="mb-4">
                  <Banner tone="error" message={formError} />
                </View>
              ) : null}

              {/* Form Fields */}
              <View className="gap-4">
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

                <View>
                  <Field
                    label="Password"
                    placeholder="••••••••"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    error={errors.password}
                    leftIcon={(color) => (
                      <Ionicons name="lock-closed-outline" size={18} color={color} />
                    )}
                    rightIcon={
                      <Pressable
                        onPress={() => setShowPassword((p) => !p)}
                        className="py-1 px-1.5 active:opacity-60"
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                      >
                        <Ionicons
                          name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={18}
                          color={isDark ? '#9CA3AF' : '#6B7280'}
                        />
                      </Pressable>
                    }
                  />

                  <Link href="/(auth)/forgot-password" asChild>
                    <Pressable className="mt-2.5 self-end py-1">
                      <Text className="text-xs font-semibold text-violet-600 dark:text-violet-400">
                        Forgot password?
                      </Text>
                    </Pressable>
                  </Link>
                </View>
              </View>
            </View>

            {/* Bottom Actions */}
            <View className="mt-8 gap-3">
              <PrimaryButton
                title="Sign In"
                loadingTitle="Signing in..."
                onPress={onSubmit}
                loading={loading}
              />

              <AuthFooter
                question="New to Dhansplit?"
                linkText="Create an account"
                href="/(auth)/signup"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
