import { supabase } from "../lib/supabase";

type AdminUserRow = {
  user_id: string;
};

export async function loadIsAdmin(userId?: string): Promise<boolean> {
  if (!supabase || !userId) {
    return false;
  }

  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle<AdminUserRow>();

  if (error) {
    throw error;
  }

  return Boolean(data);
}
