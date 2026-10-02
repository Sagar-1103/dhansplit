import React from 'react';
import { Pressable, Text, TextInput, TextInputProps, View } from 'react-native';

interface FieldProps extends TextInputProps {
  label: string;
  error?: string;
  rightIcon?: React.ReactNode;
}

export function Field({ label, error, rightIcon, ...inputProps }: FieldProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-medium text-neutral-400">{label}</Text>
      <View
        className={`flex-row items-center rounded-xl border bg-neutral-900 ${
          error ? 'border-red-500/60' : 'border-neutral-800'
        }`}
      >
        <TextInput
          className="flex-1 px-4 py-3.5 text-base text-white"
          placeholderTextColor="#525252"
          {...inputProps}
        />
        {rightIcon}
      </View>
      {error ? <Text className="text-xs text-red-400">{error}</Text> : null}
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
        className={`items-center rounded-xl bg-emerald-400 py-4 active:bg-emerald-300 ${
          loading ? 'opacity-60' : ''
        }`}
        onPress={onPress}
        disabled={loading}
      >
        <Text className="text-base font-semibold text-neutral-950">
          {loading && loadingTitle ? loadingTitle : title}
        </Text>
      </Pressable>
    </View>
  );
}
