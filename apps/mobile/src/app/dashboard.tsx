import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authStore, useAuth } from '@/lib/auth-store';
import { ENV } from '@/constants/env';

export default function Dashboard() {
  const { user, accessToken, isAuthenticated } = useAuth();

  const handleLogout = () => {
    authStore.logout();
    router.replace('/');
  };

  // Fallback demo user if opened directly without logging in
  const currentUser = user || {
    id: 'demo-user-123',
    name: 'Sagar (Demo)',
    email: 'user@dhansplit.com',
    defaultCurrency: 'INR',
    isPro: true,
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-950">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 py-8"
        keyboardShouldPersistTaps="handled"
      >
        {/* Top Header */}
        <View className="flex-row items-center justify-between pb-6 border-b border-neutral-800/80">
          <View>
            <Text className="font-samarkan text-3xl text-white">
              dhan<Text className="text-emerald-400">split</Text>
            </Text>
            <Text className="text-xs uppercase tracking-widest text-neutral-500 mt-0.5">
              Authenticated Session
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 px-3 py-1">
            <View className="h-2 w-2 rounded-full bg-emerald-400" />
            <Text className="text-xs font-semibold text-emerald-400">Online</Text>
          </View>
        </View>

        {/* Profile Card */}
        <View className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6 items-center">
          <View className="relative">
            {currentUser.photoUri || currentUser.avatarUrl ? (
              <Image
                source={{ uri: currentUser.photoUri || currentUser.avatarUrl || '' }}
                className="h-24 w-24 rounded-full border-2 border-emerald-400"
              />
            ) : (
              <View className="h-24 w-24 items-center justify-center rounded-full border-2 border-emerald-400/40 bg-neutral-800">
                <Text className="text-3xl font-bold text-emerald-400">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
            )}
            <View className="absolute bottom-0 right-0 h-6 w-6 items-center justify-center rounded-full bg-emerald-400 border-2 border-neutral-950">
              <Ionicons name="checkmark" size={14} color="#0a0a0a" />
            </View>
          </View>

          <Text className="mt-4 text-2xl font-bold text-white text-center">
            {currentUser.name}
          </Text>
          <Text className="text-sm text-neutral-400 text-center mt-0.5">
            {currentUser.email}
          </Text>

          <View className="mt-4 flex-row items-center gap-2">
            <View className="rounded-full bg-neutral-800 px-3 py-1 border border-neutral-700">
              <Text className="text-xs font-medium text-neutral-300">
                Currency: {currentUser.defaultCurrency || 'INR'}
              </Text>
            </View>
            {currentUser.isPro ? (
              <View className="rounded-full bg-amber-400/10 px-3 py-1 border border-amber-400/30">
                <Text className="text-xs font-semibold text-amber-400">PRO MEMBER</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* User Details Details Section */}
        <View className="mt-6 gap-3">
          <Text className="text-xs font-semibold uppercase tracking-wider text-neutral-500 px-1">
            Account Details
          </Text>

          <View className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 gap-3">
            <View className="flex-row items-center justify-between py-1.5 border-b border-neutral-800/50">
              <Text className="text-sm text-neutral-400">User ID</Text>
              <Text className="text-sm font-mono text-neutral-200">
                {currentUser.id}
              </Text>
            </View>

            <View className="flex-row items-center justify-between py-1.5 border-b border-neutral-800/50">
              <Text className="text-sm text-neutral-400">Full Name</Text>
              <Text className="text-sm font-medium text-neutral-200">
                {currentUser.name}
              </Text>
            </View>

            <View className="flex-row items-center justify-between py-1.5 border-b border-neutral-800/50">
              <Text className="text-sm text-neutral-400">Email Address</Text>
              <Text className="text-sm font-medium text-neutral-200">
                {currentUser.email}
              </Text>
            </View>

            <View className="flex-row items-center justify-between py-1.5 border-b border-neutral-800/50">
              <Text className="text-sm text-neutral-400">Backend API</Text>
              <Text className="text-xs font-mono text-emerald-400">
                {ENV.API_URL}
              </Text>
            </View>

            <View className="flex-row items-center justify-between py-1.5">
              <Text className="text-sm text-neutral-400">Token</Text>
              <Text className="text-xs font-mono text-neutral-300">
                {accessToken ? `${accessToken.substring(0, 16)}...` : 'Active Session'}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="mt-8 gap-3">
          <Pressable
            className="flex-row items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 py-4 active:bg-red-500/20"
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={18} color="#f87171" />
            <Text className="text-base font-semibold text-red-400">Log out</Text>
          </Pressable>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
