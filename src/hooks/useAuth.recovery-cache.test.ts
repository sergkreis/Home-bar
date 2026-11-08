import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  effects: [] as Array<() => void | (() => void)>,
  onAuthStateChange: vi.fn(), getSession: vi.fn(), signOut: vi.fn(),
  setItem: vi.fn(), removeItem: vi.fn(), unsubscribe: vi.fn(),
}));

// Simulate React lifecycle only: auth and cache services remain real.
vi.mock("react", () => ({
  useEffect: (effect: () => void | (() => void)) => mocks.effects.push(effect),
  useRef: (current: unknown) => ({ current }),
  useState: (initial: unknown) => [initial, vi.fn()],
}));
vi.mock("react-native", () => ({ Platform: { OS: "web" }, Linking: {} }));
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: { setItem: mocks.setItem, removeItem: mocks.removeItem },
}));
vi.mock("../lib/supabase", () => ({
  isSupabaseConfigured: true,
  clearTransientSupabaseSessionIfNeeded: vi.fn().mockResolvedValue(undefined),
  clearPersistedSupabaseSession: vi.fn().mockResolvedValue(undefined),
  markSupabaseSessionTransient: vi.fn().mockResolvedValue(undefined),
  supabase: { auth: {
    onAuthStateChange: mocks.onAuthStateChange,
    getSession: mocks.getSession, signOut: mocks.signOut,
  } },
}));

import { useAuth } from "./useAuth";
import { writeAccountCache } from "../services/accountCache";
import { getScopedStorageKey } from "../utils/persistedIds";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.effects.length = 0;
  mocks.setItem.mockResolvedValue(undefined);
  mocks.removeItem.mockResolvedValue(undefined);
  mocks.getSession.mockResolvedValue({
    data: { session: { user: { id: "recovery-cache-user" } } }, error: null,
  });
  mocks.signOut.mockResolvedValue({ error: null });
  mocks.onAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: mocks.unsubscribe } },
  });
});

it("PASSWORD_RECOVERY re-enables account cache writes after logout", async () => {
  const auth = useAuth();
  const cleanups = mocks.effects.map((effect) => effect());
  const onAuthStateChange = mocks.onAuthStateChange.mock.calls[0][0] as (
    event: AuthChangeEvent, session: Session | null,
  ) => void;
  const baseKey = "domashniy-bar:favorites";
  const userId = "recovery-cache-user";
  try {
    // Initial activation must finish before logout.
    await writeAccountCache(baseKey, userId, "before-logout");
    expect(mocks.setItem).toHaveBeenCalledOnce();
    await auth.signOut();
    onAuthStateChange("SIGNED_OUT", null);
    expect(mocks.removeItem).toHaveBeenCalledTimes(2);
    mocks.setItem.mockClear();
    await writeAccountCache(baseKey, userId, "stale-write");
    expect(mocks.setItem).not.toHaveBeenCalled();

    onAuthStateChange("PASSWORD_RECOVERY", { user: { id: userId } } as Session);
    await writeAccountCache(baseKey, userId, "after-recovery");
    expect(mocks.setItem).toHaveBeenCalledExactlyOnceWith(
      getScopedStorageKey(baseKey, userId), "after-recovery",
    );
  } finally {
    cleanups.forEach((cleanup) => cleanup?.());
  }
});
