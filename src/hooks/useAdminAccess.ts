import { useEffect, useState } from "react";

import { isSupabaseConfigured } from "../lib/supabase";
import { loadIsAdmin } from "../services/adminAccessService";

type UseAdminAccessResult = {
  adminAccessError: string | null;
  hasLoadedAdminAccess: boolean;
  isAdmin: boolean;
};

export function useAdminAccess(userId?: string, isAuthReady = true): UseAdminAccessResult {
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasLoadedAdminAccess, setHasLoadedAdminAccess] = useState(
    !isSupabaseConfigured || !userId,
  );
  const [adminAccessError, setAdminAccessError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    if (!isSupabaseConfigured || !userId) {
      setIsAdmin(false);
      setAdminAccessError(null);
      setHasLoadedAdminAccess(true);
      return;
    }

    let isMounted = true;

    async function load() {
      setHasLoadedAdminAccess(false);
      setAdminAccessError(null);

      try {
        const nextIsAdmin = await loadIsAdmin(userId);

        if (isMounted) {
          setIsAdmin(nextIsAdmin);
        }
      } catch (error) {
        console.warn("Failed to load admin access.", error);

        if (isMounted) {
          setIsAdmin(false);
          setAdminAccessError("Не удалось проверить админский доступ.");
        }
      } finally {
        if (isMounted) {
          setHasLoadedAdminAccess(true);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [isAuthReady, userId]);

  return {
    adminAccessError,
    hasLoadedAdminAccess,
    isAdmin,
  };
}
