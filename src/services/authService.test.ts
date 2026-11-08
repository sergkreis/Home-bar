import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  clearAccountCaches: vi.fn(),
  addEventListener: vi.fn(),
  getInitialURL: vi.fn(),
  removeUrlListener: vi.fn(),
  exchangeCodeForSession: vi.fn(),
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

vi.mock("react-native", () => ({ Platform: { OS: "android" }, Linking: { addEventListener: mocks.addEventListener, getInitialURL: mocks.getInitialURL } }));
vi.mock("./accountCache", () => ({ clearAccountCaches: mocks.clearAccountCaches }));
vi.mock("../lib/supabase", () => ({
  clearPersistedSupabaseSession: mocks.clearPersistedSession,
  clearSupabaseSessionTransientMarker: mocks.clearTransientMarker,
  clearTransientSupabaseSessionIfNeeded: mocks.clearTransientSessionIfNeeded,
  markSupabaseSessionTransient: mocks.markTransientSession,
  supabase: {
    rpc: mocks.rpc,
    auth: {
      exchangeCodeForSession: mocks.exchangeCodeForSession,
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
  handleNativeAuthUrl,
  subscribeNativeAuthUrls,
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
    mocks.clearAccountCaches.mockResolvedValue(undefined);
    mocks.getSession.mockResolvedValue({ data: { session: { user: { id: "user-1" } } }, error: null });
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
    expect(mocks.signUp.mock.calls[0][0].options.emailRedirectTo).toBe("inmybar://auth/callback");
  });

  it("returns confirmation messages for password operations", async () => {
    mocks.resetPasswordForEmail.mockResolvedValue({ error: null });
    mocks.updateUser.mockResolvedValue({ error: null });

    await expect(sendPasswordReset("user@example.com")).resolves.toEqual({
      message: "Отправили письмо для восстановления пароля.",
    });
    expect(mocks.resetPasswordForEmail.mock.calls[0][1].redirectTo).toBe("inmybar://auth/callback");
    await expect(updateAccountPassword("new-secret")).resolves.toEqual({
      message: "Пароль обновлен.",
    });
  });

  it("signs out and clears local data after deleting the account", async () => {
    mocks.rpc.mockResolvedValue({ error: null });
    mocks.signOut.mockResolvedValue({ error: null });

    await expect(deleteCurrentAccount()).resolves.toEqual({
      message: "Аккаунт и локальные данные аккаунта удалены.",
    });
    expect(mocks.rpc).toHaveBeenCalledWith("delete_current_user");
    expect(mocks.signOut).toHaveBeenCalledOnce();
    expect(mocks.clearPersistedSession).toHaveBeenCalledOnce();
    expect(mocks.clearAccountCaches).toHaveBeenCalledWith("user-1");
  });

  it("keeps the session when account deletion fails", async () => {
    mocks.rpc.mockResolvedValue({ error: { message: "No authenticated user" } });

    await expect(deleteCurrentAccount()).resolves.toEqual({
      error: "Сессия истекла. Войди заново и повтори удаление.",
    });
    expect(mocks.signOut).not.toHaveBeenCalled();
    expect(mocks.clearPersistedSession).not.toHaveBeenCalled();
    expect(mocks.clearAccountCaches).not.toHaveBeenCalled();
  });

  it("does not claim complete deletion if local cleanup fails after RPC", async () => {
    mocks.rpc.mockResolvedValue({ error: null });
    mocks.signOut.mockResolvedValue({ error: null });
    mocks.clearAccountCaches.mockRejectedValueOnce(new Error("disk"));
    await expect(deleteCurrentAccount()).resolves.toEqual({
      error: "Аккаунт удалён на сервере, но данные на устройстве очистить не удалось. Очисти данные приложения в настройках Android.",
    });
  });

  it("clears persisted data only after a successful sign-out", async () => {
    mocks.signOut.mockResolvedValueOnce({ error: { message: "Offline" } });
    await expect(signOutCurrentUser()).resolves.toEqual({ error: "Offline" });
    expect(mocks.clearPersistedSession).not.toHaveBeenCalled();

    mocks.signOut.mockResolvedValueOnce({ error: null });
    await expect(signOutCurrentUser()).resolves.toEqual({});
    expect(mocks.clearPersistedSession).toHaveBeenCalledOnce();
    expect(mocks.clearAccountCaches).toHaveBeenCalledWith("user-1");
  });

  it("exchanges only the matching native PKCE callback", async () => {
    mocks.exchangeCodeForSession.mockResolvedValue({ error: null });
    await expect(handleNativeAuthUrl("https://other.test/?code=bad")).resolves.toEqual({});
    await expect(handleNativeAuthUrl("inmybar://auth/callback?code=once")).resolves.toEqual({});
    expect(mocks.exchangeCodeForSession).toHaveBeenCalledExactlyOnceWith("once");
    await expect(handleNativeAuthUrl("inmybar://auth/callback?error_code=access_denied")).resolves.toEqual({ error: "Ссылка недействительна: access_denied" });
  });
});


describe("native auth URL subscription", () => {
  const callbackUrl = "inmybar://auth/callback?code=retry";

  function emitUrl(url = callbackUrl) {
    const listener = mocks.addEventListener.mock.calls[0][1] as (event: { url: string }) => void;
    listener({ url });
  }

  beforeEach(() => {
    vi.resetAllMocks();
    mocks.getInitialURL.mockResolvedValue(null);
    mocks.addEventListener.mockReturnValue({ remove: mocks.removeUrlListener });
    mocks.exchangeCodeForSession.mockResolvedValue({ error: null });
  });

  it.each(["rejection", "error result"])("allows the same callback to retry after an exchange %s", async (failure) => {
    mocks.getInitialURL.mockResolvedValue(callbackUrl);
    if (failure === "rejection") {
      mocks.exchangeCodeForSession.mockRejectedValueOnce(new Error("offline"));
    } else {
      mocks.exchangeCodeForSession.mockResolvedValueOnce({ error: { message: "offline" } });
    }
    const onResult = vi.fn();
    const unsubscribe = subscribeNativeAuthUrls(onResult);
    try {
      await vi.waitFor(() => expect(onResult).toHaveBeenCalledWith({
        error: failure === "rejection"
          ? "Не удалось обработать ссылку. Запроси новое письмо."
          : "Не удалось подтвердить ссылку: offline",
      }));
      emitUrl();
      await vi.waitFor(() => expect(onResult).toHaveBeenLastCalledWith({}));
      expect(mocks.exchangeCodeForSession).toHaveBeenCalledTimes(2);
      expect(mocks.exchangeCodeForSession).toHaveBeenLastCalledWith("retry");
    } finally {
      unsubscribe();
    }
  });

  it("deduplicates an in-flight URL even when another callback arrives", async () => {
    let finish!: (result: { error: null }) => void;
    mocks.exchangeCodeForSession.mockReturnValueOnce(new Promise((resolve) => { finish = resolve; }));
    const onResult = vi.fn();
    const unsubscribe = subscribeNativeAuthUrls(onResult);
    try {
      expect(mocks.addEventListener).toHaveBeenCalledWith("url", expect.any(Function));
      emitUrl();
      emitUrl("inmybar://auth/callback?code=other");
      emitUrl();
      expect(mocks.exchangeCodeForSession).toHaveBeenCalledTimes(2);
      finish({ error: null });
      await vi.waitFor(() => expect(onResult).toHaveBeenCalledTimes(2));
    } finally {
      finish({ error: null });
      unsubscribe();
    }
  });


  it("keeps completed successes deduplicated across cold and warm callbacks", async () => {
    mocks.getInitialURL.mockResolvedValue(callbackUrl);
    const onResult = vi.fn();
    const unsubscribe = subscribeNativeAuthUrls(onResult);
    try {
      await vi.waitFor(() => expect(onResult).toHaveBeenCalledOnce());
      emitUrl();
      emitUrl("inmybar://auth/callback?code=other");
      await vi.waitFor(() => expect(onResult).toHaveBeenCalledTimes(2));
      emitUrl();
      expect(mocks.exchangeCodeForSession).toHaveBeenCalledTimes(2);
    } finally {
      unsubscribe();
    }
  });

  it.each(["rejection", "error result"])("an older %s does not release a newer pending callback", async (failure) => {
    let rejectOlder!: (reason: Error) => void;
    let finishOlder!: (result: { error: { message: string } }) => void;
    let finishNewer!: (result: { error: null }) => void;
    mocks.exchangeCodeForSession
      .mockReturnValueOnce(new Promise((resolve, reject) => {
        finishOlder = resolve; rejectOlder = reject;
      }))
      .mockReturnValueOnce(new Promise((resolve) => { finishNewer = resolve; }));
    const onResult = vi.fn();
    const unsubscribe = subscribeNativeAuthUrls(onResult);
    try {
      emitUrl();
      emitUrl("inmybar://auth/callback?code=newer");
      if (failure === "rejection") rejectOlder(new Error("offline"));
      else finishOlder({ error: { message: "offline" } });
      await vi.waitFor(() => expect(onResult).toHaveBeenCalledOnce());
      emitUrl("inmybar://auth/callback?code=newer");
      expect(mocks.exchangeCodeForSession).toHaveBeenCalledTimes(2);
      emitUrl();
      expect(mocks.exchangeCodeForSession).toHaveBeenCalledTimes(3);
      finishNewer({ error: null });
      await vi.waitFor(() => expect(onResult).toHaveBeenCalledTimes(3));
      emitUrl("inmybar://auth/callback?code=newer");
      emitUrl();
      expect(mocks.exchangeCodeForSession).toHaveBeenCalledTimes(3);
    } finally {
      finishNewer({ error: null });
      unsubscribe();
    }
  });

  it("ignores a queued native URL event after unsubscribe", () => {
    const onResult = vi.fn();
    const unsubscribe = subscribeNativeAuthUrls(onResult);
    unsubscribe();
    expect(mocks.removeUrlListener).toHaveBeenCalledOnce();
    emitUrl();
    expect(mocks.exchangeCodeForSession).not.toHaveBeenCalled();
    expect(onResult).not.toHaveBeenCalled();
  });


  it("ignores a late initial URL after unsubscribe", async () => {
    let finishInitialUrl!: (url: string) => void;
    mocks.getInitialURL.mockReturnValueOnce(new Promise((resolve) => { finishInitialUrl = resolve; }));
    const onResult = vi.fn();
    const unsubscribe = subscribeNativeAuthUrls(onResult);
    expect(mocks.getInitialURL).toHaveBeenCalledOnce();
    unsubscribe();
    finishInitialUrl(callbackUrl);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(mocks.exchangeCodeForSession).not.toHaveBeenCalled();
    expect(onResult).not.toHaveBeenCalled();
  });

  it.each(["success", "error result", "rejection"])("does not deliver a late exchange %s after unsubscribe", async (outcome) => {
    let finish!: (result: { error: null | { message: string } }) => void;
    let reject!: (reason: Error) => void;
    mocks.exchangeCodeForSession.mockReturnValueOnce(new Promise((resolve, rejectPromise) => {
      finish = resolve; reject = rejectPromise;
    }));
    const onResult = vi.fn();
    const unsubscribe = subscribeNativeAuthUrls(onResult);
    emitUrl();
    expect(mocks.exchangeCodeForSession).toHaveBeenCalledOnce();
    unsubscribe();
    if (outcome === "rejection") reject(new Error("offline"));
    else finish({ error: outcome === "success" ? null : { message: "offline" } });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(onResult).not.toHaveBeenCalled();
  });

});
