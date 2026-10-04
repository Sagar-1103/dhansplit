import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Link, router, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { ThreeDCoin } from '@/components/ui/three-d-coin';

export function BackButton({ onBack }: { onBack?: () => void }) {
  const { isDark } = useAppTheme();
  return (
    <Pressable
      className="h-10 w-10 items-center justify-center rounded-full border border-neutral-200/80 dark:border-white/10 bg-white/90 dark:bg-neutral-800/90 shadow-sm active:bg-neutral-100 dark:active:bg-neutral-700"
      onPress={onBack || (() => router.replace('/'))}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      accessibilityLabel="Go back"
    >
      <Ionicons name="chevron-back" size={20} color={isDark ? '#E5E7EB' : '#1A1A2E'} />
    </Pressable>
  );
}

export function BrandBadge() {
  return (
    <View className="items-center justify-center mb-6">
      {/* Mini 3D Coin Logo */}
      <View className="mb-2">
        <ThreeDCoin size={76} useLogo />
      </View>
      {/* Samarkan Wordmark */}
      <Text className="font-samarkan text-3xl text-neutral-900 dark:text-white tracking-wide">
        dhan<Text className="text-violet-600 dark:text-violet-400">split</Text>
      </Text>
    </View>
  );
}

export function AuthHeader({
  tagline = '// Welcome back',
  title,
  subtitle,
}: {
  tagline?: string;
  title: string;
  subtitle: string;
}) {
  return (
    <View className="mb-6">
      {tagline ? (
        <Text className="text-xs font-semibold tracking-wider text-violet-600 dark:text-violet-400 mb-1">
          {tagline}
        </Text>
      ) : null}
      <Text className="text-[28px] font-black text-neutral-900 dark:text-white tracking-tight leading-8">
        {title}
      </Text>
      <Text className="mt-1.5 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
        {subtitle}
      </Text>
    </View>
  );
}

interface BannerProps {
  tone: 'error' | 'success';
  message: string;
}

export function Banner({ tone, message }: BannerProps) {
  const isError = tone === 'error';
  return (
    <View
      className={`rounded-2xl border px-4 py-3 flex-row items-center gap-2.5 ${
        isError
          ? 'border-red-400/40 bg-red-50/90 dark:border-red-500/30 dark:bg-red-500/10'
          : 'border-emerald-400/40 bg-emerald-50/90 dark:border-emerald-400/30 dark:bg-emerald-400/10'
      }`}
    >
      <Ionicons
        name={isError ? 'alert-circle-outline' : 'checkmark-circle-outline'}
        size={18}
        color={isError ? '#DC2626' : '#059669'}
      />
      <Text
        className={`text-xs font-semibold flex-1 ${
          isError
            ? 'text-red-600 dark:text-red-400'
            : 'text-emerald-700 dark:text-emerald-300'
        }`}
      >
        {message}
      </Text>
    </View>
  );
}

export function AuthFooter({
  question,
  linkText,
  href,
}: {
  question: string;
  linkText: string;
  href: Href;
}) {
  return (
    <View className="flex-row items-center justify-center gap-1.5 py-2">
      <Text className="text-xs text-neutral-500 dark:text-neutral-400">{question}</Text>
      <Link href={href} asChild>
        <Pressable className="active:opacity-60 py-1">
          <Text className="text-xs font-bold text-violet-600 dark:text-violet-400">
            {linkText}
          </Text>
        </Pressable>
      </Link>
    </View>
  );
}
