import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { AuthFooter, AuthHeader, BackButton, Banner } from '@/components/auth';
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
          contentContainerClassName="flex-grow justify-center px-8 py-12"
          keyboardShouldPersistTaps="handled"
        >
          <BackButton />
          <AuthHeader
            title="Reset password"
            subtitle="Enter your email and we'll send you a reset link"
          />

          {formError ? (
            <View className="mt-6">
              <Banner tone="error" message={formError} />
            </View>
          ) : null}

          {sent ? (
            <View className="mt-8">
              <Banner
                tone="success"
                message={`If an account exists for ${email.trim()}, a reset link is on its way.`}
              />
            </View>
          ) : (
            <>
              <View className="mt-8">
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
                />
              </View>
              <PrimaryButton
                title="Send reset link"
                loadingTitle="Sending..."
                onPress={onSubmit}
                loading={loading}
                wrapperClassName="mt-8"
              />
            </>
          )}

          <View className="mt-8">
            <AuthFooter question="Remembered it?" linkText="Back to log in" href="/(auth)/login" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
