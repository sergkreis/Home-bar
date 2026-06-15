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

function toUserProfile(row: UserProfileRow): UserProfile {
  return {
    birthDate: row.birth_date ?? "",
    displayName: row.display_name ?? "",
    updatedAt: row.updated_at,
  };
}

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

  return toUserProfile(data);
}

export async function saveRemoteUserProfile(
  userId: string,
  profile: SaveUserProfileInput,
): Promise<UserProfile | null> {
  if (!supabase) {
    return null;
  }

  const displayName = profile.displayName.trim();
  const birthDate = profile.birthDate.trim() || null;

  const { data, error } = await supabase
    .from("user_profiles")
    .upsert({
      user_id: userId,
      display_name: displayName,
      birth_date: birthDate,
      updated_at: new Date().toISOString(),
    })
    .select("display_name, birth_date, updated_at")
    .maybeSingle<UserProfileRow>();

  if (error) {
    throw error;
  }

  return data ? toUserProfile(data) : null;
}
