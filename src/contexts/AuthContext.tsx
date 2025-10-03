import { ReactNode, createContext, useContext, useMemo, useState } from 'react';
import { User } from '@/types/models';

export type AuthMode = 'guest' | 'signed-in';

export type AuthContextValue = {
  user: User | null;
  mode: AuthMode;
  setUser: (user: User) => void;
  clearUser: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      mode: user ? 'signed-in' : 'guest',
      setUser: (nextUser) => setUserState(nextUser),
      clearUser: () => setUserState(null)
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
