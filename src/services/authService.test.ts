import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  clearPersistedSession: vi.fn(),
  clearTransientMarker: vi.fn(),
  clearTransientSessionIfNeeded: vi.fn(),
  getSession: vi.fn(),
  markTransientSession: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  rpc: vi.fn(),
  signUp: vi.fn(),
  updateUser: vi.fn(),
}));

vi.mock("../lib/supabase", () => ({
  clearPersistedSupabaseSession: mocks.clearPersistedSession,
  clearSupabaseSessionTransientMarker: mocks.clearTransientMarker,
  clearTransientSupabaseSessionIfNeeded: mocks.clearTransientSessionIfNeeded,
  markSupabaseSessionTransient: mocks.markTransientSession,
  supabase: {
    rpc: mocks.rpc,
    auth: {
      getSession: mocks.getSession,
      resetPasswordForEmail: mocks.resetPasswordForEmail,
      signInWithPassword: mocks.signInWithPassword,
      signOut: mocks.signOut,
      signUp: mocks.signUp,
      updateUser: mocks.updateUser,
    },
  },
}));

import {
  deleteCurrentAccount,
  loadInitialAuthSession,
  sendPasswordReset,
  signInWithEmail,
  signOutCurrentUser,
  signUpWithEmail,
  updateAccountPassword,
} from "./authService";

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.clearPersistedSession.mockResolvedValue(undefined);
    mocks.clearTransientMarker.mockResolvedValue(undefined);
    mocks.clearTransientSessionIfNeeded.mockResolvedValue(undefined);
    mocks.markTransientSession.mockResolvedValue(undefined);
  });

  it("clears a transient session before loading the current user", async () => {
    const user = { id: "user-1" };
    mocks.getSession.mockResolvedValue({
      data: { session: { user } },
      error: null,
    });

    await expect(loadInitialAuthSession()).resolves.toEqual({ user });
    expect(mocks.clearTransientSessionIfNeeded).toHaveBeenCalledOnce();
    expect(mocks.getSession).toHaveBeenCalledOnce();
  });

  it("marks a successful sign-in as transient when requested", async () => {
    mocks.signInWithPassword.mockResolvedValue({ error: null });

    await expect(
      signInWithEmail("user@example.com", "secret", false),
    ).resolves.toEqual({});
    expect(mocks.markTransientSession).toHaveBeenCalledOnce();
    expect(mocks.clearTransientMarker).not.toHaveBeenCalled();
  });

  it("clears the transient marker for a persistent sign-in", async () => {
    mocks.signInWithPassword.mockResolvedValue({ error: null });

    await signInWithEmail("user@example.com", "secret", true);

    expect(mocks.clearTransientMarker).toHaveBeenCalledOnce();
    expect(mocks.markTransientSession).not.toHaveBeenCalled();
  });

  it("maps known sign-in errors without changing session markers", async () => {
    mocks.signInWithPassword.mockResolvedValue({
      error: { message: "Invalid login credentials" },
    });

    await expect(
      signInWithEmail("user@example.com", "wrong", true),
    ).resolves.toEqual({ error: "Неверная почта или пароль." });
    expect(mocks.clearTransientMarker).not.toHaveBeenCalled();
    expect(mocks.markTransientSession).not.toHaveBeenCalled();
  });

  it("reports when sign-up requires email confirmation", async () => {
    mocks.signUp.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    await expect(
      signUpWithEmail("user@example.com", "secret"),
    ).resolves.toEqual({
      message: "Проверь почту и подтверди регистрацию.",
    });
  });

  it("returns confirmation messages for password operations", async () => {
    mocks.resetPasswordForEmail.mockResolvedValue({ error: null });
    mocks.updateUser.mockResolvedValue({ error: null });

    await expect(sendPasswordReset("user@example.com")).resolves.toEqual({
      message: "Отправили письмо для восстановления пароля.",
    });
    await expect(updateAccountPassword("new-secret")).resolves.toEqual({
      message: "Пароль обновлен.",
    });
  });

  it("signs out and clears local data after deleting the account", async () => {
    mocks.rpc.mockResolvedValue({ error: null });
    mocks.signOut.mockResolvedValue({ error: null });

    await expect(deleteCurrentAccount()).resolves.toEqual({
      message: "Аккаунт и все его данные удалены.",
    });
    expect(mocks.rpc).toHaveBeenCalledWith("delete_current_user");
    expect(mocks.signOut).toHaveBeenCalledOnce();
    expect(mocks.clearPersistedSession).toHaveBeenCalledOnce();
  });

  it("keeps the session when account deletion fails", async () => {
    mocks.rpc.mockResolvedValue({ error: { message: "No authenticated user" } });

    await expect(deleteCurrentAccount()).resolves.toEqual({
      error: "Сессия истекла. Войди заново и повтори удаление.",
    });
    expect(mocks.signOut).not.toHaveBeenCalled();
    expect(mocks.clearPersistedSession).not.toHaveBeenCalled();
  });

  it("clears persisted data only after a successful sign-out", async () => {
    mocks.signOut.mockResolvedValueOnce({ error: { message: "Offline" } });
    await expect(signOutCurrentUser()).resolves.toEqual({ error: "Offline" });
    expect(mocks.clearPersistedSession).not.toHaveBeenCalled();

    mocks.signOut.mockResolvedValueOnce({ error: null });
    await expect(signOutCurrentUser()).resolves.toEqual({});
    expect(mocks.clearPersistedSession).toHaveBeenCalledOnce();
  });
});
