import { useCallback, useEffect, useMemo, useState } from "react";

import {
  loadRemoteUserProfile,
  SaveUserProfileInput,
  saveRemoteUserProfile,
  UserProfile,
} from "../services/userProfileService";

type ProfileSyncStatus = "idle" | "loading" | "saving" | "saved" | "error";

type UseUserProfileResult = {
  hasLoadedProfile: boolean;
  profile: UserProfile;
  profileError: string | null;
  profileMessage: string | null;
  profileSyncStatus: ProfileSyncStatus;
  saveProfile: (profile: SaveUserProfileInput) => Promise<void>;
};

const emptyProfile: UserProfile = {
  birthDate: "",
  displayName: "",
  updatedAt: "",
};

function normalizeProfile(profile: SaveUserProfileInput): SaveUserProfileInput {
  return {
    birthDate: profile.birthDate.trim(),
    displayName: profile.displayName.trim(),
  };
}

export function useUserProfile(userId?: string, isAuthReady = true): UseUserProfileResult {
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [hasLoadedProfile, setHasLoadedProfile] = useState(!userId);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileSyncStatus, setProfileSyncStatus] = useState<ProfileSyncStatus>("idle");

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    if (!userId) {
      setProfile(emptyProfile);
      setHasLoadedProfile(true);
      setProfileError(null);
      setProfileMessage(null);
      setProfileSyncStatus("idle");
      return;
    }

    let isMounted = true;
    const currentUserId = userId;

    async function loadProfile() {
      setHasLoadedProfile(false);
      setProfileError(null);
      setProfileMessage(null);
      setProfileSyncStatus("loading");

      try {
        const remoteProfile = await loadRemoteUserProfile(currentUserId);

        if (isMounted) {
          setProfile(remoteProfile ?? emptyProfile);
          setProfileSyncStatus("idle");
        }
      } catch (error) {
        console.warn("Failed to load user profile.", error);
        if (isMounted) {
          setProfile(emptyProfile);
          setProfileError("Не удалось загрузить настройки профиля. Проверь SQL-схему Supabase.");
          setProfileSyncStatus("error");
        }
      } finally {
        if (isMounted) {
          setHasLoadedProfile(true);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [isAuthReady, userId]);

  useEffect(() => {
    if (profileSyncStatus !== "saved") {
      return;
    }

    const timeoutId = setTimeout(() => {
      setProfileMessage(null);
      setProfileSyncStatus("idle");
    }, 3000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [profileSyncStatus]);

  const saveProfile = useCallback(
    async (nextProfile: SaveUserProfileInput) => {
      if (!userId) {
        return;
      }

      const normalizedProfile = normalizeProfile(nextProfile);

      setProfileError(null);
      setProfileMessage(null);
      setProfileSyncStatus("saving");

      try {
        const savedProfile = await saveRemoteUserProfile(userId, normalizedProfile);
        setProfile(savedProfile ?? {
          ...normalizedProfile,
          updatedAt: new Date().toISOString(),
        });
        setProfileMessage("Профиль сохранен.");
        setProfileSyncStatus("saved");
      } catch (error) {
        console.warn("Failed to save user profile.", error);
        setProfileError("Не удалось сохранить профиль. Проверь SQL-схему Supabase.");
        setProfileSyncStatus("error");
      }
    },
    [userId],
  );

  return useMemo(
    () => ({
      hasLoadedProfile,
      profile,
      profileError,
      profileMessage,
      profileSyncStatus,
      saveProfile,
    }),
    [
      hasLoadedProfile,
      profile,
      profileError,
      profileMessage,
      profileSyncStatus,
      saveProfile,
    ],
  );
}
