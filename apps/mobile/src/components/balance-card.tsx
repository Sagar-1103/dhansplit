import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '@/hooks/use-theme';

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
  const { isDark } = useAppTheme();
  const isPositive = netBalance > 0.01;
  const isNegative = netBalance < -0.01;

  return (
    <View className="gap-4">
      {/* Total Balance Card matching the Folio reference */}
      <View className="rounded-[32px] bg-white dark:bg-[#151322] p-6 border border-neutral-100/90 dark:border-white/5 shadow-xl shadow-neutral-900/5">
        {/* Top Header: Total Balance + Currency badge */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Text className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              Total Balance
            </Text>
            <View className="rounded-md bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5">
              <Text className="text-[10px] font-bold text-neutral-600 dark:text-neutral-300">
                INR
              </Text>
            </View>
          </View>

          {/* Positive / Status Indicator Pill */}
          <View
            className={`flex-row items-center gap-1 rounded-full px-2.5 py-1 ${
              isPositive
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40'
                : isNegative
                ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40'
                : 'bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/40'
            }`}
          >
            <Ionicons
              name={
                isPositive
                  ? 'arrow-up-outline'
                  : isNegative
                  ? 'arrow-down-outline'
                  : 'checkmark-outline'
              }
              size={11}
              color={
                isPositive
                  ? '#059669'
                  : isNegative
                  ? '#E11D48'
                  : isDark
                  ? '#A78BFA'
                  : '#7C3AED'
              }
            />
            <Text
              className={`text-[11px] font-bold ${
                isPositive
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : isNegative
                  ? 'text-rose-700 dark:text-rose-400'
                  : 'text-violet-700 dark:text-violet-400'
              }`}
            >
              {isPositive
                ? '+ Active credit'
                : isNegative
                ? '- Due to pay'
                : 'All settled'}
            </Text>
          </View>
        </View>

        {/* Large Amount */}
        <View className="flex-row items-baseline mt-2">
          <Text className="text-2xl font-bold text-neutral-400 dark:text-neutral-500 mr-1">
            {currency}
          </Text>
          <Text className="text-[40px] font-black tracking-tight text-neutral-900 dark:text-white">
            {Math.abs(netBalance).toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>

        {/* Breakdown Row: Owed to you vs You owe */}
        <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800/80">
          <View className="flex-1">
            <View className="flex-row items-center gap-1.5 mb-1">
              <View className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
              <Text className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                You are owed
              </Text>
            </View>
            <Text className="text-base font-bold text-emerald-600 dark:text-emerald-400">
              {currency}
              {totalOwedToYou.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>

          <View className="h-8 w-[1px] bg-neutral-100 dark:bg-neutral-800 mx-3" />

          <View className="flex-1">
            <View className="flex-row items-center gap-1.5 mb-1">
              <View className="h-2 w-2 rounded-full bg-rose-500 dark:bg-rose-400" />
              <Text className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                You owe
              </Text>
            </View>
            <Text className="text-base font-bold text-rose-600 dark:text-rose-400">
              {currency}
              {totalYouOwe.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>
        </View>

        {/* Quick Action Pills matching the Folio reference design */}
        <View className="flex-row items-center gap-2.5 mt-5">
          {/* + Add (Primary Black Pill) */}
          <Pressable
            onPress={onAddExpense}
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-full bg-neutral-900 dark:bg-white py-3 px-3 shadow-md shadow-neutral-900/10 active:opacity-80"
          >
            <Ionicons
              name="add"
              size={18}
              color={isDark ? '#1A1A2E' : '#FFFFFF'}
            />
            <Text className="text-xs font-bold text-white dark:text-neutral-900">
              Add
            </Text>
          </Pressable>

          {/* Settle (Clean Secondary Pill) */}
          <Pressable
            onPress={onSettleUp}
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-full bg-neutral-100/90 dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60 py-3 px-3 active:opacity-70"
          >
            <Ionicons
              name="send-outline"
              size={16}
              color={isDark ? '#FFFFFF' : '#1A1A2E'}
            />
            <Text className="text-xs font-bold text-neutral-900 dark:text-white">
              Settle
            </Text>
          </Pressable>

          {/* Group Pill */}
          <Pressable
            onPress={onNewGroup}
            className="h-11 w-11 items-center justify-center rounded-full bg-neutral-100/90 dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60 active:opacity-70"
          >
            <Ionicons
              name="people-outline"
              size={18}
              color={isDark ? '#FFFFFF' : '#1A1A2E'}
            />
          </Pressable>

          {/* Friend Pill */}
          <Pressable
            onPress={onAddFriend}
            className="h-11 w-11 items-center justify-center rounded-full bg-neutral-100/90 dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60 active:opacity-70"
          >
            <Ionicons
              name="person-add-outline"
              size={17}
              color={isDark ? '#FFFFFF' : '#1A1A2E'}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
