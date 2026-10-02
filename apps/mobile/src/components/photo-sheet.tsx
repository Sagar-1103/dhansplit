import { Modal, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PhotoSheetProps {
  visible: boolean;
  onClose: () => void;
  onCamera: () => void;
  onGallery: () => void;
  onRemove?: () => void;
}

export function PhotoSheet({ visible, onClose, onCamera, onGallery, onRemove }: PhotoSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/70" onPress={onClose}>
        <Pressable
          className="gap-3 rounded-t-3xl border-t border-neutral-800 bg-neutral-900 px-6 pb-12 pt-4"
          onPress={() => {}}
        >
          <View className="h-1 w-10 self-center rounded-full bg-neutral-700" />
          <View className="mb-1">
            <Text className="text-base font-semibold text-white">Add profile photo</Text>
            <Text className="mt-1 text-xs text-neutral-500">
              Choose how you&apos;d like to add your picture
            </Text>
          </View>
          <Pressable
            className="flex-row items-center gap-4 rounded-xl bg-neutral-800/60 px-4 py-4 active:bg-neutral-800"
            onPress={onGallery}
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-emerald-400/10">
              <Ionicons name="images-outline" size={20} color="#34d399" />
            </View>
            <Text className="text-base text-white">Choose from gallery</Text>
          </Pressable>
          <Pressable
            className="flex-row items-center gap-4 rounded-xl bg-neutral-800/60 px-4 py-4 active:bg-neutral-800"
            onPress={onCamera}
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-emerald-400/10">
              <Ionicons name="camera-outline" size={20} color="#34d399" />
            </View>
            <Text className="text-base text-white">Take photo</Text>
          </Pressable>
          {onRemove ? (
            <Pressable
              className="flex-row items-center gap-4 rounded-xl bg-neutral-800/60 px-4 py-4 active:bg-neutral-800"
              onPress={onRemove}
            >
              <View className="h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                <Ionicons name="trash-outline" size={20} color="#f87171" />
              </View>
              <Text className="text-base text-red-400">Remove photo</Text>
            </Pressable>
          ) : null}
          <Pressable className="items-center py-3 active:opacity-60" onPress={onClose}>
            <Text className="text-sm font-medium text-neutral-400">Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
