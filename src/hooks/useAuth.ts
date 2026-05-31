import { AuthError, Session, User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

import { isSupabaseConfigured, supabase } from "../lib/supabase";

type AuthMode = "sign-in" | "sign-up";

type UseAuthResult = {
  authError: string | null;
  authMessage: string | null;
  authMode: AuthMode;
  authUser: User | null;
  isAuthReady: boolean;
  isAuthLoading: boolean;
  isSupabaseConfigured: boolean;
  setAuthMode: (mode: AuthMode) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
};

function getAuthErrorMessage(error: AuthError) {
  if (error.message.toLowerCase().includes("invalid login credentials")) {
    return "Неверная почта или пароль.";
  }

  return error.message;
}

function getSessionUser(session: Session | null) {
  return session?.user ?? null;
}

export function useAuth(): UseAuthResult {
  const [authMode, setAuthMode] = useState<AuthMode>("sign-in");
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

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(getSessionUser(session));
      setIsAuthReady(true);
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

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

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setAuthError(getAuthErrorMessage(error));
    } else if (!data.session) {
      setAuthMessage("Проверь почту и подтверди регистрацию.");
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
    setAuthMode,
    signIn,
    signOut,
    signUp,
  };
}
