import React, { useState } from 'react';
import { Pressable, Text, TextInput, TextInputProps, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';

interface FieldProps extends TextInputProps {
  label: string;
  error?: string;
  leftIcon?: React.ReactNode | ((iconColor: string) => React.ReactNode);
  rightIcon?: React.ReactNode;
}

export function Field({
  label,
  error,
  leftIcon,
  rightIcon,
  onFocus,
  onBlur,
  ...inputProps
}: FieldProps) {
  const { isDark } = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);

  const iconColor = error
    ? '#EF4444'
    : isFocused
    ? isDark
      ? '#C4B5FD'
      : '#7C3AED'
    : isDark
    ? '#9CA3AF'
    : '#6B7280';

  return (
    <View className="gap-1.5">
      <Text className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 ml-1">
        {label}
      </Text>
      <View
        className={`flex-row items-center rounded-2xl border px-4 bg-white/80 dark:bg-white/[0.06] ${
          error
            ? 'border-red-500/80 bg-red-500/5'
            : isFocused
            ? 'border-violet-600 dark:border-violet-400 bg-white dark:bg-white/[0.1] shadow-sm'
            : 'border-neutral-200/90 dark:border-white/10'
        }`}
      >
        {typeof leftIcon === 'function' ? (
          <View className="mr-2.5">{leftIcon(iconColor)}</View>
        ) : leftIcon ? (
          <View className="mr-2.5">{leftIcon}</View>
        ) : null}
        <TextInput
          className="flex-1 py-3.5 text-sm font-medium text-neutral-900 dark:text-white"
          placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
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
        className={`flex-row items-center justify-center gap-2 rounded-full bg-neutral-900 dark:bg-white py-4 px-6 shadow-xl shadow-neutral-900/25 active:opacity-85 ${
          loading ? 'opacity-60' : ''
        }`}
        onPress={onPress}
        disabled={loading}
      >
        <Text className="text-base font-bold text-white dark:text-neutral-900 tracking-tight">
          {loading && loadingTitle ? loadingTitle : title}
        </Text>
        {showArrow && !loading && (
          <Ionicons
            name="arrow-forward"
            size={18}
            color={isDark ? '#1A1A2E' : '#FFFFFF'}
          />
        )}
      </Pressable>
    </View>
  );
}
