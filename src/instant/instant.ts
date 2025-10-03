import { init } from '@instantdb/react-native';
import schema from '../../instant.schema';

const APP_ID = '023237b2-90a4-4124-831c-e2634fb6d20b';

export const db = init({ appId: APP_ID, schema });
console.log('[instant:init] client created', { appId: APP_ID });

// Store the current auth in memory
let currentAuthCache: { id: string; email: string } | null = null;

type SubscriptionMeta = {
  source: string;
  query: Record<string, unknown> | null;
};

export const logSubscriptionStart = ({ source, query }: SubscriptionMeta) => {
  if (!query) {
    return;
  }
  const collections = Object.keys(query);
  console.log('[instant:subscribe:start]', { source, collections, query });
};

export const logSubscriptionData = (source: string, data: unknown) => {
  console.log('[instant:subscribe:data]', { source, data });
};

export const logSubscriptionError = (source: string, error: unknown) => {
  console.warn('[instant:subscribe:error]', { source, error });
};

export const sendMagicCode = async (email: string): Promise<void> => {
  await db.auth.sendMagicCode({ email });
};

export const signInWithMagicCode = async (email: string, code: string): Promise<{ user: { id: string; email: string } }> => {
  console.log('[instant:signInWithMagicCode] Attempting sign in with:', { email, code });
  try {
    const result = await db.auth.signInWithMagicCode({ email, code });
    console.log('[instant:signInWithMagicCode] Success! Result:', result);
    if (!result?.user?.id) {
      throw new Error('Sign in failed - no user ID in result');
    }
    // Cache the auth result
    currentAuthCache = { id: result.user.id, email: result.user.email };
    console.log('[instant:signInWithMagicCode] Cached auth:', currentAuthCache);
    return result;
  } catch (error: any) {
    console.error('[instant:signInWithMagicCode] Error details:', {
      message: error?.message,
      body: error?.body,
      status: error?.status,
      fullError: error
    });
    throw error;
  }
};

export const getCurrentAuth = (): { id: string; email: string } | null => {
  console.log('[getCurrentAuth] Returning cached auth:', currentAuthCache);
  return currentAuthCache;
};

export const signOut = async (): Promise<void> => {
  await db.auth.signOut();
  currentAuthCache = null;
};

export const waitForOnline = async (): Promise<void> => {
  // Just a basic connectivity check, no auth required
  return Promise.resolve();
};
