import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '@/lib/auth-store';
import { useAppTheme } from '@/hooks/use-theme';
import { Group, listGroups } from '@/api/groups';
import { Expense, listExpenses } from '@/api/expenses';
import {
  FriendItem as FriendItemType,
  PendingFriendRequest,
  acceptFriendRequest,
  listFriends,
  listPendingFriendRequests,
  rejectFriendRequest,
} from '@/api/friends';
import { getTotalBalance, getOverallBalances, UserBalance } from '@/api/balances';
import { Activity, getGlobalActivities } from '@/api/activities';

import { BalanceCard } from '@/components/balance-card';
import { SpendingCard } from '@/components/spending-card';
import { GradientBanner } from '@/components/gradient-banner';
import { ExpenseItem } from '@/components/expense-item';
import { GroupCard } from '@/components/group-card';
import { FriendItem } from '@/components/friend-item';
import { AddExpenseModal } from '@/components/modals/add-expense-modal';
import { SettleUpModal } from '@/components/modals/settle-up-modal';
import { CreateGroupModal } from '@/components/modals/create-group-modal';
import { AddFriendModal } from '@/components/modals/add-friend-modal';

type ActiveTab = 'overview' | 'groups' | 'friends' | 'activity';

export default function Dashboard() {
  const { user } = useAuth();
  const { isDark } = useAppTheme();
  const currentUserId = user?.id || 'current-user';

  // Navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Backend state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [netBalance, setNetBalance] = useState(0);
  const [totalOwedToYou, setTotalOwedToYou] = useState(0);
  const [totalYouOwe, setTotalYouOwe] = useState(0);
  const [balances, setBalances] = useState<UserBalance[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [friends, setFriends] = useState<FriendItemType[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingFriendRequest[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  // Modals state
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [settleModalOpen, setSettleModalOpen] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [friendModalOpen, setFriendModalOpen] = useState(false);

  // Selected payee for settle up
  const [settlePayee, setSettlePayee] = useState<any>(null);
  const [settleAmount, setSettleAmount] = useState<number | undefined>(undefined);

  // Load all dashboard data from backend
  const loadDashboardData = useCallback(async () => {
    try {
      const [
        totalRes,
        overallRes,
        groupsRes,
        friendsRes,
        pendingRes,
        expensesRes,
        activitiesRes,
      ] = await Promise.allSettled([
        getTotalBalance(),
        getOverallBalances(),
        listGroups(),
        listFriends(),
        listPendingFriendRequests(),
        listExpenses({ limit: 20 }),
        getGlobalActivities({ limit: 20 }),
      ]);

      if (totalRes.status === 'fulfilled' && totalRes.value) {
        setNetBalance(totalRes.value.total || 0);
      }

      if (overallRes.status === 'fulfilled' && Array.isArray(overallRes.value)) {
        setBalances(overallRes.value);
        let owed = 0;
        let owe = 0;
        overallRes.value.forEach((b) => {
          if (b.direction === 'OWED_TO_YOU') {
            owed += b.amount;
          } else {
            owe += Math.abs(b.amount);
          }
        });
        setTotalOwedToYou(owed);
        setTotalYouOwe(owe);
      }

      if (groupsRes.status === 'fulfilled' && Array.isArray(groupsRes.value)) {
        setGroups(groupsRes.value);
      }

      if (friendsRes.status === 'fulfilled' && Array.isArray(friendsRes.value)) {
        setFriends(friendsRes.value);
      }

      if (pendingRes.status === 'fulfilled' && Array.isArray(pendingRes.value)) {
        setPendingRequests(pendingRes.value);
      }

      if (expensesRes.status === 'fulfilled' && Array.isArray(expensesRes.value)) {
        setExpenses(expensesRes.value);
      }

      if (activitiesRes.status === 'fulfilled' && Array.isArray(activitiesRes.value)) {
        setActivities(activitiesRes.value);
      }
    } catch {
      // Keep existing data on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboardData();
  }, [loadDashboardData]);

  // Friend actions
  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      loadDashboardData();
    } catch {
      // Handle error
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectFriendRequest(requestId);
      loadDashboardData();
    } catch {
      // Handle error
    }
  };

  // Open settle modal with a specific friend pre-selected
  const handleOpenSettle = (friend?: any, amount?: number) => {
    setSettlePayee(friend || null);
    setSettleAmount(amount ? Math.abs(amount) : undefined);
    setSettleModalOpen(true);
  };

  const friendUsers = friends.map((f) => f.friend);

  // Helper to find balance with a friend
  const getBalanceForFriend = (friendId: string) => {
    const b = balances.find((bal) => bal.user.id === friendId);
    if (!b) return 0;
    return b.direction === 'OWED_TO_YOU' ? b.amount : -b.amount;
  };

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const screenGradient = isDark
    ? (['#18122B', '#110E1D', '#0C0A14', '#151024'] as const)
    : (['#EBE2FB', '#F4EEFD', '#FAF8FE', '#F6F3FA'] as const);

  return (
    <LinearGradient
      colors={screenGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        {/* Top Header matching Folio reference */}
        <View className="flex-row items-center justify-between px-6 py-4">
          {/* Left: Avatar + Greeting */}
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => router.push('/account')}
              accessibilityLabel="Account and Profile Settings"
              className="relative active:opacity-75"
            >
              <View className="h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-white/80 dark:border-white/10 shadow-sm bg-white dark:bg-neutral-800">
                {user?.photoUri || user?.avatarUrl ? (
                  <Image
                    source={{ uri: user.photoUri || user.avatarUrl || '' }}
                    className="h-full w-full"
                  />
                ) : (
                  <View className="h-full w-full items-center justify-center bg-violet-100 dark:bg-violet-900/40">
                    <Text className="text-sm font-bold text-violet-700 dark:text-violet-400">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </Text>
                  </View>
                )}
              </View>
            </Pressable>

            <View>
              <Text className="text-lg font-extrabold text-neutral-900 dark:text-white tracking-tight">
                {getGreeting()}
              </Text>
              <Text className="text-xs text-neutral-500 dark:text-neutral-400">
                Here's your overview
              </Text>
            </View>
          </View>

          {/* Right: Search & Notification Pill Buttons */}
          <View className="flex-row items-center gap-2">
            <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-white/90 dark:bg-neutral-800/90 border border-neutral-200/50 dark:border-neutral-700/50 shadow-sm active:bg-neutral-100">
              <Ionicons
                name="search-outline"
                size={18}
                color={isDark ? '#E5E7EB' : '#1A1A2E'}
              />
            </Pressable>

            <Pressable
              onPress={() => setActiveTab('friends')}
              className="h-10 w-10 items-center justify-center rounded-full bg-white/90 dark:bg-neutral-800/90 border border-neutral-200/50 dark:border-neutral-700/50 shadow-sm active:bg-neutral-100"
            >
              <Ionicons
                name="notifications-outline"
                size={18}
                color={isDark ? '#E5E7EB' : '#1A1A2E'}
              />
              {pendingRequests.length > 0 && (
                <View className="absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-full bg-rose-500 border border-white dark:border-neutral-800" />
              )}
            </Pressable>
          </View>
        </View>

        {/* Main Content Area */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator
              size="large"
              color={isDark ? '#A78BFA' : '#7C3AED'}
            />
            <Text className="text-xs text-neutral-500 mt-3 font-medium">
              Syncing your finances...
            </Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerClassName="px-6 py-2 pb-32"
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={isDark ? '#A78BFA' : '#7C3AED'}
                colors={[isDark ? '#A78BFA' : '#7C3AED']}
              />
            }
          >
            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <View className="gap-5">
                {/* 1. Total Balance Card */}
                <BalanceCard
                  netBalance={netBalance}
                  totalOwedToYou={totalOwedToYou}
                  totalYouOwe={totalYouOwe}
                  currency="₹"
                  onAddExpense={() => setExpenseModalOpen(true)}
                  onSettleUp={() => handleOpenSettle()}
                  onNewGroup={() => setGroupModalOpen(true)}
                  onAddFriend={() => setFriendModalOpen(true)}
                />

                {/* 2. Total Spending Card with Modern Gradient Mesh & Bar Chart */}
                <SpendingCard expenses={expenses} currency="₹" />

                {/* 3. Pastel Gradient Banner matching the reference card */}
                <GradientBanner
                  title="Smart Bill Splitting Active"
                  subtitle="Dhansplit automatically groups and reduces inter-friend transfer debts."
                />

                {/* 4. Pending Requests Notification if any */}
                {pendingRequests.length > 0 && (
                  <View className="rounded-3xl border border-amber-200 dark:border-amber-500/30 bg-amber-50/90 dark:bg-amber-500/10 p-4">
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center gap-2">
                        <View className="h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
                          <Ionicons name="notifications" size={16} color="#D97706" />
                        </View>
                        <Text className="text-sm font-bold text-amber-800 dark:text-amber-300">
                          {pendingRequests.length} Pending{' '}
                          {pendingRequests.length === 1 ? 'Request' : 'Requests'}
                        </Text>
                      </View>
                      <Pressable onPress={() => setActiveTab('friends')}>
                        <Text className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                          View all
                        </Text>
                      </Pressable>
                    </View>
                    <Text className="text-xs text-neutral-600 dark:text-neutral-300">
                      {pendingRequests[0]?.initiator?.name || 'Someone'} sent you a friend
                      request.
                    </Text>
                  </View>
                )}

                {/* 5. Latest Transactions matching the reference design */}
                <View className="gap-3 mt-1">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base font-extrabold text-neutral-900 dark:text-white tracking-tight">
                      Latest Transaction
                    </Text>
                    <Pressable
                      onPress={() => setExpenseModalOpen(true)}
                      className="h-8 w-8 items-center justify-center rounded-full bg-white/80 dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700/60 active:opacity-60"
                    >
                      <Ionicons
                        name="options-outline"
                        size={15}
                        color={isDark ? '#E5E7EB' : '#1A1A2E'}
                      />
                    </Pressable>
                  </View>

                  {expenses.length === 0 ? (
                    <View className="rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 p-6 items-center">
                      <Ionicons
                        name="receipt-outline"
                        size={32}
                        color={isDark ? '#4B5563' : '#9CA3AF'}
                      />
                      <Text className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 text-center">
                        No transactions recorded yet. Tap &apos;+ Add&apos; to split your
                        first bill!
                      </Text>
                    </View>
                  ) : (
                    <View className="gap-2.5">
                      {expenses.slice(0, 5).map((exp) => (
                        <ExpenseItem
                          key={exp.id}
                          expense={exp}
                          currentUserId={currentUserId}
                        />
                      ))}
                    </View>
                  )}
                </View>

                {/* 6. Active Groups */}
                <View className="gap-3 mt-1">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base font-extrabold text-neutral-900 dark:text-white tracking-tight">
                      Active Groups ({groups.length})
                    </Text>
                    <Pressable
                      onPress={() => setActiveTab('groups')}
                      className="active:opacity-60"
                    >
                      <Text className="text-xs font-bold text-violet-600 dark:text-violet-400">
                        See all
                      </Text>
                    </Pressable>
                  </View>

                  {groups.length === 0 ? (
                    <View className="rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 p-5 items-center">
                      <Ionicons
                        name="people-outline"
                        size={28}
                        color={isDark ? '#4B5563' : '#9CA3AF'}
                      />
                      <Text className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 text-center">
                        No groups created yet. Create a group for a trip, house, or
                        project!
                      </Text>
                      <Pressable
                        onPress={() => setGroupModalOpen(true)}
                        className="mt-3 rounded-full bg-neutral-900 dark:bg-white px-4 py-2"
                      >
                        <Text className="text-xs font-bold text-white dark:text-neutral-900">
                          + Create Group
                        </Text>
                      </Pressable>
                    </View>
                  ) : (
                    <View className="gap-2.5">
                      {groups.slice(0, 3).map((grp) => (
                        <GroupCard key={grp.id} group={grp} />
                      ))}
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* TAB: GROUPS */}
            {activeTab === 'groups' && (
              <View className="gap-4">
                <View className="flex-row items-center justify-between">
                  <Text className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
                    Your Groups
                  </Text>
                  <Pressable
                    onPress={() => setGroupModalOpen(true)}
                    className="flex-row items-center gap-1.5 rounded-full bg-neutral-900 dark:bg-white px-4 py-2.5 shadow-md active:opacity-80"
                  >
                    <Ionicons
                      name="add"
                      size={16}
                      color={isDark ? '#1A1A2E' : '#FFFFFF'}
                    />
                    <Text className="text-xs font-bold text-white dark:text-neutral-900">
                      New Group
                    </Text>
                  </Pressable>
                </View>

                {groups.length === 0 ? (
                  <View className="rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 p-8 items-center mt-4">
                    <Ionicons
                      name="people-outline"
                      size={40}
                      color={isDark ? '#4B5563' : '#9CA3AF'}
                    />
                    <Text className="text-base font-bold text-neutral-900 dark:text-white mt-3">
                      No groups yet
                    </Text>
                    <Text className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 text-center">
                      Groups make it effortless to split bills among flatmates, travel
                      buddies, or colleagues.
                    </Text>
                    <Pressable
                      onPress={() => setGroupModalOpen(true)}
                      className="mt-5 rounded-full bg-neutral-900 dark:bg-white px-5 py-3"
                    >
                      <Text className="text-xs font-bold text-white dark:text-neutral-900">
                        Create your first group
                      </Text>
                    </Pressable>
                  </View>
                ) : (
                  <View className="gap-3 mt-2">
                    {groups.map((grp) => (
                      <GroupCard key={grp.id} group={grp} />
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* TAB: FRIENDS */}
            {activeTab === 'friends' && (
              <View className="gap-4">
                <View className="flex-row items-center justify-between">
                  <Text className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
                    Friends
                  </Text>
                  <Pressable
                    onPress={() => setFriendModalOpen(true)}
                    className="flex-row items-center gap-1.5 rounded-full bg-neutral-900 dark:bg-white px-4 py-2.5 shadow-md active:opacity-80"
                  >
                    <Ionicons
                      name="person-add"
                      size={16}
                      color={isDark ? '#1A1A2E' : '#FFFFFF'}
                    />
                    <Text className="text-xs font-bold text-white dark:text-neutral-900">
                      Add Friend
                    </Text>
                  </Pressable>
                </View>

                {/* Pending requests */}
                {pendingRequests.length > 0 && (
                  <View className="gap-2.5">
                    <Text className="text-xs uppercase font-bold tracking-wider text-amber-700 dark:text-amber-400">
                      Pending Invitations ({pendingRequests.length})
                    </Text>
                    {pendingRequests.map((req) => (
                      <View
                        key={req.id}
                        className="flex-row items-center justify-between rounded-3xl border border-amber-200 dark:border-amber-500/30 bg-amber-50/90 dark:bg-amber-500/10 p-4"
                      >
                        <View className="flex-row items-center gap-3">
                          <View className="h-10 w-10 items-center justify-center rounded-full bg-amber-200 dark:bg-amber-900/40">
                            <Text className="text-sm font-bold text-amber-800 dark:text-amber-300">
                              {req.initiator?.name?.charAt(0).toUpperCase() || 'F'}
                            </Text>
                          </View>
                          <View>
                            <Text className="text-sm font-bold text-neutral-900 dark:text-white">
                              {req.initiator?.name || 'Someone'}
                            </Text>
                            <Text className="text-xs text-neutral-500 dark:text-neutral-400">
                              {req.initiator?.email}
                            </Text>
                          </View>
                        </View>
                        <View className="flex-row gap-2">
                          <Pressable
                            onPress={() => handleAcceptRequest(req.id)}
                            className="rounded-full bg-neutral-900 dark:bg-white px-3 py-1.5 active:opacity-80"
                          >
                            <Text className="text-xs font-bold text-white dark:text-neutral-900">
                              Accept
                            </Text>
                          </Pressable>
                          <Pressable
                            onPress={() => handleRejectRequest(req.id)}
                            className="rounded-full bg-neutral-200 dark:bg-neutral-800 px-3 py-1.5 active:opacity-80"
                          >
                            <Text className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                              Decline
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* Friends list */}
                {friends.length === 0 ? (
                  <View className="rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 p-8 items-center mt-4">
                    <Ionicons
                      name="person-outline"
                      size={40}
                      color={isDark ? '#4B5563' : '#9CA3AF'}
                    />
                    <Text className="text-base font-bold text-neutral-900 dark:text-white mt-3">
                      No friends added yet
                    </Text>
                    <Text className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 text-center">
                      Add your friends by email or phone to start sharing expenses and
                      settling debts effortlessly.
                    </Text>
                    <Pressable
                      onPress={() => setFriendModalOpen(true)}
                      className="mt-5 rounded-full bg-neutral-900 dark:bg-white px-5 py-3"
                    >
                      <Text className="text-xs font-bold text-white dark:text-neutral-900">
                        Add a friend
                      </Text>
                    </Pressable>
                  </View>
                ) : (
                  <View className="gap-2.5 mt-2">
                    {friends.map((item) => {
                      const bal = getBalanceForFriend(item.friend.id);
                      return (
                        <FriendItem
                          key={item.friend.id}
                          friend={item.friend}
                          balance={bal}
                          currency="₹"
                          onSettle={() => handleOpenSettle(item.friend, bal)}
                        />
                      );
                    })}
                  </View>
                )}
              </View>
            )}

            {/* TAB: ACTIVITY */}
            {activeTab === 'activity' && (
              <View className="gap-4">
                <Text className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
                  Recent Activity
                </Text>

                {activities.length === 0 ? (
                  <View className="rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 p-8 items-center mt-4">
                    <Ionicons
                      name="pulse-outline"
                      size={40}
                      color={isDark ? '#4B5563' : '#9CA3AF'}
                    />
                    <Text className="text-base font-bold text-neutral-900 dark:text-white mt-3">
                      No activity yet
                    </Text>
                    <Text className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 text-center">
                      New expenses, settlements, and edits will appear here
                      chronologically.
                    </Text>
                  </View>
                ) : (
                  <View className="gap-2.5 mt-2">
                    {activities.map((act) => {
                      const date = new Date(act.createdAt).toLocaleDateString(
                        'en-IN',
                        {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      );

                      return (
                        <View
                          key={act.id}
                          className="flex-row items-center gap-3.5 rounded-3xl border border-neutral-100/90 dark:border-neutral-800 bg-white/90 dark:bg-[#151322] p-4 shadow-sm"
                        >
                          <View className="h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-900/30">
                            <Ionicons
                              name="flash-outline"
                              size={18}
                              color={isDark ? '#A78BFA' : '#7C3AED'}
                            />
                          </View>
                          <View className="flex-1">
                            <Text className="text-sm text-neutral-700 dark:text-neutral-200">
                              <Text className="font-bold text-neutral-900 dark:text-white">
                                {act.user?.name || 'Someone'}{' '}
                              </Text>
                              {act.action || act.type}
                            </Text>
                            {act.expense && (
                              <Text className="text-xs text-violet-600 dark:text-violet-400 font-semibold mt-0.5">
                                {act.expense.description} • ₹{act.expense.amount}
                              </Text>
                            )}
                            <Text className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">
                              {date}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        )}

        {/* Floating Bottom Navigation Bar matching the Folio reference design */}
        <View className="absolute bottom-5 left-6 right-6 flex-row items-center justify-around rounded-[32px] bg-white/95 dark:bg-[#151322]/95 py-2 px-3 border border-neutral-200/60 dark:border-white/10 shadow-2xl shadow-neutral-900/15 backdrop-blur-xl">
          {/* Home */}
          <Pressable
            onPress={() => setActiveTab('overview')}
            className="items-center py-1 px-3 active:opacity-60"
          >
            <Ionicons
              name={activeTab === 'overview' ? 'home' : 'home-outline'}
              size={22}
              color={
                activeTab === 'overview'
                  ? isDark
                    ? '#FFFFFF'
                    : '#1A1A2E'
                  : isDark
                  ? '#6B7280'
                  : '#9CA3AF'
              }
            />
            <Text
              className={`text-[10px] font-bold mt-0.5 ${
                activeTab === 'overview'
                  ? 'text-neutral-900 dark:text-white'
                  : 'text-neutral-400 dark:text-neutral-500'
              }`}
            >
              Home
            </Text>
          </Pressable>

          {/* Activity */}
          <Pressable
            onPress={() => setActiveTab('activity')}
            className="items-center py-1 px-3 active:opacity-60"
          >
            <Ionicons
              name={activeTab === 'activity' ? 'pulse' : 'pulse-outline'}
              size={22}
              color={
                activeTab === 'activity'
                  ? isDark
                    ? '#FFFFFF'
                    : '#1A1A2E'
                  : isDark
                  ? '#6B7280'
                  : '#9CA3AF'
              }
            />
            <Text
              className={`text-[10px] font-bold mt-0.5 ${
                activeTab === 'activity'
                  ? 'text-neutral-900 dark:text-white'
                  : 'text-neutral-400 dark:text-neutral-500'
              }`}
            >
              Activity
            </Text>
          </Pressable>

          {/* Center Floating Dark Action Button (FAB) matching the Folio screenshot */}
          <Pressable
            onPress={() => setExpenseModalOpen(true)}
            className="h-12 w-12 items-center justify-center rounded-full bg-neutral-900 dark:bg-white shadow-xl shadow-neutral-900/30 active:scale-95 transition-transform"
          >
            <Ionicons
              name="add"
              size={26}
              color={isDark ? '#1A1A2E' : '#FFFFFF'}
            />
          </Pressable>

          {/* Groups */}
          <Pressable
            onPress={() => setActiveTab('groups')}
            className="items-center py-1 px-3 active:opacity-60"
          >
            <Ionicons
              name={activeTab === 'groups' ? 'people' : 'people-outline'}
              size={22}
              color={
                activeTab === 'groups'
                  ? isDark
                    ? '#FFFFFF'
                    : '#1A1A2E'
                  : isDark
                  ? '#6B7280'
                  : '#9CA3AF'
              }
            />
            <Text
              className={`text-[10px] font-bold mt-0.5 ${
                activeTab === 'groups'
                  ? 'text-neutral-900 dark:text-white'
                  : 'text-neutral-400 dark:text-neutral-500'
              }`}
            >
              Groups
            </Text>
          </Pressable>

          {/* Friends / Profile */}
          <Pressable
            onPress={() => setActiveTab('friends')}
            className="items-center py-1 px-3 active:opacity-60"
          >
            <View className="relative">
              <Ionicons
                name={activeTab === 'friends' ? 'person' : 'person-outline'}
                size={22}
                color={
                  activeTab === 'friends'
                    ? isDark
                    ? '#FFFFFF'
                    : '#1A1A2E'
                    : isDark
                    ? '#6B7280'
                    : '#9CA3AF'
                }
              />
              {pendingRequests.length > 0 && (
                <View className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-rose-500 border border-white dark:border-[#151322]" />
              )}
            </View>
            <Text
              className={`text-[10px] font-bold mt-0.5 ${
                activeTab === 'friends'
                  ? 'text-neutral-900 dark:text-white'
                  : 'text-neutral-400 dark:text-neutral-500'
              }`}
            >
              Friends
            </Text>
          </Pressable>
        </View>

        {/* Interactive Modals */}
        <AddExpenseModal
          visible={expenseModalOpen}
          onClose={() => setExpenseModalOpen(false)}
          onSuccess={loadDashboardData}
          groups={groups}
          friends={friendUsers}
          currentUserId={currentUserId}
        />

        <SettleUpModal
          visible={settleModalOpen}
          onClose={() => setSettleModalOpen(false)}
          onSuccess={loadDashboardData}
          friends={friendUsers}
          defaultPayee={settlePayee}
          defaultAmount={settleAmount}
        />

        <CreateGroupModal
          visible={groupModalOpen}
          onClose={() => setGroupModalOpen(false)}
          onSuccess={loadDashboardData}
          friends={friendUsers}
        />

        <AddFriendModal
          visible={friendModalOpen}
          onClose={() => setFriendModalOpen(false)}
          onSuccess={loadDashboardData}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}
