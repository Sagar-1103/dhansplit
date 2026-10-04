import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
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
              tagline="// Account Recovery"
              title="Reset Password"
              subtitle="Enter your registered email and we'll send you a recovery link."
            />

            {formError ? (
              <View className="mb-5">
                <Banner tone="error" message={formError} />
              </View>
            ) : null}

            {sent ? (
              <View className="gap-5">
                <Banner
                  tone="success"
                  message={`If an account exists for ${email.trim()}, a reset link has been dispatched.`}
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
                  leftIcon={
                    <Ionicons
                      name="mail-outline"
                      size={18}
                      color={isDark ? '#A78BFA' : '#7C3AED'}
                    />
                  }
                />

                <PrimaryButton
                  title="Send Reset Link"
                  loadingTitle="Sending link..."
                  onPress={onSubmit}
                  loading={loading}
                  wrapperClassName="mt-3"
                />
              </View>
            )}
          </View>

          {/* Footer Link */}
          <View className="mt-6">
            <AuthFooter
              question="Remember your password?"
              linkText="Back to sign in"
              href="/(auth)/login"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
