import '../../global.css';

import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import { useAppTheme } from '@/hooks/use-theme';
import { cssInterop } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

cssInterop(LinearGradient, { className: 'style' });
cssInterop(SafeAreaView, { className: 'style' });

export default function RootLayout() {
  const { isDark } = useAppTheme();
  const [fontsLoaded] = useFonts({
    Samarkan: require('../../assets/fonts/Samarkan.ttf'),
  });

  if (!fontsLoaded) {
    return <View className="flex-1 bg-violet-50 dark:bg-[#0c0c14]" />;
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: isDark ? '#0D0B16' : '#EDE3FD' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="account" options={{ animation: 'slide_from_right' }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}
