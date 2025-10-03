import { useEffect, useMemo, useState } from 'react';
import {
  db,
  waitForOnline,
  logSubscriptionStart,
  logSubscriptionData,
  logSubscriptionError
} from '@/instant/instant';
import { shouldSurfaceOfflineError } from '@/utils/network';
import { Room } from '@/types/models';
import { getCurrentUserId } from './userService';

const runQuery = async <T>(query: Record<string, unknown>): Promise<T> => {
  try {
    await waitForOnline();
    const { data } = await db.queryOnce(query as any);
    return data as T;
  } catch (error) {
    if (await shouldSurfaceOfflineError(error)) {
      throw new Error('Need an internet connection to load Loopy rooms.');
    }
    throw error;
  }
};

const runTransact = async (chunks: any | any[]) => {
  try {
    await waitForOnline();
    await db.transact(Array.isArray(chunks) ? chunks : [chunks]);
  } catch (error) {
    if (await shouldSurfaceOfflineError(error)) {
      throw new Error('Need an internet connection to update Loopy rooms.');
    }
    throw error;
  }
};

export const createRoom = async (
  name: string,
  options?: {
    localPlayers?: { name: string }[];
    memberIds?: string[];
    isPublic?: boolean;
    maxPlayers?: number;
    status?: 'open' | 'in-progress' | 'finished';
  }
): Promise<Room> => {
  const createdBy = await getCurrentUserId();
  const baseMembers = Array.from(new Set([createdBy, ...(options?.memberIds ?? [])]));
  const id = `room_${Date.now()}_${Math.round(Math.random() * 1e6)}`;
  const createdAt = Date.now();

  const payload: Room = {
    id,
    name,
    createdBy,
    members: baseMembers,
    createdAt,
    ...(options?.localPlayers ? { localPlayers: options.localPlayers } : {}),
    ...(options?.isPublic !== undefined ? { isPublic: options.isPublic } : {}),
    ...(options?.maxPlayers ? { maxPlayers: options.maxPlayers } : {}),
    ...(options?.status ? { status: options.status } : {})
  };

  await runTransact([
    db.tx.rooms[id].update(payload)
  ]);

  return payload;
};

export const joinRoom = async (roomId: string): Promise<void> => {
  const userId = await getCurrentUserId();
  const { rooms = [] } = (await runQuery<{ rooms?: Room[] }>({
    rooms: {
      $: {
        where: { id: roomId },
        limit: 1
      }
    }
  }));

  const room = rooms[0];
  if (!room) {
    throw new Error('Room not found');
  }

  if (room.members.includes(userId)) {
    return;
  }

  const members = [...room.members, userId];
  await runTransact([
    db.tx.rooms[roomId].update({ members })
  ]);
};

export const useMyRooms = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();

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
          setError(err?.message ?? 'Unable to load rooms');
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
      rooms: {
        $: {
          orderBy: { createdAt: 'desc' }
        }
      }
    };
  }, [userId]);

  useEffect(() => {
    if (query) {
      logSubscriptionStart({ source: 'roomService.useMyRooms', query });
    }
  }, [query]);

  const { data, isLoading, error: queryError } = db.useQuery(query as any);

  useEffect(() => {
    if (data) {
      logSubscriptionData('roomService.useMyRooms', data);
    }
  }, [data]);

  useEffect(() => {
    if (queryError) {
      logSubscriptionError('roomService.useMyRooms', queryError);
    }
  }, [queryError]);
  const rawRooms = (data?.rooms ?? []) as Room[];
  const rooms = userId
    ? rawRooms.filter((room) => Array.isArray(room.members) && room.members.includes(userId))
    : [];

  return {
    rooms,
    loading: isLoading || !userId,
    error: queryError?.message ?? error
  };
};

export const endRoom = async (roomId: string): Promise<void> => {
  await runTransact([
    db.tx.rooms[roomId].delete()
  ]);
};

export const useRoom = (roomId: string) => {
  const query = useMemo(() => {
    if (!roomId) {
      return null;
    }
    return {
      rooms: {
        $: {
          where: { id: roomId },
          limit: 1
        }
      }
    };
  }, [roomId]);

  useEffect(() => {
    if (query) {
      logSubscriptionStart({ source: 'roomService.useRoom', query });
    }
  }, [query]);

  const { data, isLoading, error } = db.useQuery(query as any);

  useEffect(() => {
    if (data) {
      logSubscriptionData('roomService.useRoom', data);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      logSubscriptionError('roomService.useRoom', error);
    }
  }, [error]);
  const room = (((data?.rooms ?? []) as Room[])[0]) ?? null;

  return {
    room,
    loading: isLoading,
    error: error?.message
  };
};
