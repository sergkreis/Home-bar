import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "domashniy-bar:favorites";

type UseFavoritesResult = {
  hasLoadedFavorites: boolean;
  favorites: string[];
  isFavorite: (cocktailId: string) => boolean;
  toggleFavorite: (cocktailId: string) => void;
};

export function useFavorites(): UseFavoritesResult {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hasLoadedFavorites, setHasLoadedFavorites] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (!stored) return;

        const parsed: unknown = JSON.parse(stored);
        if (!Array.isArray(parsed)) return;

        const ids = parsed.filter((value): value is string => typeof value === "string");

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
  }, []);

  useEffect(() => {
    if (!hasLoadedFavorites) return;

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favorites)).catch((error) => {
      console.warn("Failed to save favorites.", error);
    });
  }, [favorites, hasLoadedFavorites]);

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

  return { hasLoadedFavorites, favorites, isFavorite, toggleFavorite };
}
