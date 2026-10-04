import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Banner } from '@/components/auth';
import { Field, PrimaryButton } from '@/components/form';
import { PhotoSheet } from '@/components/photo-sheet';
import { updateProfile } from '@/api/users';
import type { User } from '@/lib/auth-store';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: User;
}

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'CAD'];

export function EditProfileModal({
  visible,
  onClose,
  onSuccess,
  currentUser,
}: EditProfileModalProps) {
  const [name, setName] = useState(currentUser.name || '');
  const [currency, setCurrency] = useState(currentUser.defaultCurrency || 'INR');
  const [photoUri, setPhotoUri] = useState<string | null>(
    currentUser.photoUri || currentUser.avatarUrl || null
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCamera = async () => {
    setSheetOpen(false);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const openGallery = async () => {
    setSheetOpen(false);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Name cannot be empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await updateProfile({
        name: name.trim(),
        defaultCurrency: currency,
        avatarUrl: photoUri || undefined,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile. Please try again.');
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
            <Text className="text-xl font-bold text-white">Edit Profile</Text>
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

            {/* Avatar Section */}
            <View className="items-center my-3 gap-2">
              <Pressable
                onPress={() => setSheetOpen(true)}
                className="h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-emerald-400 bg-neutral-900 active:opacity-60"
              >
                {photoUri ? (
                  <Image source={{ uri: photoUri }} className="h-full w-full" />
                ) : (
                  <Text className="text-2xl font-bold text-emerald-400">
                    {name ? name.charAt(0).toUpperCase() : '?'}
                  </Text>
                )}
              </Pressable>
              <Pressable onPress={() => setSheetOpen(true)} className="active:opacity-60">
                <Text className="text-xs font-semibold text-emerald-400">
                  Change Photo
                </Text>
              </Pressable>
            </View>

            {/* Name */}
            <Field
              label="Full Name"
              placeholder="Your name"
              value={name}
              onChangeText={setName}
            />

            {/* Currency Selector */}
            <View className="mt-5">
              <Text className="text-xs uppercase font-medium text-neutral-400 mb-2.5">
                Default Currency
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                {CURRENCIES.map((curr) => {
                  const isSelected = currency === curr;
                  return (
                    <Pressable
                      key={curr}
                      onPress={() => setCurrency(curr)}
                      className={`rounded-xl border px-3.5 py-2.5 ${
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
                        {curr}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Submit */}
            <PrimaryButton
              title="Save Changes"
              loadingTitle="Saving..."
              onPress={handleSubmit}
              loading={loading}
              wrapperClassName="mt-8 mb-6"
            />
          </ScrollView>
        </View>

        <PhotoSheet
          visible={sheetOpen}
          onClose={() => setSheetOpen(false)}
          onCamera={openCamera}
          onGallery={openGallery}
          onRemove={
            photoUri
              ? () => {
                  setPhotoUri(null);
                  setSheetOpen(false);
                }
              : undefined
          }
        />
      </KeyboardAvoidingView>
    </Modal>
  );
}
