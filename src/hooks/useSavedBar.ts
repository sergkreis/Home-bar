import AsyncStorage from "@react-native-async-storage/async-storage";
import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from "react";

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

function equalIds(left: string[], right: string[]) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
}

export function useSavedBar(ingredients: Ingredient[], userId?: string): UseSavedBarResult {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [hasLoadedSavedBar, setHasLoadedSavedBar] = useState(false);
  const [hasSavedBar, setHasSavedBar] = useState(false);
  const [hasMergedRemoteBar, setHasMergedRemoteBar] = useState(false);
  const [isSyncingBar, setIsSyncingBar] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSavedBar() {
      try {
        const storedIngredients = await AsyncStorage.getItem(SAVED_BAR_STORAGE_KEY);

        if (!storedIngredients) {
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
          setHasLoadedSavedBar(true);
        }
      }
    }

    loadSavedBar();

    return () => {
      isMounted = false;
    };
  }, [ingredients]);

  useEffect(() => {
    if (!hasLoadedSavedBar) {
      return;
    }

    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }

    saveTimer.current = setTimeout(() => {
      AsyncStorage.setItem(SAVED_BAR_STORAGE_KEY, JSON.stringify(selectedIngredients)).catch(
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
  }, [hasLoadedSavedBar, selectedIngredients]);

  useEffect(() => {
    setHasMergedRemoteBar(false);
    setSyncError(null);
  }, [userId]);

  useEffect(() => {
    if (!hasLoadedSavedBar || !userId || hasMergedRemoteBar) {
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
          const mergedIngredientIds = uniqueKnownIds(
            [...remoteIngredientIds, ...selectedIngredients],
            knownIngredientIds,
          );

          setSelectedIngredients(mergedIngredientIds);
          setHasSavedBar(true);

          if (!equalIds(remoteIngredientIds, mergedIngredientIds)) {
            await saveRemoteUserBar(currentUserId, mergedIngredientIds);
          }
        } else if (selectedIngredients.length > 0) {
          await saveRemoteUserBar(currentUserId, selectedIngredients);
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
  }, [hasLoadedSavedBar, hasMergedRemoteBar, ingredients, selectedIngredients, userId]);

  useEffect(() => {
    if (!hasLoadedSavedBar || !userId || !hasMergedRemoteBar) {
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
  }, [hasLoadedSavedBar, hasMergedRemoteBar, selectedIngredients, userId]);

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
