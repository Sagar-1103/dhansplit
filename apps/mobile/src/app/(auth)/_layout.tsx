import { Stack } from 'expo-router';
import { useAppTheme } from '@/hooks/use-theme';

export default function AuthLayout() {
  const { isDark } = useAppTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: isDark ? '#0D0B16' : '#EDE3FD' },
      }}
    />
  );
}
