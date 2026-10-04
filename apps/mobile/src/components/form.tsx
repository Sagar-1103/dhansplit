import React from 'react';
import { Pressable, Text, TextInput, TextInputProps, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';

interface FieldProps extends TextInputProps {
  label: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Field({
  label,
  error,
  leftIcon,
  rightIcon,
  ...inputProps
}: FieldProps) {
  const { isDark } = useAppTheme();
  return (
    <View className="gap-1.5">
      <Text className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 ml-1">
        {label}
      </Text>
      <View
        className={`flex-row items-center rounded-2xl border px-3.5 bg-white/90 dark:bg-neutral-800/80 ${
          error
            ? 'border-red-400 dark:border-red-500/50'
            : 'border-neutral-200/90 dark:border-white/10'
        }`}
      >
        {leftIcon ? <View className="mr-2.5">{leftIcon}</View> : null}
        <TextInput
          className="flex-1 py-3.5 text-sm font-medium text-neutral-900 dark:text-white"
          placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
          {...inputProps}
        />
        {rightIcon}
      </View>
      {error ? (
        <Text className="text-[11px] font-medium text-red-500 dark:text-red-400 ml-1">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  loadingTitle?: string;
  wrapperClassName?: string;
  showArrow?: boolean;
}

export function PrimaryButton({
  title,
  onPress,
  loading,
  loadingTitle,
  wrapperClassName,
  showArrow = true,
}: PrimaryButtonProps) {
  const { isDark } = useAppTheme();
  return (
    <View className={wrapperClassName}>
      <Pressable
        className={`flex-row items-center justify-center gap-2 rounded-full bg-neutral-900 dark:bg-white py-4 px-6 shadow-xl shadow-neutral-900/20 active:opacity-85 ${
          loading ? 'opacity-60' : ''
        }`}
        onPress={onPress}
        disabled={loading}
      >
        <Text className="text-sm font-bold text-white dark:text-neutral-900 tracking-tight">
          {loading && loadingTitle ? loadingTitle : title}
        </Text>
        {showArrow && !loading && (
          <Ionicons
            name="arrow-forward"
            size={16}
            color={isDark ? '#1A1A2E' : '#FFFFFF'}
          />
        )}
      </Pressable>
    </View>
  );
}
