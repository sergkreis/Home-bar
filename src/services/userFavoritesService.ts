import { supabase } from "../lib/supabase";

export type RemoteUserFavorites = {
  cocktailIds: string[];
  updatedAt: string;
};

type UserFavoritesRow = {
  cocktail_ids: string[];
  updated_at: string;
};

export async function loadRemoteUserFavorites(userId: string): Promise<RemoteUserFavorites | null> {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("user_favorites")
    .select("cocktail_ids, updated_at")
    .eq("user_id", userId)
    .maybeSingle<UserFavoritesRow>();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    cocktailIds: data.cocktail_ids,
    updatedAt: data.updated_at,
  };
}

export async function saveRemoteUserFavorites(userId: string, cocktailIds: string[]) {
  if (!supabase) {
    return;
  }

  const { error } = await supabase.from("user_favorites").upsert({
    user_id: userId,
    cocktail_ids: cocktailIds,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw error;
  }
}
