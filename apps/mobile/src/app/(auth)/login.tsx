import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { AuthFooter, AuthHeader, BackButton, Banner } from '@/components/auth';
import { Field, PrimaryButton } from '@/components/form';
import { login } from '@/api/auth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
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
        <AuthHeader title="Welcome back" subtitle="Log in to continue splitting" />

        {formError ? (
          <View className="mt-6">
            <Banner tone="error" message={formError} />
          </View>
        ) : null}

        <View className="mt-8 gap-5">
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
            placeholder="Your password"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            onSubmitEditing={onSubmit}
            rightIcon={
              <Pressable
                className="px-3 py-3 active:opacity-60"
                onPress={() => setShowPassword((s) => !s)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#a3a3a3"
                />
              </Pressable>
            }
          />
        </View>

        <Link href="/(auth)/forgot-password" asChild>
          <Pressable className="mt-3 self-end active:opacity-60">
            <Text className="text-sm text-emerald-400">Forgot your password?</Text>
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
  );
}
