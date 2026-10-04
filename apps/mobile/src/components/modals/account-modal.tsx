import React, { useEffect, useState } from 'react';
import {
  Alert,
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

interface AccountModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: User;
  onLogout: () => void;
}

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'CAD'];

export function AccountModal({
  visible,
  onClose,
  onSuccess,
  currentUser,
  onLogout,
}: AccountModalProps) {
  const [name, setName] = useState(currentUser.name || '');
  const [currency, setCurrency] = useState(currentUser.defaultCurrency || 'INR');
  const [photoUri, setPhotoUri] = useState<string | null>(
    currentUser.photoUri || currentUser.avatarUrl || null
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync state whenever modal opens or user updates
  useEffect(() => {
    if (visible) {
      setName(currentUser.name || '');
      setCurrency(currentUser.defaultCurrency || 'INR');
      setPhotoUri(currentUser.photoUri || currentUser.avatarUrl || null);
      setError(null);
      setSuccessMsg(null);
    }
  }, [visible, currentUser]);

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
    setSuccessMsg(null);

    try {
      await updateProfile({
        name: name.trim(),
        defaultCurrency: currency,
        avatarUrl: photoUri || undefined,
      });

      setSuccessMsg('Profile updated successfully!');
      onSuccess();
      setTimeout(() => {
        setSuccessMsg(null);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutPress = () => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Are you sure you want to log out of DhanSplit?')) {
        onClose();
        onLogout();
      }
    } else {
      Alert.alert('Log Out', 'Are you sure you want to log out of DhanSplit?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            onClose();
            onLogout();
          },
        },
      ]);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end bg-black/80"
      >
        <View className="max-h-[90%] rounded-t-3xl border-t border-neutral-800 bg-neutral-950 px-6 pb-10 pt-4">
          {/* Sheet Handle */}
          <View className="h-1.5 w-12 self-center rounded-full bg-neutral-700 mb-3" />

          {/* Header */}
          <View className="flex-row items-center justify-between pb-3 border-b border-neutral-800">
            <View className="flex-row items-center gap-2">
              <View className="h-7 w-7 items-center justify-center rounded-lg bg-emerald-400/10">
                <Ionicons name="person-circle-outline" size={20} color="#34d399" />
              </View>
              <Text className="text-xl font-bold text-white">Account & Profile</Text>
            </View>
            <Pressable onPress={onClose} className="p-1 active:opacity-60">
              <Ionicons name="close" size={24} color="#a3a3a3" />
            </Pressable>
          </View>

          <ScrollView className="mt-4" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {error && (
              <View className="mb-4">
                <Banner tone="error" message={error} />
              </View>
            )}

            {successMsg && (
              <View className="mb-4">
                <Banner tone="success" message={successMsg} />
              </View>
            )}

            {/* Account Overview Header Card */}
            <View className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-5 items-center">
              <View className="relative">
                <Pressable
                  onPress={() => setSheetOpen(true)}
                  className="h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-emerald-400 bg-neutral-950 active:opacity-75"
                >
                  {photoUri ? (
                    <Image source={{ uri: photoUri }} className="h-full w-full" />
                  ) : (
                    <View className="h-full w-full items-center justify-center bg-emerald-400/20">
                      <Text className="text-2xl font-bold text-emerald-400">
                        {name ? name.charAt(0).toUpperCase() : 'U'}
                      </Text>
                    </View>
                  )}
                </Pressable>
                <Pressable
                  onPress={() => setSheetOpen(true)}
                  className="absolute bottom-0 right-0 h-6 w-6 items-center justify-center rounded-full bg-emerald-400 border-2 border-neutral-950 active:bg-emerald-300"
                >
                  <Ionicons name="camera" size={12} color="#0a0a0a" />
                </Pressable>
              </View>

              <Pressable onPress={() => setSheetOpen(true)} className="mt-2.5 active:opacity-60">
                <Text className="text-xs font-semibold text-emerald-400">Change Photo</Text>
              </Pressable>

              <Text className="mt-2 text-lg font-bold text-white text-center">
                {currentUser.name || 'User'}
              </Text>
              <Text className="text-xs text-neutral-400 text-center mt-0.5">
                {currentUser.email || 'user@dhansplit.com'}
              </Text>

              <View className="mt-3 flex-row items-center gap-2">
                <View className="rounded-full bg-neutral-800 px-3 py-1 border border-neutral-700">
                  <Text className="text-[11px] font-medium text-neutral-300">
                    Currency: {currency}
                  </Text>
                </View>
                {currentUser.isPro ? (
                  <View className="rounded-full bg-amber-400/10 px-3 py-1 border border-amber-400/30">
                    <Text className="text-[11px] font-semibold text-amber-400">PRO MEMBER</Text>
                  </View>
                ) : (
                  <View className="rounded-full bg-emerald-400/10 px-3 py-1 border border-emerald-400/20">
                    <Text className="text-[11px] font-semibold text-emerald-400">STANDARD</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Profile Editing Section */}
            <View className="mt-6 gap-4">
              <Text className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Edit Profile
              </Text>

              <Field
                label="Full Name"
                placeholder="Your name"
                value={name}
                onChangeText={setName}
              />

              {/* Currency Selector */}
              <View>
                <Text className="text-xs uppercase font-medium text-neutral-400 mb-2">
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

              <PrimaryButton
                title="Save Changes"
                loadingTitle="Saving..."
                onPress={handleSubmit}
                loading={loading}
                wrapperClassName="mt-2"
              />
            </View>

            {/* Log Out Button */}
            <View className="mt-6 mb-4">
              <Pressable
                onPress={handleLogoutPress}
                className="flex-row items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 py-3.5 active:bg-red-500/20"
              >
                <Ionicons name="log-out-outline" size={18} color="#f87171" />
                <Text className="text-sm font-semibold text-red-400">Log out</Text>
              </Pressable>
            </View>
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
