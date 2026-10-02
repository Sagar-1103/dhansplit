import { Pressable, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-store';

export default function Index() {
  const { isAuthenticated, user, hasHydrated } = useAuth();

  useEffect(() => {
    if (hasHydrated && isAuthenticated && user) {
      router.replace('/dashboard');
    }
  }, [hasHydrated, isAuthenticated, user]);

  return (
    <View className="flex-1 bg-neutral-950 px-8">
      <View className="flex-1 items-center justify-center">
        <Text className="font-samarkan text-6xl text-white">
          dhan<Text className="text-emerald-400">split</Text>
        </Text>
        <Text className="mt-4 text-xs uppercase tracking-[0.35em] text-neutral-500">
          Split expenses, not friendships
        </Text>
      </View>

      <View className="gap-3 pb-12">
        {!hasHydrated ? null : isAuthenticated && user ? (
          <Link href="/dashboard" asChild>
            <Pressable className="items-center rounded-xl bg-emerald-400 py-4 active:bg-emerald-300">
              <Text className="text-base font-semibold text-neutral-950">
                Continue as {user.name}
              </Text>
            </Pressable>
          </Link>
        ) : (
          <>
            <Link href="/(auth)/signup" asChild>
              <Pressable className="items-center rounded-xl bg-emerald-400 py-4 active:bg-emerald-300">
                <Text className="text-base font-semibold text-neutral-950">Get started</Text>
              </Pressable>
            </Link>
            <Link href="/(auth)/login" asChild>
              <Pressable className="items-center rounded-xl border border-neutral-800 bg-neutral-900 py-4 active:bg-neutral-800">
                <Text className="text-base font-semibold text-white">Log in</Text>
              </Pressable>
            </Link>
          </>
        )}
      </View>
    </View>
  );
}
