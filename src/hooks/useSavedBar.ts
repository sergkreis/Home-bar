import AsyncStorage from "@react-native-async-storage/async-storage";
import { type Dispatch, type SetStateAction, useEffect, useMemo, useRef, useState } from "react";

import { Ingredient } from "../data/cocktails";
import { loadRemoteUserBar, saveRemoteUserBar } from "../services/userBarService";
import {
  getScopedStorageKey,
  resolveAuthoritativeRemoteIds,
  uniqueKnownIds,
} from "../utils/persistedIds";

const SAVED_BAR_STORAGE_KEY = "domashniy-bar:selected-ingredients";
const SAVE_DEBOUNCE_MS = 250;
const REMOTE_SAVE_DEBOUNCE_MS = 800;

type UseSavedBarResult = {
  hasLoadedSavedBar: boolean;
  hasSavedBar: boolean;
  isSyncingBar: boolean;
  syncError: string | null;
  syncStatus: "local" | "remote" | "syncing" | "error";
  selectedIngredients: string[];
  setSelectedIngredients: Dispatch<SetStateAction<string[]>>;
};

export function useSavedBar(
  ingredients: Ingredient[],
  userId?: string,
  isAuthReady = true,
): UseSavedBarResult {
  const storageKey = useMemo(
    () => getScopedStorageKey(SAVED_BAR_STORAGE_KEY, userId),
    [userId],
  );
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [hasLoadedSavedBar, setHasLoadedSavedBar] = useState(false);
  const [hasSavedBar, setHasSavedBar] = useState(false);
  const [hasMergedRemoteBar, setHasMergedRemoteBar] = useState(false);
  const [isSyncingBar, setIsSyncingBar] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const knownIngredientIds = useMemo(
    () => new Set(ingredients.map((ingredient) => ingredient.id)),
    [ingredients],
  );
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remoteUpdatedAtRef = useRef<string | null>(null);
  const skipNextRemoteSaveRef = useRef(false);

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    let isMounted = true;

    async function loadSavedBar() {
      setHasLoadedSavedBar(false);
      setHasMergedRemoteBar(false);
      setSyncError(null);
      remoteUpdatedAtRef.current = null;
      skipNextRemoteSaveRef.current = false;

      try {
        const storedIngredients = await AsyncStorage.getItem(storageKey);

        if (!storedIngredients) {
          if (isMounted) {
            setSelectedIngredients([]);
            setHasSavedBar(false);
          }
          return;
        }

        const parsedIngredients: unknown = JSON.parse(storedIngredients);

        if (!Array.isArray(parsedIngredients)) {
          return;
        }

        const savedIngredients = uniqueKnownIds(parsedIngredients, knownIngredientIds);

        if (isMounted) {
          setSelectedIngredients(savedIngredients);
          setHasSavedBar(savedIngredients.length > 0);
        }
      } catch (error) {
        console.warn("Failed to load saved home bar.", error);
      } finally {
        if (isMounted) {
          setHasLoadedSavedBar(true);
        }
      }
    }

    loadSavedBar();

    return () => {
      isMounted = false;
    };
  }, [isAuthReady, knownIngredientIds, storageKey]);

  useEffect(() => {
    if (!isAuthReady || !hasLoadedSavedBar) {
      return;
    }

    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }

    saveTimer.current = setTimeout(() => {
      AsyncStorage.setItem(storageKey, JSON.stringify(selectedIngredients)).catch(
        (error) => {
          console.warn("Failed to save home bar.", error);
        },
      );
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, [hasLoadedSavedBar, isAuthReady, selectedIngredients, storageKey]);

  useEffect(() => {
    if (!isAuthReady || !hasLoadedSavedBar || !userId || hasMergedRemoteBar) {
      return;
    }

    let isMounted = true;
    const currentUserId = userId;

    async function mergeRemoteBar() {
      setIsSyncingBar(true);
      setSyncError(null);

      try {
        const remoteBar = await loadRemoteUserBar(currentUserId);

        if (!isMounted) {
          return;
        }

        const remoteIngredientIds = resolveAuthoritativeRemoteIds(
          remoteBar?.ingredientIds,
          knownIngredientIds,
        );

        remoteUpdatedAtRef.current = remoteBar?.updatedAt ?? null;
        skipNextRemoteSaveRef.current = true;
        setSelectedIngredients(remoteIngredientIds);
        setHasSavedBar(remoteIngredientIds.length > 0);

        setHasMergedRemoteBar(true);
      } catch (error) {
        console.warn("Failed to sync saved home bar.", error);
        if (isMounted) {
          setSyncError("Не удалось синхронизировать бар.");
        }
      } finally {
        if (isMounted) {
          setIsSyncingBar(false);
        }
      }
    }

    mergeRemoteBar();

    return () => {
      isMounted = false;
    };
  }, [
    hasLoadedSavedBar,
    hasMergedRemoteBar,
    isAuthReady,
    knownIngredientIds,
    userId,
  ]);

  useEffect(() => {
    if (!isAuthReady || !hasLoadedSavedBar || !userId || !hasMergedRemoteBar) {
      return;
    }

    if (skipNextRemoteSaveRef.current) {
      skipNextRemoteSaveRef.current = false;
      return;
    }

    let isMounted = true;
    const currentUserId = userId;
    const timeoutId = setTimeout(() => {
      if (!isMounted) {
        return;
      }

      setIsSyncingBar(true);
      setSyncError(null);

      saveRemoteUserBar(currentUserId, selectedIngredients, remoteUpdatedAtRef.current)
        .then((result) => {
          if (!isMounted) {
            return;
          }

          if (!result) {
            return;
          }

          if (result.status === "saved") {
            remoteUpdatedAtRef.current = result.bar.updatedAt;
            return;
          }

          const remoteIngredientIds = resolveAuthoritativeRemoteIds(
            result.bar?.ingredientIds,
            knownIngredientIds,
          );

          remoteUpdatedAtRef.current = result.bar?.updatedAt ?? null;
          skipNextRemoteSaveRef.current = true;
          setSelectedIngredients(remoteIngredientIds);
          setHasSavedBar(remoteIngredientIds.length > 0);
          setSyncError("Бар обновился на другом устройстве. Показали свежую версию из аккаунта.");
        })
        .catch((error) => {
          if (!isMounted) {
            return;
          }

          console.warn("Failed to save remote home bar.", error);
          setSyncError("Не удалось сохранить бар в аккаунте.");
        })
        .finally(() => {
          if (isMounted) {
            setIsSyncingBar(false);
          }
        });
    }, REMOTE_SAVE_DEBOUNCE_MS);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [
    hasLoadedSavedBar,
    hasMergedRemoteBar,
    isAuthReady,
    knownIngredientIds,
    selectedIngredients,
    userId,
  ]);

  const syncStatus = syncError ? "error" : isSyncingBar ? "syncing" : userId ? "remote" : "local";

  return {
    hasLoadedSavedBar,
    hasSavedBar,
    isSyncingBar,
    syncError,
    syncStatus,
    selectedIngredients,
    setSelectedIngredients,
  };
}
