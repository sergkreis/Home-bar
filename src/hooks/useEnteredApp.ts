import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "domashniy-bar:has-entered-app";

type UseEnteredAppResult = {
  hasLoadedEntered: boolean;
  hasEnteredApp: boolean;
  markEntered: () => void;
  resetEntered: () => void;
};

/**
 * Persist whether the user has passed onboarding. Fixes the edge case where
 * a user cleared their bar to zero and got sent back to onboarding on reload.
 */
export function useEnteredApp(): UseEnteredAppResult {
  const [hasEnteredApp, setHasEnteredApp] = useState(false);
  const [hasLoadedEntered, setHasLoadedEntered] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (isMounted && stored === "true") {
          setHasEnteredApp(true);
        }
      } catch (error) {
        console.warn("Failed to load app entry flag.", error);
      } finally {
        if (isMounted) setHasLoadedEntered(true);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const markEntered = useCallback(() => {
    setHasEnteredApp(true);
    AsyncStorage.setItem(STORAGE_KEY, "true").catch((error) => {
      console.warn("Failed to persist app entry flag.", error);
    });
  }, []);

  const resetEntered = useCallback(() => {
    setHasEnteredApp(false);
    AsyncStorage.removeItem(STORAGE_KEY).catch((error) => {
      console.warn("Failed to clear app entry flag.", error);
    });
  }, []);

  return { hasLoadedEntered, hasEnteredApp, markEntered, resetEntered };
}
