import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  loadRemoteUserFavorites,
  saveRemoteUserFavorites,
} from "../services/userFavoritesService";
import {
  getScopedStorageKey,
  resolveAuthoritativeRemoteIds,
  uniqueKnownIds,
} from "../utils/persistedIds";
import { createLatestTaskQueue, LatestTaskQueue } from "../utils/latestTaskQueue";

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

export function useFavorites(
  knownCocktailIds: string[],
  userId?: string,
  isAuthReady = true,
): UseFavoritesResult {
  const storageKey = useMemo(() => getScopedStorageKey(STORAGE_KEY, userId), [userId]);
  const knownIds = useMemo(() => new Set(knownCocktailIds), [knownCocktailIds]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hasLoadedFavorites, setHasLoadedFavorites] = useState(false);
  const [hasMergedRemoteFavorites, setHasMergedRemoteFavorites] = useState(false);
  const [isSyncingFavorites, setIsSyncingFavorites] = useState(false);
  const [favoritesSyncError, setFavoritesSyncError] = useState<string | null>(null);
  const activeUserIdRef = useRef(userId);
  const loadedStorageKeyRef = useRef<string | null>(null);
  const remoteSaveQueueRef = useRef<LatestTaskQueue<string[]> | null>(null);
  const remoteUpdatedAtRef = useRef<string | null>(null);
  const skipNextRemoteSaveRef = useRef(false);
  activeUserIdRef.current = userId;

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    let isMounted = true;

    async function load() {
      remoteSaveQueueRef.current?.dispose();
      remoteSaveQueueRef.current = null;
      loadedStorageKeyRef.current = null;
      setHasLoadedFavorites(false);
      setHasMergedRemoteFavorites(false);
      setFavoritesSyncError(null);
      remoteUpdatedAtRef.current = null;
      skipNextRemoteSaveRef.current = false;

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
          loadedStorageKeyRef.current = storageKey;
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
    if (
      !isAuthReady ||
      !hasLoadedFavorites ||
      loadedStorageKeyRef.current !== storageKey ||
      !userId ||
      remoteSaveQueueRef.current
    ) {
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

        const remoteIds = resolveAuthoritativeRemoteIds(
          remoteFavorites?.cocktailIds,
          knownIds,
        );

        remoteUpdatedAtRef.current = remoteFavorites?.updatedAt ?? null;
        skipNextRemoteSaveRef.current = true;
        setFavorites(remoteIds);

        let queue: LatestTaskQueue<string[]>;
        queue = createLatestTaskQueue({
          onBusyChange: (isBusy) => {
            if (activeUserIdRef.current === currentUserId) {
              setIsSyncingFavorites(isBusy);
            }
          },
          onError: (error) => {
            if (activeUserIdRef.current !== currentUserId) {
              return;
            }

            console.warn("Failed to save remote favorites.", error);
            setFavoritesSyncError("Не удалось сохранить избранное в аккаунте.");
          },
          worker: async (cocktailIds) => {
            const result = await saveRemoteUserFavorites(
              currentUserId,
              cocktailIds,
              remoteUpdatedAtRef.current,
            );

            if (!result || activeUserIdRef.current !== currentUserId) {
              return;
            }

            if (result.status === "saved") {
              remoteUpdatedAtRef.current = result.favorites.updatedAt;
              return;
            }

            queue.clear();
            const nextIds = resolveAuthoritativeRemoteIds(
              result.favorites?.cocktailIds,
              knownIds,
            );
            remoteUpdatedAtRef.current = result.favorites?.updatedAt ?? null;
            skipNextRemoteSaveRef.current = true;
            setFavorites(nextIds);
            setFavoritesSyncError(
              "Избранное обновилось на другом устройстве. Показали свежую версию из аккаунта.",
            );
          },
        });
        remoteSaveQueueRef.current = queue;

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
      remoteSaveQueueRef.current?.dispose();
      remoteSaveQueueRef.current = null;
    };
  }, [hasLoadedFavorites, isAuthReady, knownIds, storageKey, userId]);

  useEffect(() => {
    if (!isAuthReady || !hasLoadedFavorites || !userId || !hasMergedRemoteFavorites) {
      return;
    }

    if (skipNextRemoteSaveRef.current) {
      skipNextRemoteSaveRef.current = false;
      return;
    }

    const timeoutId = setTimeout(() => {
      setFavoritesSyncError(null);
      remoteSaveQueueRef.current?.enqueue([...favorites]);
    }, REMOTE_SAVE_DEBOUNCE_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [
    favorites,
    hasLoadedFavorites,
    hasMergedRemoteFavorites,
    isAuthReady,
    knownIds,
    userId,
  ]);

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
