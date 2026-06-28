import { AuthError, Session, User } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";

import {
  clearPersistedSupabaseSession,
  clearSupabaseSessionTransientMarker,
  clearTransientSupabaseSessionIfNeeded,
  isSupabaseConfigured,
  markSupabaseSessionTransient,
  supabase,
} from "../lib/supabase";

export type AuthMode =
  | "sign-in"
  | "sign-up"
  | "reset-password"
  | "update-password";

type UseAuthResult = {
  authError: string | null;
  authMessage: string | null;
  authMode: AuthMode;
  authUser: User | null;
  isAuthReady: boolean;
  isAuthLoading: boolean;
  isSupabaseConfigured: boolean;
  resetPassword: (email: string) => Promise<void>;
  setAuthMode: (mode: AuthMode) => void;
  signIn: (
    email: string,
    password: string,
    rememberSession?: boolean,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
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

function getUnexpectedAuthErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Не удалось связаться с Supabase. Проверь интернет и попробуй еще раз.";
}

function getSessionUser(session: Session | null) {
  return session?.user ?? null;
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

export function useAuth(): UseAuthResult {
  const [authMode, setAuthModeState] = useState<AuthMode>("sign-in");
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(!isSupabaseConfigured);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const shouldPersistSession = useRef(true);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let isMounted = true;
    const authClient = supabase;

    async function loadInitialSession() {
      await clearTransientSupabaseSessionIfNeeded();

      const { data, error } = await authClient.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (error) {
        setAuthError(error.message);
      }

      setAuthUser(getSessionUser(data.session));
      setIsAuthReady(true);
    }

    loadInitialSession().catch((error) => {
      console.warn("Failed to load auth session.", error);
      if (isMounted) {
        setAuthError(error.message);
        setIsAuthReady(true);
      }
    });

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setAuthUser(getSessionUser(session));
      setIsAuthReady(true);

      if (session && !shouldPersistSession.current) {
        markSupabaseSessionTransient().catch((error) => {
          console.warn("Failed to mark transient auth session.", error);
        });
      }

      if (event === "PASSWORD_RECOVERY") {
        setAuthModeState("update-password");
        setAuthMessage("Введи новый пароль для аккаунта.");
      }
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const setAuthMode = (mode: AuthMode) => {
    setAuthModeState(mode);
    setAuthError(null);
    setAuthMessage(null);
  };

  const signIn = async (
    email: string,
    password: string,
    rememberSession = true,
  ) => {
    if (!supabase) {
      return;
    }

    shouldPersistSession.current = rememberSession;
    setIsAuthLoading(true);
    setAuthError(null);
    setAuthMessage(null);

    try {
      const { error } = await withAuthTimeout(
        supabase.auth.signInWithPassword({ email, password }),
      );

      if (error) {
        setAuthError(getAuthErrorMessage(error));
        shouldPersistSession.current = true;
      } else if (!rememberSession) {
        await markSupabaseSessionTransient();
      } else {
        await clearSupabaseSessionTransientMarker();
      }
    } catch (error) {
      setAuthError(getUnexpectedAuthErrorMessage(error));
      shouldPersistSession.current = true;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    if (!supabase) {
      return;
    }

    setIsAuthLoading(true);
    setAuthError(null);
    setAuthMessage(null);

    try {
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
        setAuthError(getAuthErrorMessage(error));
      } else if (!data.session) {
        setAuthMessage("Проверь почту и подтверди регистрацию.");
      } else {
        setAuthMessage("Аккаунт создан. Бар и избранное синхронизируются.");
      }
    } catch (error) {
      setAuthError(getUnexpectedAuthErrorMessage(error));
    } finally {
      setIsAuthLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    if (!supabase) {
      return;
    }

    setIsAuthLoading(true);
    setAuthError(null);
    setAuthMessage(null);

    try {
      const { error } = await withAuthTimeout(
        supabase.auth.resetPasswordForEmail(email, {
          redirectTo: getAuthRedirectUrl(),
        }),
      );

      if (error) {
        setAuthError(getAuthErrorMessage(error));
      } else {
        setAuthMessage("Отправили письмо для восстановления пароля.");
      }
    } catch (error) {
      setAuthError(getUnexpectedAuthErrorMessage(error));
    } finally {
      setIsAuthLoading(false);
    }
  };

  const updatePassword = async (password: string) => {
    if (!supabase) {
      return;
    }

    setIsAuthLoading(true);
    setAuthError(null);
    setAuthMessage(null);

    try {
      const { error } = await withAuthTimeout(
        supabase.auth.updateUser({ password }),
      );

      if (error) {
        setAuthError(getAuthErrorMessage(error));
      } else {
        setAuthModeState("sign-in");
        setAuthMessage("Пароль обновлен.");
      }
    } catch (error) {
      setAuthError(getUnexpectedAuthErrorMessage(error));
    } finally {
      setIsAuthLoading(false);
    }
  };

  const signOut = async () => {
    if (!supabase) {
      return;
    }

    setIsAuthLoading(true);
    setAuthError(null);
    setAuthMessage(null);
    shouldPersistSession.current = true;

    try {
      const { error } = await withAuthTimeout(supabase.auth.signOut());

      if (error) {
        setAuthError(error.message);
      } else {
        await clearPersistedSupabaseSession();
      }
    } catch (error) {
      setAuthError(getUnexpectedAuthErrorMessage(error));
    } finally {
      setIsAuthLoading(false);
    }
  };

  return {
    authError,
    authMessage,
    authMode,
    authUser,
    isAuthReady,
    isAuthLoading,
    isSupabaseConfigured,
    resetPassword,
    setAuthMode,
    signIn,
    signOut,
    signUp,
    updatePassword,
  };
}
