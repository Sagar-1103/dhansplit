import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Banner } from '@/components/auth';
import { Field, PrimaryButton } from '@/components/form';
import { createSettlement, type PaymentMethod } from '@/api/settlements';
import type { User } from '@/lib/auth-store';

interface SettleUpModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  friends: User[];
  defaultPayee?: User | null;
  defaultAmount?: number;
}

const PAYMENT_METHODS: { id: PaymentMethod; name: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'UPI', name: 'UPI', icon: 'flash-outline' },
  { id: 'CASH', name: 'Cash', icon: 'cash-outline' },
  { id: 'BANK_TRANSFER', name: 'Bank Transfer', icon: 'business-outline' },
  { id: 'OTHER', name: 'Other', icon: 'wallet-outline' },
];

export function SettleUpModal({
  visible,
  onClose,
  onSuccess,
  friends,
  defaultPayee,
  defaultAmount,
}: SettleUpModalProps) {
  const [selectedPayeeId, setSelectedPayeeId] = useState<string>(
    defaultPayee?.id || friends[0]?.id || ''
  );
  const [amount, setAmount] = useState<string>(
    defaultAmount && defaultAmount > 0 ? String(defaultAmount) : ''
  );
  const [method, setMethod] = useState<PaymentMethod>('UPI');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync if defaultPayee changes
  React.useEffect(() => {
    if (defaultPayee) {
      setSelectedPayeeId(defaultPayee.id);
    } else if (friends.length > 0 && !selectedPayeeId) {
      setSelectedPayeeId(friends[0].id);
    }
    if (defaultAmount && defaultAmount > 0) {
      setAmount(String(defaultAmount));
    }
  }, [defaultPayee, defaultAmount, friends]);

  const numAmount = parseFloat(amount) || 0;

  const handleSubmit = async () => {
    if (!selectedPayeeId) {
      setError('Please select a recipient to settle up with');
      return;
    }
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid settlement amount');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createSettlement({
        amount: numAmount,
        currency: 'INR',
        method,
        notes: notes.trim() || undefined,
        payeeId: selectedPayeeId,
      });

      setAmount('');
      setNotes('');
      setError(null);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record settlement. Please try again.');
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
            <Text className="text-xl font-bold text-white">Record payment</Text>
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

            {/* Recipient Picker */}
            <View className="mb-5">
              <Text className="text-xs uppercase font-medium text-neutral-400 mb-2.5">
                Who did you pay?
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                {friends.map((friend) => {
                  const isSelected = selectedPayeeId === friend.id;
                  return (
                    <Pressable
                      key={friend.id}
                      onPress={() => setSelectedPayeeId(friend.id)}
                      className={`flex-row items-center gap-2 rounded-xl border px-3.5 py-2.5 ${
                        isSelected
                          ? 'border-emerald-400 bg-emerald-400/10'
                          : 'border-neutral-800 bg-neutral-900'
                      }`}
                    >
                      <View className="h-6 w-6 rounded-full bg-neutral-800 items-center justify-center">
                        <Text className="text-xs font-bold text-emerald-400">
                          {friend.name ? friend.name.charAt(0).toUpperCase() : '?'}
                        </Text>
                      </View>
                      <Text
                        className={`text-xs font-semibold ${
                          isSelected ? 'text-emerald-400' : 'text-neutral-300'
                        }`}
                      >
                        {friend.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Amount */}
            <View className="gap-4">
              <Field
                label="Amount paid (₹)"
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
              />

              <Field
                label="Notes (Optional)"
                placeholder="e.g. GPay transaction ref, dinner payback"
                value={notes}
                onChangeText={setNotes}
              />
            </View>

            {/* Payment Method Selector */}
            <View className="mt-5">
              <Text className="text-xs uppercase font-medium text-neutral-400 mb-2.5">
                Payment Method
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {PAYMENT_METHODS.map((pm) => {
                  const isSelected = method === pm.id;
                  return (
                    <Pressable
                      key={pm.id}
                      onPress={() => setMethod(pm.id)}
                      className={`flex-row items-center gap-2 rounded-xl border px-3.5 py-2.5 ${
                        isSelected
                          ? 'border-emerald-400 bg-emerald-400/10'
                          : 'border-neutral-800 bg-neutral-900'
                      }`}
                    >
                      <Ionicons
                        name={pm.icon}
                        size={16}
                        color={isSelected ? '#34d399' : '#a3a3a3'}
                      />
                      <Text
                        className={`text-xs font-semibold ${
                          isSelected ? 'text-emerald-400' : 'text-neutral-400'
                        }`}
                      >
                        {pm.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Submit */}
            <PrimaryButton
              title="Record payment"
              loadingTitle="Recording..."
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
