import AsyncStorage from "@react-native-async-storage/async-storage";
import { getScopedStorageKey } from "../utils/persistedIds";

// Guest keys and device-level age/onboarding flags are deliberately excluded.
const ACCOUNT_CACHE_KEYS = ["domashniy-bar:selected-ingredients", "domashniy-bar:favorites"] as const;
const blockedUsers = new Set<string>();
const pendingWrites = new Map<string, Promise<void>>();

export function activateAccountCache(userId?: string) {
  if (userId) blockedUsers.delete(userId);
}

export async function writeAccountCache(baseKey: string, userId: string | undefined, value: string) {
  const key = getScopedStorageKey(baseKey, userId);
  if (!userId) return AsyncStorage.setItem(key, value);
  if (blockedUsers.has(userId)) return;
  const previous = pendingWrites.get(userId) ?? Promise.resolve();
  const write = previous.catch(() => undefined).then(async () => {
    if (!blockedUsers.has(userId)) await AsyncStorage.setItem(key, value);
  });
  pendingWrites.set(userId, write);
  try {
    await write;
  } finally {
    if (pendingWrites.get(userId) === write) pendingWrites.delete(userId);
  }
}

export async function clearAccountCaches(userId: string): Promise<void> {
  if (!userId) throw new Error("Неизвестен идентификатор аккаунта для очистки устройства.");
  blockedUsers.add(userId);
  await pendingWrites.get(userId)?.catch(() => undefined);
  await Promise.all(ACCOUNT_CACHE_KEYS.map((key) =>
    AsyncStorage.removeItem(getScopedStorageKey(key, userId)),
  ));
}
