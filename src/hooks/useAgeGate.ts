import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "domashniy-bar:age-confirmed";

type UseAgeGateResult = {
  confirmAge: () => void;
  hasConfirmedAge: boolean;
  hasLoadedAgeGate: boolean;
};

export function useAgeGate(): UseAgeGateResult {
  const [hasConfirmedAge, setHasConfirmedAge] = useState(false);
  const [hasLoadedAgeGate, setHasLoadedAgeGate] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);

        if (isMounted) {
          setHasConfirmedAge(stored === "true");
        }
      } catch (error) {
        console.warn("Failed to load age gate flag.", error);
      } finally {
        if (isMounted) {
          setHasLoadedAgeGate(true);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const confirmAge = useCallback(() => {
    setHasConfirmedAge(true);
    AsyncStorage.setItem(STORAGE_KEY, "true").catch((error) => {
      console.warn("Failed to persist age gate flag.", error);
    });
  }, []);

  return {
    confirmAge,
    hasConfirmedAge,
    hasLoadedAgeGate,
  };
}
