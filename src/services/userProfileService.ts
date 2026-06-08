import { supabase } from "../lib/supabase";

export type UserProfile = {
  birthDate: string;
  displayName: string;
  updatedAt: string;
};

type UserProfileRow = {
  birth_date: string | null;
  display_name: string | null;
  updated_at: string;
};

export type SaveUserProfileInput = {
  birthDate: string;
  displayName: string;
};

export async function loadRemoteUserProfile(userId: string): Promise<UserProfile | null> {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("user_profiles")
    .select("display_name, birth_date, updated_at")
    .eq("user_id", userId)
    .maybeSingle<UserProfileRow>();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    birthDate: data.birth_date ?? "",
    displayName: data.display_name ?? "",
    updatedAt: data.updated_at,
  };
}

export async function saveRemoteUserProfile(userId: string, profile: SaveUserProfileInput) {
  if (!supabase) {
    return;
  }

  const displayName = profile.displayName.trim();
  const birthDate = profile.birthDate.trim() || null;

  const { error } = await supabase.from("user_profiles").upsert({
    user_id: userId,
    display_name: displayName,
    birth_date: birthDate,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw error;
  }
}
