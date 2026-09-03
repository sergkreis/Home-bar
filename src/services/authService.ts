import { AuthError, Session, User } from "@supabase/supabase-js";

import {
  clearPersistedSupabaseSession,
  clearSupabaseSessionTransientMarker,
  clearTransientSupabaseSessionIfNeeded,
  markSupabaseSessionTransient,
  supabase,
} from "../lib/supabase";

export type AuthCommandResult = {
  error?: string;
  message?: string;
};

const AUTH_REQUEST_TIMEOUT_MS = 15000;
const AUTH_REQUEST_TIMEOUT_MESSAGE =
  "Сервер не ответил за 15 секунд. Проверь интернет и настройки Supabase.";

async function withAuthTimeout<T>(request: Promise<T>) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(AUTH_REQUEST_TIMEOUT_MESSAGE));
    }, AUTH_REQUEST_TIMEOUT_MS);
  });

  try {
    return await Promise.race([request, timeout]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

function getAuthErrorMessage(error: AuthError) {
  const message = error.message.toLowerCase();

  if (message.includes("invalid login credentials")) {
    return "Неверная почта или пароль.";
  }

  if (message.includes("email not confirmed")) {
    return "Почта еще не подтверждена.";
  }

  if (message.includes("password")) {
    return "Проверь пароль: минимум 6 символов.";
  }

  return error.message;
}

function getAuthRedirectUrl() {
  if (
    typeof window === "undefined" ||
    typeof window.location?.origin !== "string"
  ) {
    return undefined;
  }

  return window.location.origin;
}

function getAccountDeletionErrorMessage(message: string) {
  if (message.toLowerCase().includes("no authenticated user")) {
    return "Сессия истекла. Войди заново и повтори удаление.";
  }

  return `Не удалось удалить аккаунт: ${message}`;
}

export function getUnexpectedAuthErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Не удалось связаться с Supabase. Проверь интернет и попробуй еще раз.";
}

export function getSessionUser(session: Session | null) {
  return session?.user ?? null;
}

export async function loadInitialAuthSession(): Promise<{
  error?: string;
  user: User | null;
}> {
  if (!supabase) {
    return { user: null };
  }

  await clearTransientSupabaseSessionIfNeeded();
  const { data, error } = await supabase.auth.getSession();

  return {
    error: error?.message,
    user: getSessionUser(data.session),
  };
}

export async function signInWithEmail(
  email: string,
  password: string,
  rememberSession: boolean,
): Promise<AuthCommandResult> {
  if (!supabase) {
    return {};
  }

  const { error } = await withAuthTimeout(
    supabase.auth.signInWithPassword({ email, password }),
  );

  if (error) {
    return { error: getAuthErrorMessage(error) };
  }

  if (rememberSession) {
    await clearSupabaseSessionTransientMarker();
  } else {
    await markSupabaseSessionTransient();
  }

  return {};
}

export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<AuthCommandResult> {
  if (!supabase) {
    return {};
  }

  const { data, error } = await withAuthTimeout(
    supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getAuthRedirectUrl(),
      },
    }),
  );

  if (error) {
    return { error: getAuthErrorMessage(error) };
  }

  return {
    message: data.session
      ? "Аккаунт создан. Бар и избранное синхронизируются."
      : "Проверь почту и подтверди регистрацию.",
  };
}

export async function sendPasswordReset(
  email: string,
): Promise<AuthCommandResult> {
  if (!supabase) {
    return {};
  }

  const { error } = await withAuthTimeout(
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getAuthRedirectUrl(),
    }),
  );

  return error
    ? { error: getAuthErrorMessage(error) }
    : { message: "Отправили письмо для восстановления пароля." };
}

export async function updateAccountPassword(
  password: string,
): Promise<AuthCommandResult> {
  if (!supabase) {
    return {};
  }

  const { error } = await withAuthTimeout(
    supabase.auth.updateUser({ password }),
  );

  return error
    ? { error: getAuthErrorMessage(error) }
    : { message: "Пароль обновлен." };
}

export async function deleteCurrentAccount(): Promise<AuthCommandResult> {
  if (!supabase) {
    return {};
  }

  // supabase.rpc() returns a thenable builder, not a real Promise: wrap it before racing the timeout.
  const { error } = await withAuthTimeout(
    Promise.resolve(supabase.rpc("delete_current_user")),
  );

  if (error) {
    return { error: getAccountDeletionErrorMessage(error.message) };
  }

  // The account is gone server-side; drop the now-orphaned session and local copies.
  await supabase.auth.signOut().catch(() => undefined);
  await clearPersistedSupabaseSession();

  return { message: "Аккаунт и все его данные удалены." };
}

export async function signOutCurrentUser(): Promise<AuthCommandResult> {
  if (!supabase) {
    return {};
  }

  const { error } = await withAuthTimeout(supabase.auth.signOut());

  if (error) {
    return { error: error.message };
  }

  await clearPersistedSupabaseSession();
  return {};
}
