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
      className="h-10 w-10 items-center justify-center rounded-full border border-neutral-200/80 dark:border-white/10 bg-white/80 dark:bg-white/10 shadow-sm active:opacity-60"
      onPress={onBack || (() => (router.canGoBack() ? router.back() : router.replace('/')))}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      accessibilityLabel="Go back"
    >
      <Ionicons name="arrow-back" size={18} color={isDark ? '#FFFFFF' : '#1A1A2E'} />
    </Pressable>
  );
}

export function AuthTopBar({ onBack }: { onBack?: () => void }) {
  return (
    <View className="flex-row items-center justify-between pt-2 pb-5">
      <BackButton onBack={onBack} />
      <Text className="font-samarkan text-3xl text-neutral-900 dark:text-white tracking-wide">
        dhan<Text className="text-violet-600 dark:text-violet-400">split</Text>
      </Text>
      {/* Invisible spacer to balance the back button */}
      <View className="w-10" />
    </View>
  );
}

export function BrandBadge() {
  return (
    <View className="items-center justify-center mb-6">
      <View className="mb-2">
        <ThreeDCoin size={76} useLogo />
      </View>
      <Text className="font-samarkan text-3xl text-neutral-900 dark:text-white tracking-wide">
        dhan<Text className="text-violet-600 dark:text-violet-400">split</Text>
      </Text>
    </View>
  );
}

export function AuthHeader({
  title,
  subtitle,
  tagline,
}: {
  title: string;
  subtitle?: string;
  tagline?: string;
}) {
  return (
    <View className="mb-6">
      {tagline ? (
        <Text className="text-xs font-bold tracking-wider uppercase text-violet-600 dark:text-violet-400 mb-1.5">
          {tagline}
        </Text>
      ) : null}
      <Text className="text-[34px] font-black text-neutral-900 dark:text-white tracking-tight leading-[40px]">
        {title}
      </Text>
      {subtitle ? (
        <Text className="mt-2 text-sm leading-5 text-neutral-500 dark:text-neutral-400 max-w-[320px]">
          {subtitle}
        </Text>
      ) : null}
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
      className={`rounded-2xl border px-4 py-3.5 flex-row items-center gap-2.5 ${
        isError
          ? 'border-red-500/30 bg-red-500/10 dark:border-red-500/30 dark:bg-red-500/15'
          : 'border-emerald-500/30 bg-emerald-500/10 dark:border-emerald-500/30 dark:bg-emerald-500/15'
      }`}
    >
      <Ionicons
        name={isError ? 'alert-circle-outline' : 'checkmark-circle-outline'}
        size={18}
        color={isError ? '#EF4444' : '#10B981'}
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
    <View className="flex-row items-center justify-center gap-1.5 py-3">
      <Text className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
        {question}
      </Text>
      <Link href={href} asChild>
        <Pressable className="active:opacity-60 py-1" hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text className="text-xs font-bold text-violet-600 dark:text-violet-400">
            {linkText}
          </Text>
        </Pressable>
      </Link>
    </View>
  );
}
