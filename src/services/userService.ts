import { useEffect, useMemo, useState } from 'react';
import {
  db,
  getCurrentAuth,
  waitForOnline,
  logSubscriptionStart,
  logSubscriptionData,
  logSubscriptionError
} from '@/instant/instant';
import { shouldSurfaceOfflineError } from '@/utils/network';
import { FriendRequest, User } from '@/types/models';

const toNormalized = (value: string) => value.trim().toLowerCase();

const runQuery = async <T>(query: Record<string, unknown>): Promise<T> => {
  try {
    await waitForOnline();
    const { data } = await db.queryOnce(query as any);
    return data as T;
  } catch (error) {
    if (await shouldSurfaceOfflineError(error)) {
      throw new Error('Need an internet connection to sync with friends.');
    }
    throw error;
  }
};

const runTransact = async (chunks: any | any[]): Promise<void> => {
  try {
    await waitForOnline();
    console.log('[runTransact] Attempting transaction:', chunks);
    await db.transact(Array.isArray(chunks) ? chunks : [chunks]);
    console.log('[runTransact] Transaction successful');
  } catch (error: any) {
    console.error('[runTransact] Transaction failed:', {
      error,
      message: error?.message,
      chunks
    });
    if (await shouldSurfaceOfflineError(error)) {
      throw new Error('Need an internet connection to update your Loopy crew.');
    }
    throw error;
  }
};

const ensureNicknameMirror = async (user: User, normalized?: string): Promise<User> => {
  if (user.nicknameLower) {
    return user;
  }
  const nicknameLower = normalized ?? toNormalized(user.nickname);
  await runTransact([
    db.tx.users[user.id].update({ nicknameLower })
  ]);
  return { ...user, nicknameLower };
};

export const getCurrentUserId = (): string => {
  const auth = getCurrentAuth();
  if (!auth?.id) {
    throw new Error('Not authenticated');
  }
  return auth.id;
};

export const getCurrentUserEmail = (): string => {
  const auth = getCurrentAuth();
  if (!auth?.email) {
    throw new Error('Not authenticated or email not available');
  }
  return auth.email;
};

export const setNicknameUnique = async (nickname: string, userId?: string, userEmail?: string): Promise<User> => {
  const trimmed = nickname.trim();
  if (!trimmed) {
    throw new Error('Nickname cannot be empty');
  }
  const normalized = toNormalized(trimmed);
  const { users = [] } = (await runQuery<{ users?: User[] }>({
    users: {
      $: {
        where: {
          or: [
            { nicknameLower: normalized },
            { nickname: trimmed }
          ]
        },
        limit: 5
      }
    }
  }));

  const taken = users.some((existing) => existing.nickname.toLowerCase() === normalized);
  if (taken) {
    throw new Error('Nickname already taken');
  }

  const id = userId || getCurrentUserId();
  const email = userEmail || getCurrentUserEmail();
  const user: User = {
    id,
    email,
    nickname: trimmed,
    createdAt: Date.now(),
    nicknameLower: normalized
  };

  await runTransact([
    db.tx.users[id].update(user)
  ]);

  return user;
};

export const getOrCreateUser = async (nicknameIfNew?: string): Promise<User> => {
  const id = getCurrentUserId();
  const { users = [] } = (await runQuery<{ users?: User[] }>({
    users: {
      $: {
        where: { id },
        limit: 1
      }
    }
  }));

  if (users.length > 0) {
    return ensureNicknameMirror(users[0]);
  }

  if (!nicknameIfNew) {
    throw new Error('Nickname required for first-time user');
  }

  return setNicknameUnique(nicknameIfNew);
};

export const searchUsersByNickname = async (queryText: string): Promise<User[]> => {
  const raw = queryText.trim();
  if (!raw) {
    return [];
  }
  const normalized = toNormalized(raw);

  // Use exact match instead of $like to avoid indexing requirement
  const { users = [] } = (await runQuery<{ users?: User[] }>({
    users: {
      $: {
        where: {
          nicknameLower: normalized
        },
        limit: 10
      }
    }
  }));

  const map = new Map<string, User>();
  users.forEach((entry) => {
    map.set(entry.id, entry.nicknameLower ? entry : { ...entry, nicknameLower: toNormalized(entry.nickname) });
  });
  return Array.from(map.values());
};

export const sendFriendRequest = async (toUserId: string, fromUserId?: string): Promise<FriendRequest> => {
  const fromUser = fromUserId || getCurrentUserId();
  const request: FriendRequest = {
    id: `fr_${Date.now()}_${Math.round(Math.random() * 1e6)}`,
    fromUser,
    toUser: toUserId,
    status: 'pending',
    createdAt: Date.now()
  };

  await runTransact([
    db.tx.friend_requests[request.id].update(request)
  ]);

  return request;
};

export const acceptFriendRequest = async (requestId: string): Promise<void> => {
  await runTransact([
    db.tx.friend_requests[requestId].update({ status: 'accepted' })
  ]);
};

