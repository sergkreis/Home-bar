import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";

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

export function useFavorites(knownCocktailIds: string[], userId?: string): UseFavoritesResult {
  const knownIds = useMemo(() => new Set(knownCocktailIds), [knownCocktailIds]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hasLoadedFavorites, setHasLoadedFavorites] = useState(false);
  const [hasMergedRemoteFavorites, setHasMergedRemoteFavorites] = useState(false);
  const [isSyncingFavorites, setIsSyncingFavorites] = useState(false);
  const [favoritesSyncError, setFavoritesSyncError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (!stored) return;

        const parsed: unknown = JSON.parse(stored);
        if (!Array.isArray(parsed)) return;

        const ids = uniqueKnownIds(parsed, knownIds);

        if (isMounted) {
          setFavorites(ids);
        }
      } catch (error) {
        console.warn("Failed to load favorites.", error);
      } finally {
        if (isMounted) setHasLoadedFavorites(true);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [knownIds]);

  useEffect(() => {
    if (!hasLoadedFavorites) return;

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favorites)).catch((error) => {
      console.warn("Failed to save favorites.", error);
    });
  }, [favorites, hasLoadedFavorites]);

  useEffect(() => {
    setHasMergedRemoteFavorites(false);
    setFavoritesSyncError(null);
  }, [userId]);

  useEffect(() => {
    if (!hasLoadedFavorites || !userId || hasMergedRemoteFavorites) {
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

        if (remoteFavorites && remoteFavorites.cocktailIds.length > 0) {
          const remoteIds = uniqueKnownIds(remoteFavorites.cocktailIds, knownIds);
          const mergedIds = uniqueKnownIds([...remoteIds, ...favorites], knownIds);

          setFavorites(mergedIds);

          if (!equalIds(remoteIds, mergedIds)) {
            await saveRemoteUserFavorites(currentUserId, mergedIds);
          }
        } else if (favorites.length > 0) {
          await saveRemoteUserFavorites(currentUserId, favorites);
        }

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
  }, [favorites, hasLoadedFavorites, hasMergedRemoteFavorites, knownIds, userId]);

  useEffect(() => {
    if (!hasLoadedFavorites || !userId || !hasMergedRemoteFavorites) {
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
  }, [favorites, hasLoadedFavorites, hasMergedRemoteFavorites, userId]);

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
