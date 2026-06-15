import { supabase } from "../lib/supabase";

export type RemoteUserBar = {
  ingredientIds: string[];
  updatedAt: string;
};

export type SaveRemoteUserBarResult =
  | { status: "saved"; bar: RemoteUserBar }
  | { status: "conflict"; bar: RemoteUserBar | null };

type UserBarRow = {
  ingredient_ids: string[];
  updated_at: string;
};

function toRemoteUserBar(row: UserBarRow): RemoteUserBar {
  return {
    ingredientIds: row.ingredient_ids,
    updatedAt: row.updated_at,
  };
}

export async function loadRemoteUserBar(userId: string): Promise<RemoteUserBar | null> {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("user_bars")
    .select("ingredient_ids, updated_at")
    .eq("user_id", userId)
    .maybeSingle<UserBarRow>();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return toRemoteUserBar(data);
}

export async function saveRemoteUserBar(
  userId: string,
  ingredientIds: string[],
  expectedUpdatedAt: string | null,
): Promise<SaveRemoteUserBarResult | null> {
  if (!supabase) {
    return null;
  }

  const nextUpdatedAt = new Date().toISOString();

  if (!expectedUpdatedAt) {
    const { data, error } = await supabase
      .from("user_bars")
      .insert({
        user_id: userId,
        ingredient_ids: ingredientIds,
        updated_at: nextUpdatedAt,
      })
      .select("ingredient_ids, updated_at")
      .maybeSingle<UserBarRow>();

    if (!error && data) {
      return {
        status: "saved",
        bar: toRemoteUserBar(data),
      };
    }

    if (error?.code !== "23505") {
      throw error ?? new Error("Failed to save remote home bar.");
    }

    return {
      status: "conflict",
      bar: await loadRemoteUserBar(userId),
    };
  }

  const { data, error } = await supabase
    .from("user_bars")
    .update({
      ingredient_ids: ingredientIds,
      updated_at: nextUpdatedAt,
    })
    .eq("user_id", userId)
    .eq("updated_at", expectedUpdatedAt)
    .select("ingredient_ids, updated_at")
    .maybeSingle<UserBarRow>();

  if (error) {
    throw error;
  }

  if (data) {
    return {
      status: "saved",
      bar: toRemoteUserBar(data),
    };
  }

  return {
    status: "conflict",
    bar: await loadRemoteUserBar(userId),
  };
}
