import { User } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";

import {
  isSupabaseConfigured,
  markSupabaseSessionTransient,
  supabase,
} from "../lib/supabase";
import {
  AuthCommandResult,
  getSessionUser,
  getUnexpectedAuthErrorMessage,
  loadInitialAuthSession,
  sendPasswordReset,
  signInWithEmail,
  signOutCurrentUser,
  signUpWithEmail,
  updateAccountPassword,
} from "../services/authService";

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
    async function loadInitialSession() {
      const { error, user } = await loadInitialAuthSession();

      if (!isMounted) {
        return;
      }

      if (error) {
        setAuthError(error);
      }

      setAuthUser(user);
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

  const runAuthCommand = async (
    command: () => Promise<AuthCommandResult>,
    onSuccess?: () => void,
  ) => {
    if (!supabase) {
      return false;
    }

    setIsAuthLoading(true);
    setAuthError(null);
    setAuthMessage(null);

    try {
      const result = await command();

      if (result.error) {
        setAuthError(result.error);
        return false;
      }

      if (result.message) {
        setAuthMessage(result.message);
      }

      onSuccess?.();
      return true;
    } catch (error) {
      setAuthError(getUnexpectedAuthErrorMessage(error));
      return false;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const signIn = async (
    email: string,
    password: string,
    rememberSession = true,
  ) => {
    shouldPersistSession.current = rememberSession;
    const succeeded = await runAuthCommand(() =>
      signInWithEmail(email, password, rememberSession),
    );

    if (!succeeded) {
      shouldPersistSession.current = true;
    }
  };

  const signUp = async (email: string, password: string) => {
    await runAuthCommand(() => signUpWithEmail(email, password));
  };

  const resetPassword = async (email: string) => {
    await runAuthCommand(() => sendPasswordReset(email));
  };

  const updatePassword = async (password: string) => {
    await runAuthCommand(
      () => updateAccountPassword(password),
      () => {
        setAuthModeState("sign-in");
      },
    );
  };

  const signOut = async () => {
    shouldPersistSession.current = true;
    await runAuthCommand(signOutCurrentUser);
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
