import { useEffect, useMemo } from 'react';
import {
  db,
  waitForOnline,
  logSubscriptionStart,
  logSubscriptionData,
  logSubscriptionError
} from '@/instant/instant';
import { shouldSurfaceOfflineError } from '@/utils/network';
import { Message } from '@/types/models';
import { getCurrentUserId } from './userService';

const runQuery = async <T>(query: Record<string, unknown>): Promise<T> => {
  try {
    await waitForOnline();
    const { data } = await db.queryOnce(query as any);
    return data as T;
  } catch (error) {
    if (await shouldSurfaceOfflineError(error)) {
      throw new Error('Need an internet connection to sync chat.');
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
      throw new Error('Need an internet connection to send chat.');
    }
    throw error;
  }
};

export const useMessages = (roomId: string, limit = 50) => {
  const query = useMemo(() => {
    if (!roomId) {
      return null;
    }
    return {
      messages: {
        $: {
          where: { roomId },
          orderBy: { createdAt: 'asc' },
          limit
        }
      }
    };
  }, [roomId, limit]);

  useEffect(() => {
    if (query) {
      logSubscriptionStart({ source: `chatService.useMessages(${roomId})`, query });
    }
  }, [query, roomId]);

  const { data, isLoading, error } = db.useQuery(query as any);

  useEffect(() => {
    if (data) {
      logSubscriptionData(`chatService.useMessages(${roomId})`, data);
    }
  }, [data, roomId]);

  useEffect(() => {
    if (error) {
      logSubscriptionError(`chatService.useMessages(${roomId})`, error);
    }
  }, [error, roomId]);

  return {
    messages: (data?.messages ?? []) as Message[],
    loading: isLoading,
    error: error?.message
  };
};

export const sendMessage = async (roomId: string, text: string): Promise<void> => {
  const trimmed = text.trim();
  if (!trimmed) {
    return;
  }
  const senderId = await getCurrentUserId();
  const message: Message = {
    id: `msg_${Date.now()}_${Math.round(Math.random() * 1e6)}`,
    roomId,
    senderId,
    text: trimmed,
    createdAt: Date.now()
  };

  await runTransact([
    db.tx.messages[message.id].update(message)
  ]);
};

export const truncateOldMessages = async (roomId: string, keep = 50): Promise<void> => {
  const { messages = [] } = (await runQuery<{ messages?: Message[] }>({
    messages: {
      $: {
        where: { roomId },
        orderBy: { createdAt: 'asc' },
        limit: keep + 10
      }
    }
  }));

  if (messages.length <= keep) {
    return;
  }

  const toRemove = messages.slice(0, messages.length - keep);
  await runTransact(
    toRemove.map((msg) => db.tx.messages[msg.id].delete())
  );
};

export const purgeRoomMessages = async (roomId: string): Promise<void> => {
  const { messages = [] } = (await runQuery<{ messages?: Message[] }>({
    messages: {
      $: {
        where: { roomId },
        limit: 200
      }
    }
  }));

  if (!messages.length) {
    return;
  }

  await runTransact(
    messages.map((msg) => db.tx.messages[msg.id].delete())
  );
};
