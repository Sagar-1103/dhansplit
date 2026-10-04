import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '@/lib/auth-store';
import { useAppTheme } from '@/hooks/use-theme';
import { ThreeDCoin } from '@/components/ui/three-d-coin';

interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  coinIcon: keyof typeof Ionicons.glyphMap;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Money, Made\nSimple',
    subtitle:
      'Track shared expenses, manage daily spends, and keep balances clear.',
    coinIcon: 'wallet',
  },
  {
    id: '2',
    title: 'Split Bills,\nNot Friendships',
    subtitle:
      'Create groups for trips, roommates, or dinner. Everyone knows who paid what.',
    coinIcon: 'people',
  },
  {
    id: '3',
    title: 'Settle Up,\nIn One Tap',
    subtitle:
      'See who owes what in seconds, and record payments with zero hassle.',
    coinIcon: 'checkmark-done',
  },
];

function SlideItem({
  item,
  width,
  isSmallScreen,
}: {
  item: OnboardingSlide;
  width: number;
  isSmallScreen: boolean;
}) {
  const coinSize = isSmallScreen ? 140 : 175;

  return (
    <View
      style={{ width, height: '100%' }}
      className="px-8 justify-between py-2"
    >
      {/* Top Typography Section */}
      <View className="mt-2">
        {/* Bold Modern Headline */}
        <Text className="text-[38px] font-black leading-[44px] text-neutral-900 dark:text-white tracking-tight">
          {item.title}
        </Text>

        {/* Subtitle */}
        <Text className="mt-3 text-sm leading-5 text-neutral-500 dark:text-neutral-400 max-w-[310px]">
          {item.subtitle}
        </Text>
      </View>

      {/* Center 3D Coin Visual */}
      <View className="items-center justify-center my-auto py-2">
        <ThreeDCoin size={coinSize} iconName={item.coinIcon} />
      </View>
    </View>
  );
}

