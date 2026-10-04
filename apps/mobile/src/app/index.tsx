import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  Text,
  View,
  ViewToken,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '@/lib/auth-store';
import { useAppTheme } from '@/hooks/use-theme';
import { ThreeDCoin } from '@/components/ui/three-d-coin';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallScreen = SCREEN_HEIGHT < 750;

interface OnboardingSlide {
  id: string;
  pageLabel: string;
  tagline: string;
  title: string;
  subtitle: string;
  coinSymbol?: string;
  coinIcon?: keyof typeof Ionicons.glyphMap;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    pageLabel: '01',
    tagline: '// Welcome to Dhansplit',
    title: 'Money, Made\nSimple',
    subtitle:
      'Track your spending, manage your money, and stay in control of your finances',
    coinSymbol: 'D',
  },
  {
    id: '2',
    pageLabel: '02',
    tagline: '// Effortless Splitting',
    title: 'Split Bills,\nNot Friendships',
    subtitle:
      'Create groups for trips, flats, or dining out. Add expenses and let Dhansplit do the math',
    coinIcon: 'people',
  },
  {
    id: '3',
    pageLabel: '03',
    tagline: '// Instant Settlements',
    title: 'Settle Up,\nIn One Tap',
    subtitle:
      'See who owes whom at a glance. Settle balances with a single tap and keep everyone happy',
    coinIcon: 'checkmark-done',
  },
];

function SlideItem({
  item,
}: {
  item: OnboardingSlide;
}) {
  const coinSize = isSmallScreen ? 150 : 185;

  return (
    <View
      style={{ width: SCREEN_WIDTH }}
      className="flex-1 px-8 justify-between py-2"
    >
      {/* Top Typography Section */}
      <View className="mt-1">
        {/* Monospace/Subtle Tagline */}
        <Text className="text-xs font-semibold tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
          {item.tagline}
        </Text>

        {/* Big Bold Modern Headline matching the reference image */}
        <Text className="text-[38px] font-black leading-[44px] text-neutral-900 dark:text-white tracking-tight">
          {item.title}
        </Text>

        {/* Subtitle */}
        <Text className="mt-3 text-sm leading-5 text-neutral-500 dark:text-neutral-400 max-w-[310px]">
          {item.subtitle}
        </Text>
      </View>

      {/* Center 3D Coin Visual with Ambient Gradient Glow */}
      <View className="items-center justify-center my-auto py-2">
        <ThreeDCoin
          size={coinSize}
          symbol={item.coinSymbol}
          iconName={item.coinIcon}
        />
      </View>
    </View>
  );
}

export default function Index() {
  const { isAuthenticated, user, hasHydrated } = useAuth();
  const { isDark } = useAppTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (hasHydrated && isAuthenticated && user) {
      router.replace('/dashboard');
    }
  }, [hasHydrated, isAuthenticated, user]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const isLastSlide = activeIndex === SLIDES.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      router.push('/(auth)/signup');
      return;
    }
    flatListRef.current?.scrollToIndex({
      index: activeIndex + 1,
      animated: true,
    });
  };

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
              <ThreeDCoin size={160} symbol="D" />
            </View>
            <Text className="font-samarkan text-6xl text-neutral-900 dark:text-white">
              dhan<Text className="text-violet-600 dark:text-violet-400">split</Text>
            </Text>
            <Text className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              Welcome back to your financial sanctuary
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
        {/* Top Bar: 01 / + 3 segmented indicator bars + Skip matching Folio */}
        <View className="flex-row items-center justify-between px-8 pt-3 pb-2">
          {/* Left: 01 / indicator */}
          <View className="flex-row items-center gap-2.5">
            <Text className="text-sm font-extrabold text-neutral-900 dark:text-white tracking-tight">
              {String(activeIndex + 1).padStart(2, '0')} /
            </Text>

            {/* 3 Progress Bars side-by-side matching the Folio reference */}
            <View className="flex-row items-center gap-1.5">
              {SLIDES.map((slide, index) => {
                const isActive = activeIndex === index;
                return (
                  <View
                    key={slide.id}
                    style={{
                      width: isActive ? 44 : 32,
                      height: 4,
                      borderRadius: 2,
                    }}
                    className={
                      isActive
                        ? 'bg-neutral-900 dark:bg-white'
                        : 'bg-violet-200/80 dark:bg-neutral-800'
                    }
                  />
                );
              })}
            </View>
          </View>

          {/* Right: Skip */}
          <Pressable
            onPress={() => router.push('/(auth)/login')}
            className="py-1 px-2 active:opacity-60"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
              Skip
            </Text>
          </Pressable>
        </View>

        {/* Horizontal Slides */}
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <SlideItem item={item} />}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
        />

        {/* Bottom CTA Area */}
        <View className="px-8 pb-8 pt-2 gap-3">
          {isLastSlide ? (
            <>
              {/* Primary Get Started Pill Button */}
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
            <Pressable
              onPress={handleNext}
              className="flex-row items-center justify-center gap-2 rounded-full bg-neutral-900 dark:bg-white py-4 px-6 shadow-xl shadow-neutral-900/25 active:opacity-85"
            >
              <Text className="text-base font-bold text-white dark:text-neutral-900">
                Get Started
              </Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color={isDark ? '#1A1A2E' : '#FFFFFF'}
              />
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
