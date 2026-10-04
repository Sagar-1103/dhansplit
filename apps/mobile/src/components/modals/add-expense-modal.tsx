import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Banner } from '@/components/auth';
import { Field, PrimaryButton } from '@/components/form';
import { createExpense, type SplitType } from '@/api/expenses';
import type { Group } from '@/api/groups';
import type { User } from '@/lib/auth-store';

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  groups: Group[];
  friends: User[];
  currentUserId: string;
}

const CATEGORIES = [
  { id: 'dining', name: 'Dining', icon: 'restaurant-outline' },
  { id: 'travel', name: 'Travel', icon: 'airplane-outline' },
  { id: 'groceries', name: 'Groceries', icon: 'cart-outline' },
  { id: 'rent', name: 'Rent', icon: 'home-outline' },
  { id: 'drinks', name: 'Drinks', icon: 'cafe-outline' },
  { id: 'general', name: 'General', icon: 'receipt-outline' },
];

export function AddExpenseModal({
  visible,
  onClose,
  onSuccess,
  groups,
  friends,
  currentUserId,
}: AddExpenseModalProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('dining');
  const [splitType, setSplitType] = useState<SplitType>('EQUAL');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([currentUserId]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // When group changes, update available members
  const activeGroup = groups.find((g) => g.id === selectedGroupId);
  const availableParticipants = activeGroup
    ? activeGroup.members.map((m) => m.user)
    : friends;

  const toggleParticipant = (userId: string) => {
    if (userId === currentUserId) return; // Keep creator selected
    if (selectedMemberIds.includes(userId)) {
      setSelectedMemberIds(selectedMemberIds.filter((id) => id !== userId));
    } else {
      setSelectedMemberIds([...selectedMemberIds, userId]);
    }
  };

  const handleGroupSelect = (groupId: string | null) => {
    setSelectedGroupId(groupId);
    if (groupId) {
      const grp = groups.find((g) => g.id === groupId);
      if (grp) {
        setSelectedMemberIds(grp.members.map((m) => m.userId));
      }
    } else {
      setSelectedMemberIds([currentUserId]);
    }
  };

  const numAmount = parseFloat(amount) || 0;
  const splitAmount = selectedMemberIds.length > 0 ? (numAmount / selectedMemberIds.length).toFixed(2) : '0.00';

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError('Please enter a description for the expense');
      return;
    }
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (selectedMemberIds.length === 0) {
      setError('Please select at least one participant');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build split participants input
      const participants = selectedMemberIds.map((userId) => ({
        userId,
      }));

      await createExpense({
        description: description.trim(),
        amount: numAmount,
        currency: 'INR',
        category,
        splitType,
        groupId: selectedGroupId || undefined,
        participants,
      });

      // Reset form
      setDescription('');
      setAmount('');
      setError(null);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create expense. Please try again.');
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
        <View className="max-h-[88%] rounded-t-3xl border-t border-neutral-800 bg-neutral-950 px-6 pb-8 pt-4">
          <View className="h-1.5 w-12 self-center rounded-full bg-neutral-700 mb-4" />

          <View className="flex-row items-center justify-between pb-3 border-b border-neutral-800">
            <Text className="text-xl font-bold text-white">Add an expense</Text>
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

            {/* Description & Amount */}
            <View className="gap-4">
              <Field
                label="Description"
                placeholder="e.g. Dinner, Grocery, Flight"
                value={description}
                onChangeText={setDescription}
              />

              <Field
                label="Amount (₹)"
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            {/* Category Selector */}
            <View className="mt-5">
              <Text className="text-xs uppercase font-medium text-neutral-400 mb-2.5">
                Category
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <Pressable
                      key={cat.id}
                      onPress={() => setCategory(cat.id)}
                      className={`flex-row items-center gap-1.5 rounded-xl border px-3 py-2 ${
                        isSelected
                          ? 'border-emerald-400 bg-emerald-400/10'
                          : 'border-neutral-800 bg-neutral-900'
                      }`}
                    >
                      <Ionicons
                        name={cat.icon as any}
                        size={16}
                        color={isSelected ? '#34d399' : '#a3a3a3'}
                      />
                      <Text
                        className={`text-xs font-medium ${
                          isSelected ? 'text-emerald-400' : 'text-neutral-400'
                        }`}
                      >
                        {cat.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Optional Group Selector */}
            {groups.length > 0 && (
              <View className="mt-5">
                <Text className="text-xs uppercase font-medium text-neutral-400 mb-2.5">
                  Group (Optional)
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                  <Pressable
                    onPress={() => handleGroupSelect(null)}
                    className={`rounded-xl border px-3.5 py-2 ${
                      selectedGroupId === null
                        ? 'border-emerald-400 bg-emerald-400/10'
                        : 'border-neutral-800 bg-neutral-900'
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        selectedGroupId === null ? 'text-emerald-400' : 'text-neutral-400'
                      }`}
                    >
                      No Group (Friends)
                    </Text>
                  </Pressable>

                  {groups.map((grp) => {
                    const isSelected = selectedGroupId === grp.id;
                    return (
                      <Pressable
                        key={grp.id}
                        onPress={() => handleGroupSelect(grp.id)}
                        className={`rounded-xl border px-3.5 py-2 ${
                          isSelected
                            ? 'border-emerald-400 bg-emerald-400/10'
                            : 'border-neutral-800 bg-neutral-900'
                        }`}
                      >
                        <Text
                          className={`text-xs font-semibold ${
                            isSelected ? 'text-emerald-400' : 'text-neutral-400'
                          }`}
                        >
                          {grp.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Participants Selector */}
            <View className="mt-5">
              <View className="flex-row items-center justify-between mb-2.5">
                <Text className="text-xs uppercase font-medium text-neutral-400">
                  Split with ({selectedMemberIds.length})
                </Text>
                {numAmount > 0 && selectedMemberIds.length > 0 && (
                  <Text className="text-xs text-emerald-400 font-medium">
                    ₹{splitAmount} / person
                  </Text>
                )}
              </View>

              <View className="flex-row flex-wrap gap-2">
                <View className="rounded-xl border border-emerald-400/50 bg-emerald-400/10 px-3 py-2">
                  <Text className="text-xs font-medium text-emerald-300">You (Paid)</Text>
                </View>

                {availableParticipants
                  .filter((p) => p.id !== currentUserId)
                  .map((p) => {
                    const isSelected = selectedMemberIds.includes(p.id);
                    return (
                      <Pressable
                        key={p.id}
                        onPress={() => toggleParticipant(p.id)}
                        className={`rounded-xl border px-3 py-2 ${
                          isSelected
                            ? 'border-emerald-400 bg-emerald-400/10'
                            : 'border-neutral-800 bg-neutral-900'
                        }`}
                      >
                        <Text
                          className={`text-xs font-medium ${
                            isSelected ? 'text-emerald-400' : 'text-neutral-400'
                          }`}
                        >
                          {p.name}
                        </Text>
                      </Pressable>
                    );
                  })}
              </View>
            </View>

            {/* Primary Action Button */}
            <PrimaryButton
              title="Add expense"
              loadingTitle="Adding..."
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
