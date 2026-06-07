import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  loadRemoteUserFavorites,
  saveRemoteUserFavorites,
} from "../services/userFavoritesService";

const STORAGE_KEY = "domashniy-bar:favorites";
const REMOTE_SAVE_DEBOUNCE_MS = 800;

type SyncStatus = "local" | "remote" | "syncing" | "error";

type UseFavoritesResult = {
  hasLoadedFavorites: boolean;
  favorites: string[];
  isFavorite: (cocktailId: string) => boolean;
  isSyncingFavorites: boolean;
  favoritesSyncError: string | null;
  favoritesSyncStatus: SyncStatus;
  toggleFavorite: (cocktailId: string) => void;
};

function uniqueKnownIds(values: unknown[], knownIds: Set<string>): string[] {
  return Array.from(
    new Set(
      values.filter((value): value is string => typeof value === "string" && knownIds.has(value)),
    ),
  );
}

function equalIds(left: string[], right: string[]) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
}

function getStorageKey(userId?: string) {
  return userId ? `${STORAGE_KEY}:user:${userId}` : STORAGE_KEY;
}

export function useFavorites(
  knownCocktailIds: string[],
  userId?: string,
  isAuthReady = true,
): UseFavoritesResult {
  const storageKey = useMemo(() => getStorageKey(userId), [userId]);
  const knownIds = useMemo(() => new Set(knownCocktailIds), [knownCocktailIds]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hasLoadedFavorites, setHasLoadedFavorites] = useState(false);
  const [hasMergedRemoteFavorites, setHasMergedRemoteFavorites] = useState(false);
  const [isSyncingFavorites, setIsSyncingFavorites] = useState(false);
  const [favoritesSyncError, setFavoritesSyncError] = useState<string | null>(null);
  const previousUserId = useRef<string | undefined>(userId);
  const loadedStorageKey = useRef<string | null>(null);
  const pendingGuestFavorites = useRef<string[] | null>(null);

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    const previous = previousUserId.current;

    if (
      !previous &&
      userId &&
      loadedStorageKey.current === STORAGE_KEY &&
      favorites.length > 0
    ) {
      pendingGuestFavorites.current = favorites;
    }

    previousUserId.current = userId;
  }, [favorites, isAuthReady, userId]);

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    let isMounted = true;

    async function load() {
      setHasLoadedFavorites(false);
      setHasMergedRemoteFavorites(false);
      setFavoritesSyncError(null);

      try {
        const stored = await AsyncStorage.getItem(storageKey);
        if (!stored) {
          if (isMounted) {
            setFavorites([]);
          }
          return;
        }

        const parsed: unknown = JSON.parse(stored);
        if (!Array.isArray(parsed)) return;

        const ids = uniqueKnownIds(parsed, knownIds);

        if (isMounted) {
          setFavorites(ids);
        }
      } catch (error) {
        console.warn("Failed to load favorites.", error);
      } finally {
        if (isMounted) {
          loadedStorageKey.current = storageKey;
          setHasLoadedFavorites(true);
        }
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [isAuthReady, knownIds, storageKey]);

  useEffect(() => {
    if (!isAuthReady || !hasLoadedFavorites) return;

    AsyncStorage.setItem(storageKey, JSON.stringify(favorites)).catch((error) => {
      console.warn("Failed to save favorites.", error);
    });
  }, [favorites, hasLoadedFavorites, isAuthReady, storageKey]);

  useEffect(() => {
    if (!isAuthReady || !hasLoadedFavorites || !userId || hasMergedRemoteFavorites) {
      return;
    }

    let isMounted = true;
    const currentUserId = userId;

    async function mergeRemoteFavorites() {
      setIsSyncingFavorites(true);
      setFavoritesSyncError(null);

      try {
        const remoteFavorites = await loadRemoteUserFavorites(currentUserId);

        if (!isMounted) {
          return;
        }

        const guestFavorites = pendingGuestFavorites.current
          ? uniqueKnownIds(pendingGuestFavorites.current, knownIds)
          : [];

        if (remoteFavorites && remoteFavorites.cocktailIds.length > 0) {
          const remoteIds = uniqueKnownIds(remoteFavorites.cocktailIds, knownIds);
          const mergedIds = uniqueKnownIds([...remoteIds, ...favorites, ...guestFavorites], knownIds);

          setFavorites(mergedIds);

          if (!equalIds(remoteIds, mergedIds)) {
            await saveRemoteUserFavorites(currentUserId, mergedIds);
          }
        } else {
          const mergedIds = uniqueKnownIds([...favorites, ...guestFavorites], knownIds);

          if (mergedIds.length > 0) {
            setFavorites(mergedIds);
            await saveRemoteUserFavorites(currentUserId, mergedIds);
          }
        }

        pendingGuestFavorites.current = null;
        setHasMergedRemoteFavorites(true);
      } catch (error) {
        console.warn("Failed to sync favorites.", error);
        if (isMounted) {
          setFavoritesSyncError("Не удалось синхронизировать избранное.");
        }
      } finally {
        if (isMounted) {
          setIsSyncingFavorites(false);
        }
      }
    }

    mergeRemoteFavorites();

    return () => {
      isMounted = false;
    };
  }, [favorites, hasLoadedFavorites, hasMergedRemoteFavorites, isAuthReady, knownIds, userId]);

  useEffect(() => {
    if (!isAuthReady || !hasLoadedFavorites || !userId || !hasMergedRemoteFavorites) {
      return;
    }

    const currentUserId = userId;
    const timeoutId = setTimeout(() => {
      setIsSyncingFavorites(true);
      setFavoritesSyncError(null);

      saveRemoteUserFavorites(currentUserId, favorites)
        .catch((error) => {
          console.warn("Failed to save remote favorites.", error);
          setFavoritesSyncError("Не удалось сохранить избранное в аккаунте.");
        })
        .finally(() => {
          setIsSyncingFavorites(false);
        });
    }, REMOTE_SAVE_DEBOUNCE_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [favorites, hasLoadedFavorites, hasMergedRemoteFavorites, isAuthReady, userId]);

  const isFavorite = useCallback(
    (cocktailId: string) => favorites.includes(cocktailId),
    [favorites],
  );

  const toggleFavorite = useCallback((cocktailId: string) => {
    setFavorites((current) =>
      current.includes(cocktailId)
        ? current.filter((id) => id !== cocktailId)
        : [...current, cocktailId],
    );
  }, []);

  const favoritesSyncStatus: SyncStatus = favoritesSyncError
    ? "error"
    : isSyncingFavorites
      ? "syncing"
      : userId
        ? "remote"
        : "local";

  return {
    hasLoadedFavorites,
    favorites,
    isFavorite,
    isSyncingFavorites,
    favoritesSyncError,
    favoritesSyncStatus,
    toggleFavorite,
  };
}
