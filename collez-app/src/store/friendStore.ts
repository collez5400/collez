import { create } from 'zustand';
import { supabase } from '../config/supabase';
import type { FriendRequest, FriendshipStatus } from '../models/friend';
import type { User } from '../models/user';
import { useAuthStore } from './authStore';

export type FriendListUser = Pick<
  User,
  'id' | 'full_name' | 'username' | 'avatar_url' | 'xp' | 'streak_count' | 'is_coordinator'
> & { college_name: string | null };

type PendingRequestWithSender = FriendRequest & { sender: FriendListUser | null };
type FriendRequestRow = Pick<
  FriendRequest,
  'id' | 'sender_id' | 'receiver_id' | 'status' | 'created_at' | 'updated_at'
>;

interface FriendStoreState {
  friends: FriendListUser[];
  pendingIncoming: PendingRequestWithSender[];
  pendingOutgoingByUserId: Record<string, FriendRequest>;
  relationshipByUserId: Record<string, FriendshipStatus>;
  isLoading: boolean;
  error: string | null;

  hydrate: () => Promise<void>;
  searchUsersByUsernamePrefix: (prefix: string, limit?: number) => Promise<FriendListUser[]>;
  fetchFriends: () => Promise<void>;
  fetchPendingIncoming: () => Promise<void>;
  fetchRelationship: (otherUserId: string) => Promise<FriendshipStatus>;
  sendFriendRequest: (receiverId: string) => Promise<boolean>;
  acceptFriendRequest: (requestId: string) => Promise<boolean>;
  rejectFriendRequest: (requestId: string) => Promise<boolean>;
  removeFriend: (friendId: string) => Promise<boolean>;
  clearError: () => void;
}

function getAuthUserId() {
  return useAuthStore.getState().user?.id ?? null;
}

function uniqueById<T extends { id: string }>(items: T[]) {
  const map = new Map<string, T>();
  for (const item of items) map.set(item.id, item);
  return Array.from(map.values());
}

function normalizePendingByUser(
  incoming: FriendRequest[],
  me: string
): Record<string, FriendRequest> {
  const out: Record<string, FriendRequest> = {};
  for (const req of incoming) {
    const otherUserId = req.sender_id === me ? req.receiver_id : req.sender_id;
    out[otherUserId] = req;
  }
  return out;
}

