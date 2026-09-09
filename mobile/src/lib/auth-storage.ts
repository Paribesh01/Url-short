import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'snip_token';

// expo-secure-store's web implementation is a no-op stub (it has no
// Keychain/Keystore equivalent to wrap), so every get/set/delete on the
// web target would silently do nothing — the token would never actually
// persist, and every authenticated request would 401. Native platforms
// (iOS/Android) get real Keychain/Keystore-backed storage; web falls back
// to localStorage, matching what the Next.js dashboard already does.
const isWeb = Platform.OS === 'web';

export async function getToken(): Promise<string | null> {
  try {
    if (isWeb) {
      return window.localStorage.getItem(TOKEN_KEY);
    }
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setToken(token: string): Promise<void> {
  try {
    if (isWeb) {
      window.localStorage.setItem(TOKEN_KEY, token);
      return;
    }
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch {
    // Keychain/Keystore unavailable — auth just won't persist across restarts
  }
}

export async function clearToken(): Promise<void> {
  try {
    if (isWeb) {
      window.localStorage.removeItem(TOKEN_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // ignore
  }
}
