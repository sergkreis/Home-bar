import { AuthError, Session, User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

import { isSupabaseConfigured, supabase } from "../lib/supabase";

export type AuthMode = "sign-in" | "sign-up" | "reset-password" | "update-password";

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
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
};

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

function getSessionUser(session: Session | null) {
  return session?.user ?? null;
}

function getAuthRedirectUrl() {
  if (typeof window === "undefined") {
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

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) {
        return;
      }

      if (error) {
        setAuthError(error.message);
      }

      setAuthUser(getSessionUser(data.session));
      setIsAuthReady(true);
    });

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setAuthUser(getSessionUser(session));
      setIsAuthReady(true);

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

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return;
    }

    setIsAuthLoading(true);
    setAuthError(null);
    setAuthMessage(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setAuthError(getAuthErrorMessage(error));
    }

    setIsAuthLoading(false);
  };

  const signUp = async (email: string, password: string) => {
    if (!supabase) {
      return;
    }

    setIsAuthLoading(true);
    setAuthError(null);
    setAuthMessage(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getAuthRedirectUrl(),
      },
    });

    if (error) {
      setAuthError(getAuthErrorMessage(error));
    } else if (!data.session) {
      setAuthMessage("Проверь почту и подтверди регистрацию.");
    } else {
      setAuthMessage("Аккаунт создан. Бар и избранное синхронизируются.");
    }

    setIsAuthLoading(false);
  };

  const resetPassword = async (email: string) => {
    if (!supabase) {
      return;
    }

    setIsAuthLoading(true);
    setAuthError(null);
    setAuthMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getAuthRedirectUrl(),
    });

    if (error) {
      setAuthError(getAuthErrorMessage(error));
    } else {
      setAuthMessage("Отправили письмо для восстановления пароля.");
    }

    setIsAuthLoading(false);
  };

  const updatePassword = async (password: string) => {
    if (!supabase) {
      return;
    }

    setIsAuthLoading(true);
    setAuthError(null);
    setAuthMessage(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setAuthError(getAuthErrorMessage(error));
    } else {
      setAuthModeState("sign-in");
      setAuthMessage("Пароль обновлен.");
    }

    setIsAuthLoading(false);
  };

  const signOut = async () => {
    if (!supabase) {
      return;
    }

    setIsAuthLoading(true);
    setAuthError(null);
    setAuthMessage(null);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setAuthError(error.message);
    }

    setIsAuthLoading(false);
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
