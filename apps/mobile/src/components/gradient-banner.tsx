import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '@/hooks/use-theme';

interface GradientBannerProps {
  title?: string;
  subtitle?: string;
  onPress?: () => void;
}

export function GradientBanner({
  title = 'Dhansplit Smart Split is active',
  subtitle = 'Balances are automatically simplified to minimize the number of repayments among friends.',
  onPress,
}: GradientBannerProps) {
  const { isDark } = useAppTheme();

  return (
    <Pressable onPress={onPress} className="active:opacity-85">
      <LinearGradient
        colors={
          isDark
            ? ['#2F1E5E', '#221544', '#191032']
            : ['#E7DCFC', '#F3EDFF', '#DFCDFC']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 24,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
        }}
        className="border border-white/40 dark:border-white/10 shadow-lg shadow-violet-500/10"
      >
        {/* Mascot / Icon Badge */}
        <View className="h-11 w-11 items-center justify-center rounded-2xl bg-white/80 dark:bg-white/10 shadow-sm mr-3">
          <Ionicons
            name="sparkles"
            size={22}
            color={isDark ? '#DDD6FE' : '#7C3AED'}
          />
        </View>

        {/* Text Area */}
        <View className="flex-1 pr-2">
          <Text className="text-xs font-bold text-neutral-900 dark:text-white leading-4">
            {title}
          </Text>
          <Text className="text-[11px] text-neutral-600 dark:text-neutral-300 mt-0.5 leading-4">
            {subtitle}
          </Text>
        </View>

        {/* Arrow Top-Right */}
        <View className="h-8 w-8 items-center justify-center rounded-full bg-white/60 dark:bg-white/10">
          <Ionicons
            name="arrow-forward"
            size={14}
            color={isDark ? '#FFFFFF' : '#1A1A2E'}
          />
        </View>
      </LinearGradient>
    </Pressable>
  );
}
