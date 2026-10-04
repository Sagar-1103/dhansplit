import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BalanceCardProps {
  netBalance: number;
  totalOwedToYou: number;
  totalYouOwe: number;
  currency?: string;
  onAddExpense: () => void;
  onSettleUp: () => void;
  onNewGroup: () => void;
  onAddFriend: () => void;
}

export function BalanceCard({
  netBalance,
  totalOwedToYou,
  totalYouOwe,
  currency = '₹',
  onAddExpense,
  onSettleUp,
  onNewGroup,
  onAddFriend,
}: BalanceCardProps) {
  const isPositive = netBalance > 0.01;
  const isNegative = netBalance < -0.01;

  const netColor = isPositive
    ? 'text-emerald-400'
    : isNegative
    ? 'text-rose-400'
    : 'text-neutral-400';

  const statusText = isPositive
    ? 'Overall, you are owed'
    : isNegative
    ? 'Overall, you owe'
    : 'All settled up';

  return (
    <View className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-2xl">
      {/* Top Net Balance */}
      <View className="items-center pb-5 border-b border-neutral-800/80">
        <Text className="text-xs uppercase font-medium tracking-wider text-neutral-400">
          {statusText}
        </Text>
        <Text className={`text-4xl font-extrabold tracking-tight mt-1 ${netColor}`}>
          {isNegative ? '-' : ''}
          {currency}
          {Math.abs(netBalance).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </View>

      {/* Breakdown: Owed to you vs You owe */}
      <View className="flex-row items-center justify-around py-4 border-b border-neutral-800/80">
        <View className="items-center flex-1">
          <View className="flex-row items-center gap-1.5 mb-1">
            <View className="h-2 w-2 rounded-full bg-emerald-400" />
            <Text className="text-xs text-neutral-400">You are owed</Text>
          </View>
          <Text className="text-lg font-bold text-emerald-400">
            {currency}
            {totalOwedToYou.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>

        <View className="h-8 w-[1px] bg-neutral-800" />

        <View className="items-center flex-1">
          <View className="flex-row items-center gap-1.5 mb-1">
            <View className="h-2 w-2 rounded-full bg-rose-400" />
            <Text className="text-xs text-neutral-400">You owe</Text>
          </View>
          <Text className="text-lg font-bold text-rose-400">
            {currency}
            {totalYouOwe.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>
      </View>

      {/* Quick Action Grid */}
      <View className="flex-row justify-between gap-2 pt-4">
        <Pressable
          onPress={onAddExpense}
          className="flex-1 items-center justify-center rounded-2xl bg-emerald-400 py-3 active:bg-emerald-300"
        >
          <Ionicons name="receipt-outline" size={20} color="#0a0a0a" />
          <Text className="text-xs font-semibold text-neutral-950 mt-1">Expense</Text>
        </Pressable>

        <Pressable
          onPress={onSettleUp}
          className="flex-1 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-800/60 py-3 active:bg-neutral-800"
        >
          <Ionicons name="swap-horizontal-outline" size={20} color="#34d399" />
          <Text className="text-xs font-semibold text-white mt-1">Settle</Text>
        </Pressable>

        <Pressable
          onPress={onNewGroup}
          className="flex-1 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-800/60 py-3 active:bg-neutral-800"
        >
          <Ionicons name="people-outline" size={20} color="#38bdf8" />
          <Text className="text-xs font-semibold text-white mt-1">Group</Text>
        </Pressable>

        <Pressable
          onPress={onAddFriend}
          className="flex-1 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-800/60 py-3 active:bg-neutral-800"
        >
          <Ionicons name="person-add-outline" size={20} color="#fbbf24" />
          <Text className="text-xs font-semibold text-white mt-1">Friend</Text>
        </Pressable>
      </View>
    </View>
  );
}
