import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import type { Expense } from '@/api/expenses';

interface ExpenseItemProps {
  expense: Expense;
  currentUserId: string;
  onPress?: (expense: Expense) => void;
}

export function ExpenseItem({ expense, currentUserId, onPress }: ExpenseItemProps) {
  const { isDark } = useAppTheme();
  const isPaidByMe = expense.paidById === currentUserId;
  const myShare = expense.shares.find((s) => s.userId === currentUserId);
  const myOwedAmount = myShare ? Number(myShare.amount) : 0;

  // If I paid, people owe me (total expense amount minus my share)
  // If someone else paid and I am in shares, I owe my share
  let statusText = '';
  let statusColor = '';
  let amountDisplay = '';

  if (isPaidByMe) {
    const othersOweMe = expense.amount - myOwedAmount;
    if (othersOweMe > 0) {
      statusText = 'you lent';
      statusColor = 'text-emerald-600 dark:text-emerald-400';
      amountDisplay = `+₹${othersOweMe.toFixed(2)}`;
    } else {
      statusText = 'you paid for yourself';
      statusColor = 'text-neutral-500 dark:text-neutral-400';
      amountDisplay = `₹${expense.amount.toFixed(2)}`;
    }
  } else {
    if (myOwedAmount > 0) {
      statusText = 'you borrowed';
      statusColor = 'text-rose-600 dark:text-rose-400';
      amountDisplay = `-₹${myOwedAmount.toFixed(2)}`;
    } else {
      statusText = 'not involved';
      statusColor = 'text-neutral-400 dark:text-neutral-500';
      amountDisplay = '₹0.00';
    }
  }

  const category = expense.category.toLowerCase();
  let iconName: keyof typeof Ionicons.glyphMap = 'receipt-outline';
  let iconBgClass = 'bg-neutral-100 dark:bg-neutral-800';
  let iconColor = isDark ? '#9CA3AF' : '#6B7280';

  if (
    category.includes('food') ||
    category.includes('dine') ||
    category.includes('eat') ||
    category.includes('dinner')
  ) {
    iconName = 'restaurant-outline';
    iconBgClass = 'bg-amber-100 dark:bg-amber-900/30';
    iconColor = isDark ? '#FCD34D' : '#D97706';
  } else if (
    category.includes('travel') ||
    category.includes('flight') ||
    category.includes('uber') ||
    category.includes('trip')
  ) {
    iconName = 'airplane-outline';
    iconBgClass = 'bg-sky-100 dark:bg-sky-900/30';
    iconColor = isDark ? '#7DD3FC' : '#0284C7';
  } else if (
    category.includes('grocery') ||
    category.includes('shop') ||
    category.includes('mart')
  ) {
    iconName = 'cart-outline';
    iconBgClass = 'bg-violet-100 dark:bg-violet-900/30';
    iconColor = isDark ? '#A78BFA' : '#7C3AED';
  } else if (
    category.includes('rent') ||
    category.includes('home') ||
    category.includes('bill')
  ) {
    iconName = 'home-outline';
    iconBgClass = 'bg-blue-100 dark:bg-blue-900/30';
    iconColor = isDark ? '#93C5FD' : '#2563EB';
  }

  const dateStr = new Date(expense.date || expense.createdAt).toLocaleDateString(
    'en-IN',
    {
      month: 'short',
      day: 'numeric',
    }
  );

  return (
    <Pressable
      onPress={() => onPress?.(expense)}
      className="flex-row items-center justify-between rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 active:bg-neutral-50 dark:active:bg-neutral-800"
    >
      <View className="flex-row items-center gap-3.5 flex-1 pr-3">
        <View
          className={`h-11 w-11 items-center justify-center rounded-2xl ${iconBgClass}`}
        >
          <Ionicons name={iconName} size={20} color={iconColor} />
        </View>

        <View className="flex-1">
          <Text
            className="text-base font-semibold text-neutral-900 dark:text-white"
            numberOfLines={1}
          >
            {expense.description}
          </Text>
          <View className="flex-row items-center gap-2 mt-0.5">
            <Text className="text-xs text-neutral-500 dark:text-neutral-400">
              {isPaidByMe ? 'You paid' : `${expense.paidBy?.name || 'Someone'} paid`} ₹$
              {expense.amount.toFixed(0)}
            </Text>
            <Text className="text-xs text-neutral-300 dark:text-neutral-600">•</Text>
            <Text className="text-xs text-neutral-400 dark:text-neutral-500">
              {dateStr}
            </Text>
          </View>
        </View>
      </View>

      <View className="items-end">
        <Text className="text-xs uppercase font-medium text-neutral-400 dark:text-neutral-500">
          {statusText}
        </Text>
        <Text className={`text-base font-bold ${statusColor}`}>{amountDisplay}</Text>
      </View>
    </Pressable>
  );
}
