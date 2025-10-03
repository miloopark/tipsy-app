import { useEffect, useMemo } from 'react';
import {
  db,
  waitForOnline,
  logSubscriptionStart,
  logSubscriptionData,
  logSubscriptionError
} from '@/instant/instant';
import { shouldSurfaceOfflineError } from '@/utils/network';
import { GameState } from '@/types/models';

const runQuery = async <T>(query: Record<string, unknown>): Promise<T> => {
  try {
    await waitForOnline();
    const { data } = await db.queryOnce(query as any);
    return data as T;
  } catch (error) {
    if (await shouldSurfaceOfflineError(error)) {
      throw new Error('Need an internet connection to update the game state.');
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
      throw new Error('Need an internet connection to update the game state.');
    }
    throw error;
  }
};

export const useGameState = (roomId: string) => {
  const query = useMemo(() => {
    if (!roomId) {
      return null;
    }
    return {
      game_states: {
        $: {
          where: { roomId },
          limit: 1
        }
      }
    };
  }, [roomId]);

  useEffect(() => {
    if (query) {
      logSubscriptionStart({ source: `gameService.useGameState(${roomId})`, query });
    }
  }, [query, roomId]);

  const { data, isLoading, error } = db.useQuery(query as any);

  useEffect(() => {
    if (data) {
      logSubscriptionData(`gameService.useGameState(${roomId})`, data);
    }
  }, [data, roomId]);

  useEffect(() => {
    if (error) {
      logSubscriptionError(`gameService.useGameState(${roomId})`, error);
    }
  }, [error, roomId]);
  const gameState = (((data?.game_states ?? []) as GameState[])[0]) ?? null;

  return {
    gameState,
    loading: isLoading,
    error: error?.message
  };
};

export const subscribeGameState = useGameState;

export const updateGameState = async (roomId: string, patch: Partial<GameState>): Promise<void> => {
  const { game_states = [] } = (await runQuery<{ game_states?: GameState[] }>({
    game_states: {
      $: {
        where: { roomId },
        limit: 1
      }
    }
  }));

  const existing = game_states[0];
  const base: GameState = existing
    ? { ...existing }
    : {
        id: `game_${roomId}`,
        roomId,
        phase: 'idle',
        updatedAt: Date.now()
      } as GameState;

  const next: GameState = {
    ...base,
    ...patch,
    id: base.id,
    roomId,
    phase: (patch.phase ?? base.phase) ?? 'idle',
    updatedAt: Date.now()
  };

  await runTransact([
    db.tx.game_states[next.id].update(next)
  ]);
};

export const startGame = async (roomId: string) => {
  await updateGameState(roomId, { phase: 'playing' });
};

export const endGame = async (roomId: string) => {
  await updateGameState(roomId, {
    phase: 'idle',
    turnUser: undefined,
    category: undefined,
    payload: undefined
  });
};

export const setTurn = async (roomId: string, userId: string) => {
  await updateGameState(roomId, { turnUser: userId });
};

export const setCategory = async (roomId: string, category: string) => {
  await updateGameState(roomId, { category });
};