export const declineFriendRequest = async (requestId: string): Promise<void> => {
  await runTransact([
    db.tx.friend_requests[requestId].update({ status: 'rejected' })
  ]);
};

export const isFriend = async (a: string, b: string): Promise<boolean> => {
  const { friend_requests = [] } = (await runQuery<{ friend_requests?: FriendRequest[] }>({
    friend_requests: {
      $: {
        where: {
          and: [
            { status: 'accepted' },
            {
              or: [
                { fromUser: a, toUser: b },
                { fromUser: b, toUser: a }
              ]
            }
          ]
        },
        limit: 1
      }
    }
  }));

  return friend_requests.length > 0;
};

export const getUsersByIds = async (ids: string[]): Promise<User[]> => {
  if (!ids.length) {
    return [];
  }
  const { users = [] } = (await runQuery<{ users?: User[] }>({
    users: {
      $: {
        where: {
          id: { $in: ids }
        },
        limit: ids.length
      }
    }
  }));

  return users.map((user) => (user.nicknameLower ? user : { ...user, nicknameLower: toNormalized(user.nickname) }));
};

export const useFriendsList = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [serviceError, setServiceError] = useState<string | undefined>();
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [friends, setFriends] = useState<User[]>([]);

  useEffect(() => {
    let mounted = true;
    getCurrentUserId()
      .then((id) => {
        if (mounted) {
          setUserId(id);
        }
      })
      .catch((err) => {
        if (mounted) {
          setServiceError(err?.message ?? 'Unable to identify user');
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const query = useMemo(() => {
    if (!userId) {
      return null;
    }
    return {
      friend_requests: {
        $: {
          where: {
            status: 'accepted',
            or: [{ fromUser: userId }, { toUser: userId }]
          }
        }
      }
    };
  }, [userId]);

  useEffect(() => {
    if (query) {
      logSubscriptionStart({ source: 'userService.useFriendsList', query });
    }
  }, [query]);

  const { data, error, isLoading } = db.useQuery(query as any);

  useEffect(() => {
    if (data) {
      logSubscriptionData('userService.useFriendsList', data);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      logSubscriptionError('userService.useFriendsList', error);
    }
  }, [error]);
  const requests = useMemo(() => ((data?.friend_requests ?? []) as FriendRequest[]), [data]);

  useEffect(() => {
    if (!userId) {
      setFriends([]);
      return;
    }
    const ids = Array.from(
      new Set(
        requests.map((req) => (req.fromUser === userId ? req.toUser : req.fromUser)).filter(Boolean)
      )
    );
    if (!ids.length) {
      setFriends([]);
      return;
    }

    let cancelled = false;
    setLoadingUsers(true);
    setServiceError(undefined);

    getUsersByIds(ids)
      .then((users) => {
        if (!cancelled) {
          setFriends(users);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setServiceError(err?.message ?? 'Unable to load friends');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingUsers(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [requests, userId]);

  return {
    friends,
    loading: isLoading || loadingUsers || !userId,
    error: error?.message ?? serviceError
  };
};

export const useIncomingFriendRequests = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [serviceError, setServiceError] = useState<string | undefined>();
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersById, setUsersById] = useState<Record<string, User>>({});

  useEffect(() => {
    let mounted = true;
    getCurrentUserId()
      .then((id) => {
        if (mounted) {
          setUserId(id);
        }
      })
      .catch((err) => {
        if (mounted) {
          setServiceError(err?.message ?? 'Unable to identify user');
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const query = useMemo(() => {
    if (!userId) {
      return null;
    }
    return {
      friend_requests: {
        $: {
          where: {
            toUser: userId,
            status: 'pending'
          }
        }
      }
    };
  }, [userId]);

  useEffect(() => {
    if (query) {
      logSubscriptionStart({ source: 'userService.useIncomingFriendRequests', query });
    }
  }, [query]);

  const { data, error, isLoading } = db.useQuery(query as any);

  useEffect(() => {
    if (data) {
      logSubscriptionData('userService.useIncomingFriendRequests', data);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      logSubscriptionError('userService.useIncomingFriendRequests', error);
    }
  }, [error]);
  const requests = useMemo(() => ((data?.friend_requests ?? []) as FriendRequest[]), [data]);

  useEffect(() => {
    const ids = Array.from(new Set(requests.map((req) => req.fromUser)));
    if (!ids.length) {
      setUsersById({});
      return;
    }
    let cancelled = false;
    setLoadingUsers(true);
    setServiceError(undefined);
    getUsersByIds(ids)
      .then((users) => {
        if (cancelled) {
          return;
        }
        const map: Record<string, User> = {};
        users.forEach((user) => {
          map[user.id] = user;
        });
        setUsersById(map);
      })
      .catch((err) => {
        if (!cancelled) {
          setServiceError(err?.message ?? 'Unable to load requestors');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingUsers(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [requests]);

  return {
    requests,
    usersById,
    loading: isLoading || loadingUsers || !userId,
    error: error?.message ?? serviceError
  };
};
