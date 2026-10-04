import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { AuthFooter, AuthHeader, BackButton, Banner } from '@/components/auth';
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
          <AuthHeader title="Welcome back" subtitle="Log in to continue splitting" />

          {formError ? (
            <View className="mt-6">
              <Banner tone="error" message={formError} />
            </View>
          ) : null}

          <View className="mt-8 gap-5">
            <Field
              label="Email"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              error={errors.email}
            />

            <Field
              label="Password"
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              rightIcon={
                <Pressable
                  onPress={() => setShowPassword((p) => !p)}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={isDark ? '#9CA3AF' : '#6B7280'}
                  />
                </Pressable>
              }
            />
          </View>

          <Link href="/(auth)/forgot-password" asChild>
            <Pressable className="mt-3 self-end py-1">
              <Text className="text-xs font-semibold text-violet-600 dark:text-violet-400">
                Forgot password?
              </Text>
            </Pressable>
          </Link>

          <PrimaryButton
            title="Log in"
            loadingTitle="Logging in..."
            onPress={onSubmit}
            loading={loading}
            wrapperClassName="mt-8"
          />

          <View className="mt-8">
            <AuthFooter
              question="New to Dhansplit?"
              linkText="Create an account"
              href="/(auth)/signup"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
