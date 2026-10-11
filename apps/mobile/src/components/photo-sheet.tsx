import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';

interface PhotoSheetProps {
  visible: boolean;
  onClose: () => void;
  onCamera: () => void;
  onGallery: () => void;
  onRemove?: () => void;
}

export function PhotoSheet({ visible, onClose, onCamera, onGallery, onRemove }: PhotoSheetProps) {
  const { isDark } = useAppTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/60" onPress={onClose}>
        <Pressable
          className="gap-3.5 rounded-t-[32px] border-t border-neutral-200/80 dark:border-white/10 bg-white dark:bg-[#161224] px-6 pb-10 pt-4 shadow-2xl"
          onPress={() => {}}
        >
          {/* Grab handle */}
          <View className="h-1.5 w-12 self-center rounded-full bg-neutral-300 dark:bg-neutral-700" />

          <View className="mb-1 mt-1">
            <Text className="text-lg font-bold text-neutral-900 dark:text-white">
              Profile Photo
            </Text>
            <Text className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Choose how you would like to set your avatar
            </Text>
          </View>

          <Pressable
            className="flex-row items-center gap-3.5 rounded-2xl bg-neutral-100/80 dark:bg-white/[0.06] px-4 py-3.5 active:opacity-70"
            onPress={onGallery}
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-violet-500/10 dark:bg-violet-400/15">
              <Ionicons name="images-outline" size={20} color={isDark ? '#C4B5FD' : '#7C3AED'} />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-neutral-900 dark:text-white">
                Choose from gallery
              </Text>
              <Text className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Select an image from your library
              </Text>
            </View>
          </Pressable>

          <Pressable
            className="flex-row items-center gap-3.5 rounded-2xl bg-neutral-100/80 dark:bg-white/[0.06] px-4 py-3.5 active:opacity-70"
            onPress={onCamera}
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-violet-500/10 dark:bg-violet-400/15">
              <Ionicons name="camera-outline" size={20} color={isDark ? '#C4B5FD' : '#7C3AED'} />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-neutral-900 dark:text-white">
                Take a photo
              </Text>
              <Text className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Use your camera to capture a new photo
              </Text>
            </View>
          </Pressable>

          {onRemove ? (
            <Pressable
              className="flex-row items-center gap-3.5 rounded-2xl bg-red-500/5 dark:bg-red-500/10 px-4 py-3.5 active:opacity-70"
              onPress={onRemove}
            >
              <View className="h-10 w-10 items-center justify-center rounded-full bg-red-500/15">
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </View>
              <Text className="text-sm font-semibold text-red-600 dark:text-red-400">
                Remove current photo
              </Text>
            </Pressable>
          ) : null}

          <Pressable className="items-center py-2.5 active:opacity-60" onPress={onClose}>
            <Text className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
