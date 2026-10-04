import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Banner } from '@/components/auth';
import { Field, PrimaryButton } from '@/components/form';
import { createGroup } from '@/api/groups';
import type { User } from '@/lib/auth-store';

interface CreateGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  friends: User[];
}

const GROUP_TYPES: { id: 'HOME' | 'TRIP' | 'COUPLE' | 'OTHER'; name: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'HOME', name: 'Home / Flat', icon: 'home-outline' },
  { id: 'TRIP', name: 'Trip / Travel', icon: 'airplane-outline' },
  { id: 'COUPLE', name: 'Couple', icon: 'heart-outline' },
  { id: 'OTHER', name: 'Other', icon: 'people-outline' },
];

export function CreateGroupModal({
  visible,
  onClose,
  onSuccess,
  friends,
}: CreateGroupModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'HOME' | 'TRIP' | 'COUPLE' | 'OTHER'>('HOME');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [simplifyDebts, setSimplifyDebts] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleMember = (userId: string) => {
    if (selectedMemberIds.includes(userId)) {
      setSelectedMemberIds(selectedMemberIds.filter((id) => id !== userId));
    } else {
      setSelectedMemberIds([...selectedMemberIds, userId]);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Please provide a name for the group');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createGroup({
        name: name.trim(),
        type,
        defaultCurrency: 'INR',
        simplifyDebts,
        memberIds: selectedMemberIds,
      });

      setName('');
      setSelectedMemberIds([]);
      setError(null);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end bg-black/75"
      >
        <View className="max-h-[85%] rounded-t-3xl border-t border-neutral-800 bg-neutral-950 px-6 pb-8 pt-4">
          <View className="h-1.5 w-12 self-center rounded-full bg-neutral-700 mb-4" />

          <View className="flex-row items-center justify-between pb-3 border-b border-neutral-800">
            <Text className="text-xl font-bold text-white">Create a new group</Text>
            <Pressable onPress={onClose} className="p-1 active:opacity-60">
              <Ionicons name="close" size={24} color="#a3a3a3" />
            </Pressable>
          </View>

          <ScrollView className="mt-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {error && (
              <View className="mb-4">
                <Banner tone="error" message={error} />
              </View>
            )}

            {/* Group Name */}
            <Field
              label="Group Name"
              placeholder="e.g. Goa Trip 2026, Flat 402"
              value={name}
              onChangeText={setName}
            />

            {/* Group Type */}
            <View className="mt-5">
              <Text className="text-xs uppercase font-medium text-neutral-400 mb-2.5">
                Group Type
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {GROUP_TYPES.map((gt) => {
                  const isSelected = type === gt.id;
                  return (
                    <Pressable
                      key={gt.id}
                      onPress={() => setType(gt.id)}
                      className={`flex-row items-center gap-2 rounded-xl border px-3.5 py-2.5 ${
                        isSelected
                          ? 'border-emerald-400 bg-emerald-400/10'
                          : 'border-neutral-800 bg-neutral-900'
                      }`}
                    >
                      <Ionicons
                        name={gt.icon}
                        size={16}
                        color={isSelected ? '#34d399' : '#a3a3a3'}
                      />
                      <Text
                        className={`text-xs font-semibold ${
                          isSelected ? 'text-emerald-400' : 'text-neutral-400'
                        }`}
                      >
                        {gt.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Simplify Debts Setting */}
            <View className="mt-5 flex-row items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
              <View className="flex-1 pr-3">
                <Text className="text-sm font-semibold text-white">Simplify Debts</Text>
                <Text className="text-xs text-neutral-400 mt-0.5">
                  Automatically combines group debts so everyone makes fewer payments
                </Text>
              </View>
              <Switch
                value={simplifyDebts}
                onValueChange={setSimplifyDebts}
                trackColor={{ false: '#262626', true: '#059669' }}
                thumbColor={simplifyDebts ? '#34d399' : '#737373'}
              />
            </View>

            {/* Add Friends to Group */}
            {friends.length > 0 && (
              <View className="mt-5">
                <Text className="text-xs uppercase font-medium text-neutral-400 mb-2.5">
                  Select Members ({selectedMemberIds.length} selected)
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {friends.map((friend) => {
                    const isSelected = selectedMemberIds.includes(friend.id);
                    return (
                      <Pressable
                        key={friend.id}
                        onPress={() => toggleMember(friend.id)}
                        className={`flex-row items-center gap-1.5 rounded-xl border px-3 py-2 ${
                          isSelected
                            ? 'border-emerald-400 bg-emerald-400/10'
                            : 'border-neutral-800 bg-neutral-900'
                        }`}
                      >
                        <Ionicons
                          name={isSelected ? 'checkmark-circle' : 'add-circle-outline'}
                          size={16}
                          color={isSelected ? '#34d399' : '#737373'}
                        />
                        <Text
                          className={`text-xs font-medium ${
                            isSelected ? 'text-emerald-400' : 'text-neutral-300'
                          }`}
                        >
                          {friend.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Submit */}
            <PrimaryButton
              title="Create group"
              loadingTitle="Creating..."
              onPress={handleSubmit}
              loading={loading}
              wrapperClassName="mt-8 mb-6"
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
