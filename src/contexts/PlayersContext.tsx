import { ReactNode, createContext, useCallback, useContext, useMemo, useState } from 'react';

export type Player = {
  id: string;
  name: string;
};

export type GroupMode = 'friends' | 'newFriends' | null;

type PlayersContextValue = {
  players: Player[];
  mode: GroupMode;
  addPlayer: (name?: string) => void;
  updatePlayer: (id: string, name: string) => void;
  removePlayer: (id: string) => void;
  resetPlayers: (nextPlayers?: Player[]) => void;
  setMode: (mode: GroupMode) => void;
  resetSession: () => void;
};

const PlayersContext = createContext<PlayersContextValue | undefined>(undefined);

const createPlayerId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const createPlayer = (name: string): Player => ({ id: createPlayerId(), name });

export default function PlayersProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [mode, setModeState] = useState<GroupMode>(null);

  const addPlayer = useCallback((name = '') => {
    setPlayers((prev) => [...prev, createPlayer(name)]);
  }, []);

  const updatePlayer = useCallback((id: string, name: string) => {
    setPlayers((prev) => prev.map((player) => (player.id === id ? { ...player, name } : player)));
  }, []);

  const removePlayer = useCallback((id: string) => {
    setPlayers((prev) => prev.filter((player) => player.id !== id));
  }, []);

  const resetPlayers = useCallback((nextPlayers: Player[] = []) => {
    setPlayers(nextPlayers);
  }, []);

  const setMode = useCallback((nextMode: GroupMode) => {
    setModeState(nextMode);
  }, []);

  const resetSession = useCallback(() => {
    setPlayers([]);
    setModeState(null);
  }, []);

  const value = useMemo(
    () => ({ players, mode, addPlayer, updatePlayer, removePlayer, resetPlayers, setMode, resetSession }),
    [players, mode, addPlayer, updatePlayer, removePlayer, resetPlayers, setMode, resetSession]
  );

  return <PlayersContext.Provider value={value}>{children}</PlayersContext.Provider>;
}

export const usePlayers = () => {
  const context = useContext(PlayersContext);
  if (!context) {
    throw new Error('usePlayers must be used within PlayersProvider');
  }
  return context;
};
