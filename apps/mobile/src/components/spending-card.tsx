import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '@/hooks/use-theme';
import type { Expense } from '@/api/expenses';

interface SpendingCardProps {
  expenses: Expense[];
  currency?: string;
}

export function SpendingCard({ expenses, currency = '₹' }: SpendingCardProps) {
  const { isDark } = useAppTheme();
  const [period, setPeriod] = useState<'month' | 'all'>('month');

  // Calculate total expense amount
  const totalAmount = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  // Month data points mimicking the Folio reference design
  const monthsData = [
    { label: 'May', heightPercent: 45, isCurrent: false },
    { label: 'June', heightPercent: 65, isCurrent: false },
    { label: 'July', heightPercent: 30, isCurrent: false },
    { label: 'Aug', heightPercent: 90, isCurrent: true },
    { label: 'Sep', heightPercent: 40, isCurrent: false },
    { label: 'Oct', heightPercent: 55, isCurrent: false },
    { label: 'Nov', heightPercent: 75, isCurrent: false },
  ];

  return (
    <View className="rounded-[32px] overflow-hidden bg-white dark:bg-[#151322] border border-neutral-100/90 dark:border-white/5 shadow-xl shadow-neutral-900/5">
      {/* Top Header with Soft Lavender Gradient Mesh matching the reference image */}
      <LinearGradient
        colors={
          isDark
            ? ['#261B42', '#1B1430', '#151322']
            : ['#EFE5FD', '#F7F2FE', '#FFFFFF']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={{ padding: 20, paddingBottom: 12 }}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
            Total spending
          </Text>
          <View className="flex-row items-center gap-1 rounded-full bg-white/70 dark:bg-neutral-800/80 px-2.5 py-1 border border-neutral-200/50 dark:border-neutral-700/50">
            <Text className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
              This Month
            </Text>
            <Ionicons
              name="chevron-down"
              size={12}
              color={isDark ? '#D1D5DB' : '#4B5563'}
            />
          </View>
        </View>

        {/* Big Spending Amount */}
        <View className="flex-row items-baseline mt-1.5">
          <Text className="text-xl font-bold text-neutral-400 dark:text-neutral-500 mr-1">
            {currency}
          </Text>
          <Text className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white">
            {totalAmount > 0
              ? totalAmount.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : '754.33'}
          </Text>
        </View>
      </LinearGradient>

      {/* Bar Chart Section */}
      <View className="px-5 pb-5 pt-2">
        <View className="h-28 flex-row items-end justify-between pt-4">
          {monthsData.map((m) => (
            <View key={m.label} className="items-center flex-1">
              {/* Vertical Bar */}
              <View className="h-20 w-full items-center justify-end">
                <View
                  style={{ height: `${m.heightPercent}%` }}
                  className={`w-7 rounded-t-xl transition-all duration-300 ${
                    m.isCurrent
                      ? 'bg-neutral-900 dark:bg-white'
                      : 'bg-violet-200/70 dark:bg-violet-900/30'
                  }`}
                />
              </View>
              {/* Month label */}
              <Text
                className={`text-[10px] mt-2 font-medium ${
                  m.isCurrent
                    ? 'text-neutral-900 dark:text-white font-bold'
                    : 'text-neutral-400 dark:text-neutral-500'
                }`}
              >
                {m.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
