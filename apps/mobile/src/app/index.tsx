import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-black">
      <View className="items-center justify-center">
        <Text className="text-2xl font-bold text-black dark:text-white">
          dhansplit
        </Text>
      </View>
    </SafeAreaView>
  );
}
