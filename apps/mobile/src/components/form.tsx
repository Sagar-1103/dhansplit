import React from 'react';
import { Pressable, Text, TextInput, TextInputProps, View } from 'react-native';
import { useAppTheme } from '@/hooks/use-theme';

interface FieldProps extends TextInputProps {
  label: string;
  error?: string;
  rightIcon?: React.ReactNode;
}

export function Field({ label, error, rightIcon, ...inputProps }: FieldProps) {
  const { isDark } = useAppTheme();
  return (
    <View className="gap-2">
      <Text className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
        {label}
      </Text>
      <View
        className={`flex-row items-center rounded-2xl border bg-white dark:bg-neutral-900 ${
          error
            ? 'border-red-400/60 dark:border-red-500/40'
            : 'border-neutral-200 dark:border-neutral-700'
        }`}
      >
        <TextInput
          className="flex-1 px-4 py-3.5 text-base text-neutral-900 dark:text-white"
          placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
          {...inputProps}
        />
        {rightIcon}
      </View>
      {error ? (
        <Text className="text-xs text-red-500 dark:text-red-400">{error}</Text>
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
}

export function PrimaryButton({
  title,
  onPress,
  loading,
  loadingTitle,
  wrapperClassName,
}: PrimaryButtonProps) {
  return (
    <View className={wrapperClassName}>
      <Pressable
        className={`items-center rounded-2xl bg-neutral-900 dark:bg-white py-4 active:opacity-80 ${
          loading ? 'opacity-60' : ''
        }`}
        onPress={onPress}
        disabled={loading}
      >
        <Text className="text-base font-bold text-white dark:text-neutral-900">
          {loading && loadingTitle ? loadingTitle : title}
        </Text>
      </Pressable>
    </View>
  );
}
