import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
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
import { Field, PrimaryButton } from '@/components/form';
import { forgotPassword } from '@/api/auth';
import { useAppTheme } from '@/hooks/use-theme';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const { isDark } = useAppTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    if (!EMAIL_REGEX.test(email)) {
      setError('Enter a valid email address');
      return;
    }
    setError(undefined);

    setLoading(true);
    setFormError(null);
    try {
      await forgotPassword(email.trim().toLowerCase());
      setSent(true);
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
                title="Reset password"
                subtitle="Enter your registered email and we'll send you a recovery link."
              />

              {formError ? (
                <View className="mb-4">
                  <Banner tone="error" message={formError} />
                </View>
              ) : null}

              {sent ? (
                <View className="gap-5 mt-2">
                  <Banner
                    tone="success"
                    message={`If an account exists for ${email.trim()}, a password reset link has been dispatched.`}
                  />
                  <PrimaryButton
                    title="Return to Sign In"
                    onPress={() => router.replace('/(auth)/login')}
                    wrapperClassName="mt-2"
                  />
                </View>
              ) : (
                <View className="gap-4">
                  <Field
                    label="Email address"
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    value={email}
                    onChangeText={setEmail}
                    error={error}
                    onSubmitEditing={onSubmit}
                    leftIcon={(color) => (
                      <Ionicons name="mail-outline" size={18} color={color} />
                    )}
                  />

                  <PrimaryButton
                    title="Send Reset Link"
                    loadingTitle="Sending link..."
                    onPress={onSubmit}
                    loading={loading}
                    wrapperClassName="mt-2"
                  />
                </View>
              )}
            </View>

            {/* Bottom Footer */}
            <View className="mt-8">
              <AuthFooter
                question="Remember your password?"
                linkText="Back to sign in"
                href="/(auth)/login"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
