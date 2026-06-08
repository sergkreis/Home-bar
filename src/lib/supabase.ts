import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabaseProjectRef = supabaseUrl ? new URL(supabaseUrl).hostname.split(".")[0] : null;
const supabaseAuthStorageKey = supabaseProjectRef
  ? `sb-${supabaseProjectRef}-auth-token`
  : null;
const supabaseTransientAuthStorageKey = supabaseAuthStorageKey
  ? `${supabaseAuthStorageKey}:transient`
  : null;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: typeof window !== "undefined",
        flowType: "pkce",
      },
    })
  : null;

export async function clearPersistedSupabaseSession() {
  const keysToRemove = [supabaseAuthStorageKey, supabaseTransientAuthStorageKey].filter(
    (key): key is string => Boolean(key),
  );

  await Promise.all(keysToRemove.map((key) => AsyncStorage.removeItem(key)));
}

export async function markSupabaseSessionTransient() {
  if (!supabaseTransientAuthStorageKey) {
    return;
  }

  await AsyncStorage.setItem(supabaseTransientAuthStorageKey, "1");
}

export async function clearSupabaseSessionTransientMarker() {
  if (!supabaseTransientAuthStorageKey) {
    return;
  }

  await AsyncStorage.removeItem(supabaseTransientAuthStorageKey);
}

export async function clearTransientSupabaseSessionIfNeeded() {
  if (!supabaseTransientAuthStorageKey) {
    return;
  }

  const isTransientSession = await AsyncStorage.getItem(supabaseTransientAuthStorageKey);

  if (isTransientSession) {
    await clearPersistedSupabaseSession();
  }
}
