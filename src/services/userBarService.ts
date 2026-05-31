import { supabase } from "../lib/supabase";

export type RemoteUserBar = {
  ingredientIds: string[];
  updatedAt: string;
};

type UserBarRow = {
  ingredient_ids: string[];
  updated_at: string;
};

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

  return {
    ingredientIds: data.ingredient_ids,
    updatedAt: data.updated_at,
  };
}

export async function saveRemoteUserBar(userId: string, ingredientIds: string[]) {
  if (!supabase) {
    return;
  }

  const { error } = await supabase.from("user_bars").upsert({
    user_id: userId,
    ingredient_ids: ingredientIds,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw error;
  }
}
