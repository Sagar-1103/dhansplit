import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import type { User } from '@/lib/auth-store';

interface FriendItemProps {
  friend: User;
  balance?: number; // positive = owes you, negative = you owe
  currency?: string;
  onSettle?: (friend: User, amount?: number) => void;
  onPress?: (friend: User) => void;
}

export function FriendItem({
  friend,
  balance = 0,
  currency = '₹',
  onSettle,
  onPress,
}: FriendItemProps) {
  const isPositive = balance > 0.01;
  const isNegative = balance < -0.01;

  let balanceText = 'settled up';
  let balanceColor = 'text-neutral-500';

  if (isPositive) {
    balanceText = `owes you ${currency}${balance.toFixed(2)}`;
    balanceColor = 'text-emerald-400';
  } else if (isNegative) {
    balanceText = `you owe ${currency}${Math.abs(balance).toFixed(2)}`;
    balanceColor = 'text-rose-400';
  }

  const initial = friend.name ? friend.name.charAt(0).toUpperCase() : '?';

  return (
    <Pressable
      onPress={() => onPress?.(friend)}
      className="flex-row items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 active:bg-neutral-900"
    >
      <View className="flex-row items-center gap-3.5 flex-1 pr-2">
        {friend.avatarUrl || friend.photoUri ? (
          <Image
            source={{ uri: friend.avatarUrl || friend.photoUri || '' }}
            className="h-11 w-11 rounded-full border border-neutral-700"
          />
        ) : (
          <View className="h-11 w-11 items-center justify-center rounded-full bg-neutral-800 border border-neutral-700">
            <Text className="text-base font-bold text-emerald-400">{initial}</Text>
          </View>
        )}

        <View className="flex-1">
          <Text className="text-base font-semibold text-white" numberOfLines={1}>
            {friend.name}
          </Text>
          <Text className={`text-xs font-medium mt-0.5 ${balanceColor}`}>
            {balanceText}
          </Text>
        </View>
      </View>

      {(isPositive || isNegative) && onSettle && (
        <Pressable
          onPress={() => onSettle(friend, Math.abs(balance))}
          className="rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-1.5 active:bg-neutral-700"
        >
          <Text className="text-xs font-semibold text-emerald-400">Settle</Text>
        </Pressable>
      )}
    </Pressable>
  );
}
