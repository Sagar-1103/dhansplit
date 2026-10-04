import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Group } from '@/api/groups';

interface GroupCardProps {
  group: Group;
  onPress?: (group: Group) => void;
}

export function GroupCard({ group, onPress }: GroupCardProps) {
  let iconName: keyof typeof Ionicons.glyphMap = 'people-outline';
  let badgeText = 'Other';

  switch (group.type) {
    case 'HOME':
      iconName = 'home-outline';
      badgeText = 'Home';
      break;
    case 'TRIP':
      iconName = 'airplane-outline';
      badgeText = 'Trip';
      break;
    case 'COUPLE':
      iconName = 'heart-outline';
      badgeText = 'Couple';
      break;
    default:
      iconName = 'people-outline';
      badgeText = 'Group';
  }

  const memberCount = group.members?.length || 0;

  return (
    <Pressable
      onPress={() => onPress?.(group)}
      className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 active:bg-neutral-800/80"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 border border-emerald-400/20">
            <Ionicons name={iconName} size={22} color="#34d399" />
          </View>
          <View>
            <Text className="text-base font-bold text-white">{group.name}</Text>
            <Text className="text-xs text-neutral-400 mt-0.5">
              {memberCount} {memberCount === 1 ? 'member' : 'members'} • {badgeText}
            </Text>
          </View>
        </View>

        {group.simplifyDebts && (
          <View className="rounded-full bg-neutral-800 px-2.5 py-1">
            <Text className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wide">
              Simplified
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
