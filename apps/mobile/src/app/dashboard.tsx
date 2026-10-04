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

import { useAuth } from '@/lib/auth-store';
import { logout as apiLogout } from '@/api/auth';
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
import { ENV } from '@/constants/env';

import { BalanceCard } from '@/components/balance-card';
import { ExpenseItem } from '@/components/expense-item';
import { GroupCard } from '@/components/group-card';
import { FriendItem } from '@/components/friend-item';
import { AddExpenseModal } from '@/components/modals/add-expense-modal';
import { SettleUpModal } from '@/components/modals/settle-up-modal';
import { CreateGroupModal } from '@/components/modals/create-group-modal';
import { AddFriendModal } from '@/components/modals/add-friend-modal';
import { EditProfileModal } from '@/components/modals/edit-profile-modal';

type ActiveTab = 'overview' | 'groups' | 'friends' | 'activity' | 'account';

export default function Dashboard() {
  const { user } = useAuth();
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
  const [editProfileOpen, setEditProfileOpen] = useState(false);

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

      if (expensesRes.status === 'fulfilled' && expensesRes.value?.expenses) {
        setExpenses(expensesRes.value.expenses);
      }

      if (activitiesRes.status === 'fulfilled' && activitiesRes.value?.activities) {
        setActivities(activitiesRes.value.activities);
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch {
      // Ignored
    }
    router.replace('/');
  };

  const handleAcceptFriend = async (id: string) => {
    try {
      await acceptFriendRequest(id);
      loadDashboardData();
    } catch {
      // Error handling
    }
  };

  const handleRejectFriend = async (id: string) => {
    try {
      await rejectFriendRequest(id);
      loadDashboardData();
    } catch {
      // Error handling
    }
  };

  const handleOpenSettle = (payee?: any, amount?: number) => {
    setSettlePayee(payee || null);
    setSettleAmount(amount);
    setSettleModalOpen(true);
  };

  const friendUsers = friends.map((f) => f.friend);

  // Helper to find balance with a friend
  const getBalanceForFriend = (friendId: string) => {
    const b = balances.find((bal) => bal.user.id === friendId);
    if (!b) return 0;
    return b.direction === 'OWED_TO_YOU' ? b.amount : -b.amount;
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-950">
      {/* Top Header */}
      <View className="flex-row items-center justify-between border-b border-neutral-800/80 px-6 py-4">
        <View>
          <Text className="font-samarkan text-3xl text-white">
            dhan<Text className="text-emerald-400">split</Text>
          </Text>
          <Text className="text-[10px] uppercase tracking-widest text-neutral-500">
            Smart Expense Splitting
          </Text>
        </View>

        <Pressable
          onPress={() => setEditProfileOpen(true)}
          className="flex-row items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/80 p-1.5 pr-3 active:bg-neutral-800"
        >
          {user?.photoUri || user?.avatarUrl ? (
            <Image
              source={{ uri: user.photoUri || user.avatarUrl || '' }}
              className="h-8 w-8 rounded-full border border-emerald-400"
            />
          ) : (
            <View className="h-8 w-8 items-center justify-center rounded-full bg-emerald-400/20">
              <Text className="text-xs font-bold text-emerald-400">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
          )}
          <Text className="text-xs font-medium text-neutral-300" numberOfLines={1}>
            {user?.name?.split(' ')[0] || 'Account'}
          </Text>
        </Pressable>
      </View>

      {/* Main Content Scroll View */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#34d399" />
          <Text className="text-xs text-neutral-500 mt-3 font-medium">Syncing with server...</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 py-5 pb-24"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#34d399"
              colors={['#34d399']}
            />
          }
        >
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <View className="gap-6">
              {/* Balance Card */}
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

              {/* Pending Requests Alert */}
              {pendingRequests.length > 0 && (
                <View className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center gap-2">
                      <Ionicons name="notifications" size={18} color="#fbbf24" />
                      <Text className="text-sm font-bold text-amber-300">
                        {pendingRequests.length} Pending Friend {pendingRequests.length === 1 ? 'Request' : 'Requests'}
                      </Text>
                    </View>
                    <Pressable onPress={() => setActiveTab('friends')}>
                      <Text className="text-xs font-semibold text-amber-400">View all</Text>
                    </Pressable>
                  </View>
                  <Text className="text-xs text-neutral-300">
                    {pendingRequests[0]?.initiator?.name || 'Someone'} sent you a friend request.
                  </Text>
                </View>
              )}

              {/* Recent Groups */}
              <View className="gap-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs uppercase font-bold tracking-wider text-neutral-400">
                    Active Groups ({groups.length})
                  </Text>
                  <Pressable onPress={() => setActiveTab('groups')} className="active:opacity-60">
                    <Text className="text-xs font-semibold text-emerald-400">See all</Text>
                  </Pressable>
                </View>

                {groups.length === 0 ? (
                  <View className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/30 p-5 items-center">
                    <Ionicons name="people-outline" size={28} color="#525252" />
                    <Text className="text-xs text-neutral-400 mt-2 text-center">
                      No groups created yet. Create a group for a trip, house, or project!
                    </Text>
                    <Pressable
                      onPress={() => setGroupModalOpen(true)}
                      className="mt-3 rounded-xl bg-neutral-800 px-3.5 py-1.5"
                    >
                      <Text className="text-xs font-semibold text-emerald-400">+ Create Group</Text>
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

              {/* Recent Expenses */}
              <View className="gap-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs uppercase font-bold tracking-wider text-neutral-400">
                    Recent Expenses ({expenses.length})
                  </Text>
                  <Pressable onPress={() => setExpenseModalOpen(true)} className="active:opacity-60">
                    <Text className="text-xs font-semibold text-emerald-400">+ Add</Text>
                  </Pressable>
                </View>

                {expenses.length === 0 ? (
                  <View className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/30 p-5 items-center">
                    <Ionicons name="receipt-outline" size={28} color="#525252" />
                    <Text className="text-xs text-neutral-400 mt-2 text-center">
                      No expenses recorded yet. Tap &apos;+ Add&apos; to split your first bill!
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
            </View>
          )}

          {/* TAB: GROUPS */}
          {activeTab === 'groups' && (
            <View className="gap-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-xl font-bold text-white">Your Groups</Text>
                <Pressable
                  onPress={() => setGroupModalOpen(true)}
                  className="flex-row items-center gap-1.5 rounded-xl bg-emerald-400 px-3.5 py-2 active:bg-emerald-300"
                >
                  <Ionicons name="add" size={16} color="#0a0a0a" />
                  <Text className="text-xs font-bold text-neutral-950">New Group</Text>
                </Pressable>
              </View>

              {groups.length === 0 ? (
                <View className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/40 p-8 items-center mt-4">
                  <Ionicons name="people-outline" size={40} color="#525252" />
                  <Text className="text-base font-semibold text-white mt-3">No groups yet</Text>
                  <Text className="text-xs text-neutral-400 mt-1 text-center">
                    Groups make it effortless to split bills among flatmates, travel buddies, or colleagues.
                  </Text>
                  <Pressable
                    onPress={() => setGroupModalOpen(true)}
                    className="mt-5 rounded-xl bg-emerald-400 px-4 py-2.5"
                  >
                    <Text className="text-xs font-bold text-neutral-950">Create your first group</Text>
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
                <Text className="text-xl font-bold text-white">Friends</Text>
                <Pressable
                  onPress={() => setFriendModalOpen(true)}
                  className="flex-row items-center gap-1.5 rounded-xl bg-emerald-400 px-3.5 py-2 active:bg-emerald-300"
                >
                  <Ionicons name="person-add" size={16} color="#0a0a0a" />
                  <Text className="text-xs font-bold text-neutral-950">Add Friend</Text>
                </Pressable>
              </View>

              {/* Pending Requests List */}
              {pendingRequests.length > 0 && (
                <View className="mt-2 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 gap-3">
                  <Text className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Friend Requests ({pendingRequests.length})
                  </Text>
                  {pendingRequests.map((req) => (
                    <View
                      key={req.id}
                      className="flex-row items-center justify-between py-2 border-b border-neutral-800/60 last:border-b-0"
                    >
                      <View className="flex-1 pr-2">
                        <Text className="text-sm font-semibold text-white">
                          {req.initiator.name}
                        </Text>
                        <Text className="text-xs text-neutral-400">
                          {req.initiator.email}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <Pressable
                          onPress={() => handleAcceptFriend(req.id)}
                          className="rounded-xl bg-emerald-400 px-3 py-1.5 active:bg-emerald-300"
                        >
                          <Text className="text-xs font-semibold text-neutral-950">Accept</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => handleRejectFriend(req.id)}
                          className="rounded-xl border border-neutral-700 bg-neutral-800 px-2.5 py-1.5 active:bg-neutral-700"
                        >
                          <Ionicons name="close" size={14} color="#a3a3a3" />
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Friends List */}
              {friends.length === 0 ? (
                <View className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/40 p-8 items-center mt-4">
                  <Ionicons name="person-outline" size={40} color="#525252" />
                  <Text className="text-base font-semibold text-white mt-3">No friends added</Text>
                  <Text className="text-xs text-neutral-400 mt-1 text-center">
                    Add friends using their email address to share bills and keep track of who owes whom.
                  </Text>
                  <Pressable
                    onPress={() => setFriendModalOpen(true)}
                    className="mt-5 rounded-xl bg-emerald-400 px-4 py-2.5"
                  >
                    <Text className="text-xs font-bold text-neutral-950">Add a friend</Text>
                  </Pressable>
                </View>
              ) : (
                <View className="gap-2.5 mt-2">
                  {friends.map((item) => (
                    <FriendItem
                      key={item.friendshipId}
                      friend={item.friend}
                      balance={getBalanceForFriend(item.friend.id)}
                      currency="₹"
                      onSettle={(f, amt) => handleOpenSettle(f, amt)}
                    />
                  ))}
                </View>
              )}
            </View>
          )}

          {/* TAB: ACTIVITY */}
          {activeTab === 'activity' && (
            <View className="gap-4">
              <Text className="text-xl font-bold text-white">Recent Activity</Text>

              {activities.length === 0 ? (
                <View className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/40 p-8 items-center mt-4">
                  <Ionicons name="pulse-outline" size={40} color="#525252" />
                  <Text className="text-base font-semibold text-white mt-3">No activity yet</Text>
                  <Text className="text-xs text-neutral-400 mt-1 text-center">
                    New expenses, settlements, and edits will appear here chronologically.
                  </Text>
                </View>
              ) : (
                <View className="gap-3 mt-2">
                  {activities.map((act) => {
                    const date = new Date(act.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <View
                        key={act.id}
                        className="flex-row items-center gap-3.5 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4"
                      >
                        <View className="h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10">
                          <Ionicons name="flash-outline" size={18} color="#34d399" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-sm text-neutral-200">
                            <Text className="font-bold text-white">{act.user?.name || 'Someone'} </Text>
                            {act.action || act.type}
                          </Text>
                          {act.expense && (
                            <Text className="text-xs text-emerald-400 font-semibold mt-0.5">
                              {act.expense.description} • ₹{act.expense.amount}
                            </Text>
                          )}
                          <Text className="text-[11px] text-neutral-500 mt-1">{date}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          {/* TAB: ACCOUNT */}
          {activeTab === 'account' && (
            <View className="gap-6">
              <Text className="text-xl font-bold text-white">Your Account</Text>

              {/* Profile Card */}
              <View className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 items-center">
                <View className="relative">
                  {user?.photoUri || user?.avatarUrl ? (
                    <Image
                      source={{ uri: user.photoUri || user.avatarUrl || '' }}
                      className="h-24 w-24 rounded-full border-2 border-emerald-400"
                    />
                  ) : (
                    <View className="h-24 w-24 items-center justify-center rounded-full border-2 border-emerald-400/40 bg-neutral-800">
                      <Text className="text-3xl font-bold text-emerald-400">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </Text>
                    </View>
                  )}
                  <View className="absolute bottom-0 right-0 h-6 w-6 items-center justify-center rounded-full bg-emerald-400 border-2 border-neutral-950">
                    <Ionicons name="checkmark" size={14} color="#0a0a0a" />
                  </View>
                </View>

                <Text className="mt-4 text-2xl font-bold text-white text-center">
                  {user?.name || 'User'}
                </Text>
                <Text className="text-sm text-neutral-400 text-center mt-0.5">
                  {user?.email || 'user@dhansplit.com'}
                </Text>

                <View className="mt-4 flex-row items-center gap-2">
                  <View className="rounded-full bg-neutral-800 px-3 py-1 border border-neutral-700">
                    <Text className="text-xs font-medium text-neutral-300">
                      Currency: {user?.defaultCurrency || 'INR'}
                    </Text>
                  </View>
                  {user?.isPro ? (
                    <View className="rounded-full bg-amber-400/10 px-3 py-1 border border-amber-400/30">
                      <Text className="text-xs font-semibold text-amber-400">PRO MEMBER</Text>
                    </View>
                  ) : null}
                </View>

                <Pressable
                  onPress={() => setEditProfileOpen(true)}
                  className="mt-5 rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2 active:bg-neutral-700"
                >
                  <Text className="text-xs font-semibold text-emerald-400">Edit Profile</Text>
                </Pressable>
              </View>

              {/* Details & API info */}
              <View className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 gap-3">
                <Text className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Connection Details
                </Text>

                <View className="flex-row items-center justify-between py-1.5 border-b border-neutral-800/50">
                  <Text className="text-sm text-neutral-400">Server API</Text>
                  <Text className="text-xs font-mono text-emerald-400">{ENV.API_URL}</Text>
                </View>

                <View className="flex-row items-center justify-between py-1.5 border-b border-neutral-800/50">
                  <Text className="text-sm text-neutral-400">Status</Text>
                  <View className="flex-row items-center gap-1.5">
                    <View className="h-2 w-2 rounded-full bg-emerald-400" />
                    <Text className="text-xs font-medium text-emerald-400">Connected</Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between py-1.5">
                  <Text className="text-sm text-neutral-400">User ID</Text>
                  <Text className="text-xs font-mono text-neutral-400">{user?.id}</Text>
                </View>
              </View>

              {/* Log out */}
              <Pressable
                onPress={handleLogout}
                className="flex-row items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 py-4 active:bg-red-500/20"
              >
                <Ionicons name="log-out-outline" size={18} color="#f87171" />
                <Text className="text-base font-semibold text-red-400">Log out</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      )}

      {/* Bottom Segment / Tab Navigation Bar */}
      <View className="absolute bottom-0 left-0 right-0 flex-row items-center justify-around border-t border-neutral-800 bg-neutral-950/95 py-2 px-4 backdrop-blur-md">
        <Pressable
          onPress={() => setActiveTab('overview')}
          className="items-center py-1 px-3 active:opacity-60"
        >
          <Ionicons
            name={activeTab === 'overview' ? 'pie-chart' : 'pie-chart-outline'}
            size={22}
            color={activeTab === 'overview' ? '#34d399' : '#737373'}
          />
          <Text
            className={`text-[10px] font-semibold mt-1 ${
              activeTab === 'overview' ? 'text-emerald-400' : 'text-neutral-500'
            }`}
          >
            Overview
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('groups')}
          className="items-center py-1 px-3 active:opacity-60"
        >
          <Ionicons
            name={activeTab === 'groups' ? 'people' : 'people-outline'}
            size={22}
            color={activeTab === 'groups' ? '#34d399' : '#737373'}
          />
          <Text
            className={`text-[10px] font-semibold mt-1 ${
              activeTab === 'groups' ? 'text-emerald-400' : 'text-neutral-500'
            }`}
          >
            Groups
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('friends')}
          className="items-center py-1 px-3 active:opacity-60"
        >
          <View className="relative">
            <Ionicons
              name={activeTab === 'friends' ? 'person' : 'person-outline'}
              size={22}
              color={activeTab === 'friends' ? '#34d399' : '#737373'}
            />
            {pendingRequests.length > 0 && (
              <View className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-400" />
            )}
          </View>
          <Text
            className={`text-[10px] font-semibold mt-1 ${
              activeTab === 'friends' ? 'text-emerald-400' : 'text-neutral-500'
            }`}
          >
            Friends
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('activity')}
          className="items-center py-1 px-3 active:opacity-60"
        >
          <Ionicons
            name={activeTab === 'activity' ? 'pulse' : 'pulse-outline'}
            size={22}
            color={activeTab === 'activity' ? '#34d399' : '#737373'}
          />
          <Text
            className={`text-[10px] font-semibold mt-1 ${
              activeTab === 'activity' ? 'text-emerald-400' : 'text-neutral-500'
            }`}
          >
            Activity
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('account')}
          className="items-center py-1 px-3 active:opacity-60"
        >
          <Ionicons
            name={activeTab === 'account' ? 'settings' : 'settings-outline'}
            size={22}
            color={activeTab === 'account' ? '#34d399' : '#737373'}
          />
          <Text
            className={`text-[10px] font-semibold mt-1 ${
              activeTab === 'account' ? 'text-emerald-400' : 'text-neutral-500'
            }`}
          >
            Account
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

      {user && (
        <EditProfileModal
          visible={editProfileOpen}
          onClose={() => setEditProfileOpen(false)}
          onSuccess={loadDashboardData}
          currentUser={user}
        />
      )}
    </SafeAreaView>
  );
}
