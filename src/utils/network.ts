import { Platform } from 'react-native';

const NETWORK_ERROR_SNIPPETS = [
  'network request failed',
  'network error',
  'offline',
  'failed to fetch',
  'timeout',
  'timed out',
  'socket',
  'enotfound',
  'econnrefused'
];

let netInfoModule: { fetch?: () => Promise<{ isConnected?: boolean | null; isInternetReachable?: boolean | null }> } | null | undefined;

const loadNetInfo = () => {
  if (netInfoModule !== undefined) {
    return netInfoModule;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    netInfoModule = require('@react-native-community/netinfo');
  } catch (error) {
    console.warn('[network] NetInfo module unavailable; using fetch fallback.', error);
    netInfoModule = null;
  }
  return netInfoModule;
};

const FALLBACK_URL = 'https://www.gstatic.com/generate_204';

const probeWithFetch = async (): Promise<boolean> => {
  try {
    const response = await fetch(FALLBACK_URL, { method: 'HEAD' });
    if (response.ok) {
      return true;
    }
    return false;
  } catch (error) {
    console.warn('[network] Fallback probe failed', error);
    return false;
  }
};

export const isInternetReachable = async (): Promise<boolean | null> => {
  const NetInfo = loadNetInfo();
  if (NetInfo?.fetch) {
    try {
      const state = await NetInfo.fetch();
      if (typeof state.isInternetReachable === 'boolean') {
        return state.isInternetReachable;
      }
      if (typeof state.isConnected === 'boolean') {
        return state.isConnected;
      }
    } catch (error) {
      console.warn('[network] NetInfo.fetch failed', error);
    }
  }

  if (Platform.OS === 'web') {
    if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
      return navigator.onLine;
    }
    return null;
  }

  return probeWithFetch();
};

export const looksLikeNetworkError = (error: unknown): boolean => {
  const message = (error as { message?: string })?.message ?? '';
  if (typeof message !== 'string') {
    return false;
  }
  const lower = message.toLowerCase();
  return NETWORK_ERROR_SNIPPETS.some((snippet) => lower.includes(snippet));
};

export const shouldSurfaceOfflineError = async (error: unknown): Promise<boolean> => {
  if (!looksLikeNetworkError(error)) {
    return false;
  }
  const reachable = await isInternetReachable();
  return reachable === false;
};
