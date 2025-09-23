import { ReactNode, createContext, useContext, useMemo, useState } from 'react';

export type AuthContextValue = {
  email: string | null;
  signIn: (email: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      email,
      signIn: (input) => setEmail(input.trim().toLowerCase()),
      signOut: () => setEmail(null)
    }),
    [email]
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
