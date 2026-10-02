import '../../global.css';

import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Samarkan: require('../../assets/fonts/Samarkan.ttf'),
  });

  if (!fontsLoaded) {
    return <View className="flex-1 bg-neutral-950" />;
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0a0a0a' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="dashboard" />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