export default function Index() {
  const { isAuthenticated, user, hasHydrated } = useAuth();
  const { isDark } = useAppTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isSmallScreen = windowHeight < 750;

  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<OnboardingSlide>>(null);

  useEffect(() => {
    if (hasHydrated && isAuthenticated && user) {
      router.replace('/dashboard');
    }
  }, [hasHydrated, isAuthenticated, user]);

  const handleMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const newIndex = Math.round(offsetX / windowWidth);
      if (newIndex >= 0 && newIndex < SLIDES.length) {
        setActiveIndex(newIndex);
      }
    },
    [windowWidth]
  );

  const isLastSlide = activeIndex === SLIDES.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      router.push('/(auth)/signup');
      return;
    }
    const nextIndex = activeIndex + 1;
    flatListRef.current?.scrollToIndex({
      index: nextIndex,
      animated: true,
    });
    setActiveIndex(nextIndex);
  };

  const renderItem = useCallback(
    ({ item }: { item: OnboardingSlide }) => (
      <SlideItem
        item={item}
        width={windowWidth}
        isSmallScreen={isSmallScreen}
      />
    ),
    [windowWidth, isSmallScreen]
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: windowWidth,
      offset: windowWidth * index,
      index,
    }),
    [windowWidth]
  );

  const onScrollToIndexFailed = useCallback(
    (info: { index: number }) => {
      flatListRef.current?.scrollToOffset({
        offset: info.index * windowWidth,
        animated: true,
      });
    },
    [windowWidth]
  );

  // Background Gradient Colors
  const gradientColors = isDark
    ? (['#18122C', '#120F20', '#0D0B16', '#1A132E'] as const)
    : (['#EDE3FD', '#F7F3FE', '#FFFFFF', '#ECE3FA'] as const);

  if (!hasHydrated) {
    return (
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{ flex: 1 }}
      />
    );
  }

  // Already authenticated — continue screen with modern gradient
  if (isAuthenticated && user) {
    return (
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View className="flex-1 items-center justify-center px-8">
            <View className="mb-6">
              <ThreeDCoin size={160} iconName="wallet" />
            </View>
            <Text className="font-samarkan text-6xl text-neutral-900 dark:text-white">
              dhan<Text className="text-violet-600 dark:text-violet-400">split</Text>
            </Text>
            <Text className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              Welcome back to Dhansplit
            </Text>
          </View>
          <View className="px-8 pb-10">
            <Link href="/dashboard" asChild>
              <Pressable className="flex-row items-center justify-center gap-2 rounded-full bg-neutral-900 dark:bg-white py-4 px-6 shadow-lg shadow-neutral-900/20 active:opacity-85">
                <Text className="text-base font-bold text-white dark:text-neutral-900">
                  Continue as {user.name}
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={isDark ? '#1A1A2E' : '#FFFFFF'}
                />
              </Pressable>
            </Link>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        {/* Top Header: Distinct Dhansplit Brand Wordmark + Skip Pill */}
        <View className="flex-row items-center justify-between px-8 pt-3 pb-2">
          {/* App Brand Name in Samarkan Typography */}
          <View className="flex-row items-center">
            <Text className="font-samarkan text-3xl text-neutral-900 dark:text-white tracking-wide">
              dhan<Text className="text-violet-600 dark:text-violet-400">split</Text>
            </Text>
          </View>

          {/* Quick Skip Button */}
          <Pressable
            onPress={() => router.push('/(auth)/login')}
            className="px-3.5 py-1.5 rounded-full bg-neutral-900/5 dark:bg-white/10 active:opacity-60"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text className="text-xs font-bold text-neutral-600 dark:text-neutral-300">
              Skip
            </Text>
          </Pressable>
        </View>

        {/* Progress Bar & Slide Index */}
        <View className="flex-row items-center justify-between px-8 pt-1 pb-3">
          <View className="flex-row items-center gap-2">
            {SLIDES.map((slide, index) => {
              const isActive = activeIndex === index;
              return (
                <View
                  key={slide.id}
                  style={{
                    width: isActive ? 44 : 24,
                    height: 4,
                    borderRadius: 2,
                  }}
                  className={
                    isActive
                      ? 'bg-neutral-900 dark:bg-white'
                      : 'bg-violet-300/60 dark:bg-neutral-800'
                  }
                />
              );
            })}
          </View>
          <Text className="text-xs font-bold text-neutral-400 dark:text-neutral-500 tracking-wider">
            {String(activeIndex + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
          </Text>
        </View>

        {/* Horizontal Slides */}
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          scrollEventThrottle={16}
          decelerationRate="fast"
          snapToInterval={windowWidth}
          snapToAlignment="start"
          disableIntervalMomentum
          removeClippedSubviews={false}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={3}
          getItemLayout={getItemLayout}
          onScrollToIndexFailed={onScrollToIndexFailed}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          style={{ flex: 1 }}
        />

        {/* Bottom CTA Area */}
        <View className="px-8 pb-8 pt-2 gap-3">
          {isLastSlide ? (
            <>
              {/* Primary Get Started Button */}
              <Link href="/(auth)/signup" asChild>
                <Pressable className="flex-row items-center justify-center gap-2 rounded-full bg-neutral-900 dark:bg-white py-4 px-6 shadow-xl shadow-neutral-900/25 active:opacity-85">
                  <Text className="text-base font-bold text-white dark:text-neutral-900">
                    Get Started
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color={isDark ? '#1A1A2E' : '#FFFFFF'}
                  />
                </Pressable>
              </Link>

              {/* Secondary Pill Button */}
              <Link href="/(auth)/login" asChild>
                <Pressable className="items-center justify-center rounded-full border border-neutral-300/80 dark:border-neutral-700 bg-white/70 dark:bg-neutral-900/70 py-3.5 px-6 active:opacity-80">
                  <Text className="text-sm font-bold text-neutral-900 dark:text-white">
                    I already have an account
                  </Text>
                </Pressable>
              </Link>
            </>
          ) : (
            <>
              {/* Continue to Next Slide */}
              <Pressable
                onPress={handleNext}
                className="flex-row items-center justify-center gap-2 rounded-full bg-neutral-900 dark:bg-white py-4 px-6 shadow-xl shadow-neutral-900/25 active:opacity-85"
              >
                <Text className="text-base font-bold text-white dark:text-neutral-900">
                  Continue
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={isDark ? '#1A1A2E' : '#FFFFFF'}
                />
              </Pressable>

              {/* Quick Login Link */}
              <Link href="/(auth)/login" asChild>
                <Pressable className="items-center justify-center py-2 active:opacity-70">
                  <Text className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                    Already have an account?{' '}
                    <Text className="font-bold text-violet-600 dark:text-violet-400">
                      Log in
                    </Text>
                  </Text>
                </Pressable>
              </Link>
            </>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
