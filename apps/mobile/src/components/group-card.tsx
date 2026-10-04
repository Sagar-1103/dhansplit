import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import type { Group } from '@/api/groups';

interface GroupCardProps {
  group: Group;
  onPress?: (group: Group) => void;
}

export function GroupCard({ group, onPress }: GroupCardProps) {
  const { isDark } = useAppTheme();

  let iconName: keyof typeof Ionicons.glyphMap = 'people-outline';
  let badgeText = 'Other';
  let iconBgClass = 'bg-violet-100 dark:bg-violet-900/30';
  let iconColor = isDark ? '#A78BFA' : '#7C3AED';

  switch (group.type) {
    case 'HOME':
      iconName = 'home-outline';
      badgeText = 'Home';
      iconBgClass = 'bg-blue-100 dark:bg-blue-900/30';
      iconColor = isDark ? '#93C5FD' : '#2563EB';
      break;
    case 'TRIP':
      iconName = 'airplane-outline';
      badgeText = 'Trip';
      iconBgClass = 'bg-amber-100 dark:bg-amber-900/30';
      iconColor = isDark ? '#FCD34D' : '#D97706';
      break;
    case 'COUPLE':
      iconName = 'heart-outline';
      badgeText = 'Couple';
      iconBgClass = 'bg-pink-100 dark:bg-pink-900/30';
      iconColor = isDark ? '#F9A8D4' : '#DB2777';
      break;
    default:
      iconName = 'people-outline';
      badgeText = 'Group';
  }

  const memberCount = group.members?.length || 0;

  return (
    <Pressable
      onPress={() => onPress?.(group)}
      className="rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 active:bg-neutral-50 dark:active:bg-neutral-800"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View
            className={`h-12 w-12 items-center justify-center rounded-2xl ${iconBgClass}`}
          >
            <Ionicons name={iconName} size={22} color={iconColor} />
          </View>
          <View>
            <Text className="text-base font-bold text-neutral-900 dark:text-white">
              {group.name}
            </Text>
            <Text className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {memberCount} {memberCount === 1 ? 'member' : 'members'} • {badgeText}
            </Text>
          </View>
        </View>

        {group.simplifyDebts && (
          <View className="rounded-full bg-violet-100 dark:bg-violet-900/30 px-2.5 py-1">
            <Text className="text-[10px] font-semibold text-violet-700 dark:text-violet-400 uppercase tracking-wide">
              Simplified
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
