import AsyncStorage from "@react-native-async-storage/async-storage";
import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from "react";

import { Ingredient } from "../data/cocktails";

const SAVED_BAR_STORAGE_KEY = "domashniy-bar:selected-ingredients";
const SAVE_DEBOUNCE_MS = 250;

type UseSavedBarResult = {
  hasLoadedSavedBar: boolean;
  hasSavedBar: boolean;
  selectedIngredients: string[];
  setSelectedIngredients: Dispatch<SetStateAction<string[]>>;
};

export function useSavedBar(ingredients: Ingredient[]): UseSavedBarResult {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [hasLoadedSavedBar, setHasLoadedSavedBar] = useState(false);
  const [hasSavedBar, setHasSavedBar] = useState(false);
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
        const savedIngredients = parsedIngredients.filter(
          (ingredientId): ingredientId is string =>
            typeof ingredientId === "string" && knownIngredientIds.has(ingredientId),
        );

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

  // Debounced save — rapid toggles batch into a single write.
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

  return {
    hasLoadedSavedBar,
    hasSavedBar,
    selectedIngredients,
    setSelectedIngredients,
  };
}
