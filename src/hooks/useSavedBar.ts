import AsyncStorage from "@react-native-async-storage/async-storage";
import { type Dispatch, type SetStateAction, useEffect, useMemo, useRef, useState } from "react";

import { Ingredient } from "../data/cocktails";
import { loadRemoteUserBar, saveRemoteUserBar } from "../services/userBarService";

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

function uniqueKnownIds(values: unknown[], knownIds: Set<string>): string[] {
  return Array.from(
    new Set(
      values.filter((value): value is string => typeof value === "string" && knownIds.has(value)),
    ),
  );
}

function getStorageKey(userId?: string) {
  return userId ? `${SAVED_BAR_STORAGE_KEY}:user:${userId}` : SAVED_BAR_STORAGE_KEY;
}

export function useSavedBar(
  ingredients: Ingredient[],
  userId?: string,
  isAuthReady = true,
): UseSavedBarResult {
  const storageKey = useMemo(() => getStorageKey(userId), [userId]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [hasLoadedSavedBar, setHasLoadedSavedBar] = useState(false);
  const [hasSavedBar, setHasSavedBar] = useState(false);
  const [hasMergedRemoteBar, setHasMergedRemoteBar] = useState(false);
  const [isSyncingBar, setIsSyncingBar] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedStorageKey = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    let isMounted = true;

    async function loadSavedBar() {
      setHasLoadedSavedBar(false);
      setHasMergedRemoteBar(false);
      setSyncError(null);

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

        const knownIngredientIds = new Set(ingredients.map((ingredient) => ingredient.id));
        const savedIngredients = uniqueKnownIds(parsedIngredients, knownIngredientIds);

        if (isMounted) {
          setSelectedIngredients(savedIngredients);
          setHasSavedBar(savedIngredients.length > 0);
        }
      } catch (error) {
        console.warn("Failed to load saved home bar.", error);
      } finally {
        if (isMounted) {
          loadedStorageKey.current = storageKey;
          setHasLoadedSavedBar(true);
        }
      }
    }

    loadSavedBar();

    return () => {
      isMounted = false;
    };
  }, [ingredients, isAuthReady, storageKey]);

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

        const knownIngredientIds = new Set(ingredients.map((ingredient) => ingredient.id));

        if (remoteBar && remoteBar.ingredientIds.length > 0) {
          const remoteIngredientIds = uniqueKnownIds(remoteBar.ingredientIds, knownIngredientIds);

          setSelectedIngredients(remoteIngredientIds);
          setHasSavedBar(true);
        } else {
          setSelectedIngredients([]);
          setHasSavedBar(false);
        }

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
    ingredients,
    isAuthReady,
    userId,
  ]);

  useEffect(() => {
    if (!isAuthReady || !hasLoadedSavedBar || !userId || !hasMergedRemoteBar) {
      return;
    }

    const currentUserId = userId;
    const timeoutId = setTimeout(() => {
      setIsSyncingBar(true);
      setSyncError(null);

      saveRemoteUserBar(currentUserId, selectedIngredients)
        .catch((error) => {
          console.warn("Failed to save remote home bar.", error);
          setSyncError("Не удалось сохранить бар в аккаунте.");
        })
        .finally(() => {
          setIsSyncingBar(false);
        });
    }, REMOTE_SAVE_DEBOUNCE_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [hasLoadedSavedBar, hasMergedRemoteBar, isAuthReady, selectedIngredients, userId]);

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
