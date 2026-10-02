import { Pressable, Text, View } from 'react-native';
import { Link, router, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export function BackButton() {
  return (
    <Pressable
      className="mb-6 h-10 w-10 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900 active:bg-neutral-800"
      onPress={() => router.replace('/')}
    >
      <Ionicons name="chevron-back" size={20} color="#a3a3a3" />
    </Pressable>
  );
}

export function AuthHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View>
      <Text className="text-3xl font-bold text-white">{title}</Text>
      <Text className="mt-2 text-sm text-neutral-500">{subtitle}</Text>
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
      ? 'border-red-500/40 bg-red-500/10'
      : 'border-emerald-400/40 bg-emerald-400/10';
  const textColor = tone === 'error' ? 'text-red-400' : 'text-emerald-300';

  return (
    <View className={`rounded-xl border px-4 py-3 ${styles}`}>
      <Text className={`text-sm ${textColor}`}>{message}</Text>
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
      <Text className="text-sm text-neutral-500">{question}</Text>
      <Link href={href} asChild>
        <Pressable className="active:opacity-60">
          <Text className="text-sm font-semibold text-emerald-400">{linkText}</Text>
        </Pressable>
      </Link>
    </View>
  );
}
