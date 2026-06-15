import { supabase } from "../lib/supabase";

export type RemoteUserFavorites = {
  cocktailIds: string[];
  updatedAt: string;
};

export type SaveRemoteUserFavoritesResult =
  | { status: "saved"; favorites: RemoteUserFavorites }
  | { status: "conflict"; favorites: RemoteUserFavorites | null };

type UserFavoritesRow = {
  cocktail_ids: string[];
  updated_at: string;
};

function toRemoteUserFavorites(row: UserFavoritesRow): RemoteUserFavorites {
  return {
    cocktailIds: row.cocktail_ids,
    updatedAt: row.updated_at,
  };
}

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

  return toRemoteUserFavorites(data);
}

export async function saveRemoteUserFavorites(
  userId: string,
  cocktailIds: string[],
  expectedUpdatedAt: string | null,
): Promise<SaveRemoteUserFavoritesResult | null> {
  if (!supabase) {
    return null;
  }

  const nextUpdatedAt = new Date().toISOString();

  if (!expectedUpdatedAt) {
    const { data, error } = await supabase
      .from("user_favorites")
      .insert({
        user_id: userId,
        cocktail_ids: cocktailIds,
        updated_at: nextUpdatedAt,
      })
      .select("cocktail_ids, updated_at")
      .maybeSingle<UserFavoritesRow>();

    if (!error && data) {
      return {
        status: "saved",
        favorites: toRemoteUserFavorites(data),
      };
    }

    if (error?.code !== "23505") {
      throw error ?? new Error("Failed to save remote favorites.");
    }

    return {
      status: "conflict",
      favorites: await loadRemoteUserFavorites(userId),
    };
  }

  const { data, error } = await supabase
    .from("user_favorites")
    .update({
      cocktail_ids: cocktailIds,
      updated_at: nextUpdatedAt,
    })
    .eq("user_id", userId)
    .eq("updated_at", expectedUpdatedAt)
    .select("cocktail_ids, updated_at")
    .maybeSingle<UserFavoritesRow>();

  if (error) {
    throw error;
  }

  if (data) {
    return {
      status: "saved",
      favorites: toRemoteUserFavorites(data),
    };
  }

  return {
    status: "conflict",
    favorites: await loadRemoteUserFavorites(userId),
  };
}
