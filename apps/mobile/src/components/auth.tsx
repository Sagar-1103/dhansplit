import { Pressable, Text, View } from 'react-native';
import { Link, router, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';

export function BackButton() {
  const { isDark } = useAppTheme();
  return (
    <Pressable
      className="mb-6 h-10 w-10 items-center justify-center rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 active:bg-neutral-100 dark:active:bg-neutral-700"
      onPress={() => router.replace('/')}
    >
      <Ionicons name="chevron-back" size={20} color={isDark ? '#E5E7EB' : '#1A1A2E'} />
    </Pressable>
  );
}

export function AuthHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View>
      <Text className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
        {title}
      </Text>
      <Text className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
        {subtitle}
      </Text>
    </View>
  );
}

interface BannerProps {
  tone: 'error' | 'success';
  message: string;
}

export function Banner({ tone, message }: BannerProps) {
  const styles =
    tone === 'error'
      ? 'border-red-400/40 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10'
      : 'border-emerald-400/40 bg-emerald-50 dark:border-emerald-400/30 dark:bg-emerald-400/10';
  const textColor =
    tone === 'error'
      ? 'text-red-600 dark:text-red-400'
      : 'text-emerald-700 dark:text-emerald-300';

  return (
    <View className={`rounded-2xl border px-4 py-3.5 ${styles}`}>
      <Text className={`text-sm font-medium ${textColor}`}>{message}</Text>
    </View>
  );
}

export function AuthFooter({
  question,
  linkText,
  href,
}: {
  question: string;
  linkText: string;
  href: Href;
}) {
  return (
    <View className="flex-row items-center justify-center gap-1.5">
      <Text className="text-sm text-neutral-500 dark:text-neutral-400">{question}</Text>
      <Link href={href} asChild>
        <Pressable className="active:opacity-60">
          <Text className="text-sm font-bold text-violet-600 dark:text-violet-400">
            {linkText}
          </Text>
        </Pressable>
      </Link>
    </View>
  );
}
