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
import { sendFriendRequest } from '@/api/friends';

interface AddFriendModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddFriendModal({
  visible,
  onClose,
  onSuccess,
}: AddFriendModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await sendFriendRequest({ email: email.trim().toLowerCase() });
      setSuccessMessage(`Friend request sent to ${email.trim()}`);
      setEmail('');
      setTimeout(() => {
        onSuccess();
        onClose();
        setSuccessMessage(null);
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to send friend request. Make sure the user exists.');
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
        <View className="rounded-t-3xl border-t border-neutral-800 bg-neutral-950 px-6 pb-8 pt-4">
          <View className="h-1.5 w-12 self-center rounded-full bg-neutral-700 mb-4" />

          <View className="flex-row items-center justify-between pb-3 border-b border-neutral-800">
            <Text className="text-xl font-bold text-white">Add a new friend</Text>
            <Pressable onPress={onClose} className="p-1 active:opacity-60">
              <Ionicons name="close" size={24} color="#a3a3a3" />
            </Pressable>
          </View>

          <ScrollView className="mt-4" keyboardShouldPersistTaps="handled">
            {error && (
              <View className="mb-4">
                <Banner tone="error" message={error} />
              </View>
            )}

            {successMessage && (
              <View className="mb-4">
                <Banner tone="success" message={successMessage} />
              </View>
            )}

            <Field
              label="Friend's Email"
              placeholder="friend@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
            />

            <Text className="text-xs text-neutral-400 mt-2">
              We&apos;ll send an invite to connect on DhanSplit so you can split expenses effortlessly.
            </Text>

            <PrimaryButton
              title="Send request"
              loadingTitle="Sending..."
              onPress={handleSubmit}
              loading={loading}
              wrapperClassName="mt-6 mb-4"
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