export const useFriendStore = create<FriendStoreState>((set, get) => ({
  friends: [],
  pendingIncoming: [],
  pendingOutgoingByUserId: {},
  relationshipByUserId: {},
  isLoading: false,
  error: null,

  hydrate: async () => {
    await Promise.all([get().fetchPendingIncoming(), get().fetchFriends()]);
  },

  searchUsersByUsernamePrefix: async (prefix, limit = 20) => {
    const me = getAuthUserId();
    const clean = prefix.trim();
    if (!clean) return [];

    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, username, avatar_url, xp, streak_count, is_coordinator, colleges(name)')
      .ilike('username', `${clean}%`)
      .limit(limit);

    if (error) {
      set({ error: error.message });
      return [];
    }

    const rows = (data ?? []) as any[];
    return rows
      .filter((u) => (me ? u.id !== me : true))
      .map((u) => ({
        id: u.id,
        full_name: u.full_name,
        username: u.username,
        avatar_url: u.avatar_url,
        xp: u.xp,
        streak_count: u.streak_count,
        is_coordinator: u.is_coordinator,
        college_name: u.colleges?.name ?? null,
      })) as FriendListUser[];
  },

  fetchFriends: async () => {
    const me = getAuthUserId();
    if (!me) return;
    set({ isLoading: true, error: null });
    try {
      const { data: friendRows, error: friendError } = await supabase
        .from('friendships')
        .select('friend_id')
        .eq('user_id', me);

      if (friendError) throw new Error(friendError.message);
      const friendIds = uniqueById(
        (friendRows ?? []).map((r: any) => ({ id: String(r.friend_id) }))
      ).map((r) => r.id);

      if (!friendIds.length) {
        set({ friends: [], isLoading: false });
        return;
      }

      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, full_name, username, avatar_url, xp, streak_count, is_coordinator, colleges(name)')
        .in('id', friendIds);

      if (usersError) throw new Error(usersError.message);
      const users = (usersData ?? []) as any[];

      const friends: FriendListUser[] = users.map((u) => ({
        id: u.id,
        full_name: u.full_name,
        username: u.username,
        avatar_url: u.avatar_url,
        xp: u.xp,
        streak_count: u.streak_count,
        is_coordinator: u.is_coordinator,
        college_name: u.colleges?.name ?? null,
      }));

      friends.sort((a, b) => (b.xp ?? 0) - (a.xp ?? 0));

      set((state) => ({
        friends,
        relationshipByUserId: {
          ...state.relationshipByUserId,
          ...Object.fromEntries(friendIds.map((id) => [id, { kind: 'friends' as const }])),
        },
        isLoading: false,
      }));
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch friends',
      });
    }
  },

  fetchPendingIncoming: async () => {
    const me = getAuthUserId();
    if (!me) return;
    set({ isLoading: true, error: null });
    try {
      const { data: incomingData, error: incomingError } = await supabase
        .from('friend_requests')
        .select(
          'id, sender_id, receiver_id, status, created_at, updated_at, sender:sender_id(id, full_name, username, avatar_url, xp, streak_count, is_coordinator, colleges(name))'
        )
        .eq('receiver_id', me)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (incomingError) throw new Error(incomingError.message);

      const { data, error } = await supabase
        .from('friend_requests')
        .select('id, sender_id, receiver_id, status, created_at, updated_at')
        .eq('sender_id', me)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      const rows = (incomingData ?? []) as any[];
      const outgoingRequests = ((data ?? []) as FriendRequest[]) ?? [];
      const pendingIncoming: PendingRequestWithSender[] = rows.map((r) => ({
        id: r.id,
        sender_id: r.sender_id,
        receiver_id: r.receiver_id,
        status: r.status,
        created_at: r.created_at,
        updated_at: r.updated_at,
        sender: r.sender
          ? ({
              id: r.sender.id,
              full_name: r.sender.full_name,
              username: r.sender.username,
              avatar_url: r.sender.avatar_url,
              xp: r.sender.xp,
              streak_count: r.sender.streak_count,
              is_coordinator: r.sender.is_coordinator,
              college_name: r.sender.colleges?.name ?? null,
            } as FriendListUser)
          : null,
      }));

      set((state) => ({
        pendingIncoming,
        pendingOutgoingByUserId: normalizePendingByUser(outgoingRequests, me),
        relationshipByUserId: {
          ...state.relationshipByUserId,
          ...Object.fromEntries(pendingIncoming.map((p) => [p.sender_id, { kind: 'incoming_request', requestId: p.id }])),
          ...Object.fromEntries(
            outgoingRequests.map((p) => [p.receiver_id, { kind: 'outgoing_request' as const, requestId: p.id }])
          ),
        },
        isLoading: false,
      }));
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch friend requests',
      });
    }
  },

  fetchRelationship: async (otherUserId) => {
    const me = getAuthUserId();
    if (!me || !otherUserId || otherUserId === me) return { kind: 'none' };
    set({ error: null });

    const cached = get().relationshipByUserId[otherUserId];
    if (cached) return cached;

    // 1) Check friendships
    const { data: friendshipData, error: friendshipError } = await supabase
      .from('friendships')
      .select('id')
      .eq('user_id', me)
      .eq('friend_id', otherUserId)
      .maybeSingle();

    if (friendshipError) {
      set({ error: friendshipError.message });
      return { kind: 'none' };
    }
    const friendship = (friendshipData ?? null) as { id?: string } | null;
    if (friendship?.id) {
      const status: FriendshipStatus = { kind: 'friends' };
      set((state) => ({
        relationshipByUserId: { ...state.relationshipByUserId, [otherUserId]: status },
      }));
      return status;
    }

    // 2) Check pending requests in either direction
    const { data: reqData, error: reqError } = await supabase
      .from('friend_requests')
      .select('id, sender_id, receiver_id, status, created_at, updated_at')
      .or(`and(sender_id.eq.${me},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${me})`)
      .eq('status', 'pending')
      .maybeSingle();

    if (reqError) {
      set({ error: reqError.message });
      return { kind: 'none' };
    }

    let status: FriendshipStatus = { kind: 'none' };
    const req = (reqData ?? null) as FriendRequestRow | null;
    if (req?.id) {
      status =
        req.sender_id === me
          ? { kind: 'outgoing_request', requestId: req.id }
          : { kind: 'incoming_request', requestId: req.id };
    }

    set((state) => ({
      relationshipByUserId: { ...state.relationshipByUserId, [otherUserId]: status },
      pendingOutgoingByUserId:
        status.kind === 'outgoing_request'
          ? {
              ...state.pendingOutgoingByUserId,
              [otherUserId]: req as unknown as FriendRequest,
            }
          : state.pendingOutgoingByUserId,
    }));

    return status;
  },

  sendFriendRequest: async (receiverId) => {
    const me = getAuthUserId();
    if (!me || !receiverId || receiverId === me) return false;
    set({ isLoading: true, error: null });
    try {
      const existing = await get().fetchRelationship(receiverId);
      if (existing.kind !== 'none') {
        set({ isLoading: false });
        return true;
      }

      const { data, error } = await supabase
        .from('friend_requests')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert({ sender_id: me, receiver_id: receiverId, status: 'pending' } as any)
        .select('id, sender_id, receiver_id, status, created_at, updated_at')
        .single();

      if (error || !data) throw new Error(error?.message ?? 'Failed to send request');

      const request = data as unknown as FriendRequest;
      set((state) => ({
        pendingOutgoingByUserId: { ...state.pendingOutgoingByUserId, [receiverId]: request },
        relationshipByUserId: {
          ...state.relationshipByUserId,
          [receiverId]: { kind: 'outgoing_request', requestId: request.id },
        },
        isLoading: false,
      }));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send request';
      if (message.toLowerCase().includes('duplicate key value')) {
        const refreshed = await get().fetchRelationship(receiverId);
        set({ isLoading: false });
        return refreshed.kind !== 'none';
      }
      set({
        isLoading: false,
        error: message,
      });
      return false;
    }
  },

  acceptFriendRequest: async (requestId) => {
    const me = getAuthUserId();
    if (!me || !requestId) return false;
    set({ isLoading: true, error: null });
    try {
      const { data: reqData, error: reqError } = await supabase
        .from('friend_requests')
        .select('id, sender_id, receiver_id, status, created_at, updated_at')
        .eq('id', requestId)
        .single();

      const req = (reqData ?? null) as FriendRequestRow | null;
      if (reqError || !req) throw new Error(reqError?.message ?? 'Request not found');
      if (req.receiver_id !== me) throw new Error('Unauthorized request');

      const friendId = String(req.sender_id);

      const { error: updateError } = await (supabase.from('friend_requests') as any)
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', requestId);
      if (updateError) throw new Error(updateError.message);

      // Create both direction friendships
      const { error: insertError } = await supabase
        .from('friendships')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .upsert([{ user_id: me, friend_id: friendId }, { user_id: friendId, friend_id: me }] as any, {
          onConflict: 'user_id,friend_id',
          ignoreDuplicates: true,
        });
      if (insertError) throw new Error(insertError.message);

      set((state) => ({
        pendingIncoming: state.pendingIncoming.filter((p) => p.id !== requestId),
        pendingOutgoingByUserId: Object.fromEntries(
          Object.entries(state.pendingOutgoingByUserId).filter(([, req]) => req.id !== requestId)
        ),
        relationshipByUserId: { ...state.relationshipByUserId, [friendId]: { kind: 'friends' } },
        isLoading: false,
      }));

      await get().fetchFriends();
      return true;
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to accept request',
      });
      return false;
    }
  },

  rejectFriendRequest: async (requestId) => {
    const me = getAuthUserId();
    if (!me || !requestId) return false;
    set({ isLoading: true, error: null });
    try {
      const { data: reqData, error: reqError } = await supabase
        .from('friend_requests')
        .select('id, sender_id, receiver_id, status, created_at, updated_at')
        .eq('id', requestId)
        .single();

      const req = (reqData ?? null) as FriendRequestRow | null;
      if (reqError || !req) throw new Error(reqError?.message ?? 'Request not found');
      if (req.receiver_id !== me) throw new Error('Unauthorized request');

      const friendId = String(req.sender_id);

      const { error: updateError } = await (supabase.from('friend_requests') as any)
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', requestId);
      if (updateError) throw new Error(updateError.message);

      set((state) => {
        const next = { ...state.relationshipByUserId };
        delete next[friendId];
        return {
          pendingIncoming: state.pendingIncoming.filter((p) => p.id !== requestId),
          pendingOutgoingByUserId: Object.fromEntries(
            Object.entries(state.pendingOutgoingByUserId).filter(([, req]) => req.id !== requestId)
          ),
          relationshipByUserId: next,
          isLoading: false,
        };
      });
      return true;
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to reject request',
      });
      return false;
    }
  },

  removeFriend: async (friendId) => {
    const me = getAuthUserId();
    if (!me || !friendId) return false;
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .or(`and(user_id.eq.${me},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${me})`);

      if (error) throw new Error(error.message);

      set((state) => ({
        friends: state.friends.filter((f) => f.id !== friendId),
        relationshipByUserId: { ...state.relationshipByUserId, [friendId]: { kind: 'none' } },
        isLoading: false,
      }));
      return true;
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to remove friend',
      });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));

