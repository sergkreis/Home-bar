import { beforeEach, describe, expect, it, vi } from "vitest";

const storage = vi.hoisted(() => ({
  setItem: vi.fn(), removeItem: vi.fn(),
}));
vi.mock("@react-native-async-storage/async-storage", () => ({ default: storage }));
import { activateAccountCache, clearAccountCaches, writeAccountCache } from "./accountCache";

beforeEach(() => {
  vi.clearAllMocks();
  storage.setItem.mockResolvedValue(undefined);
  storage.removeItem.mockResolvedValue(undefined);
});

describe("account-scoped cache cleanup", () => {
  it("removes only the signed-out user's bar and favorites, not guest or other accounts", async () => {
    activateAccountCache("alice");
    await writeAccountCache("domashniy-bar:favorites", "alice", '["drink"]');
    await clearAccountCaches("alice");
    expect(storage.removeItem.mock.calls.map(([key]) => key).sort()).toEqual([
      "domashniy-bar:favorites:user:alice", "domashniy-bar:selected-ingredients:user:alice",
    ]);
    await writeAccountCache("domashniy-bar:favorites", "alice", '["late"]');
    expect(storage.setItem).toHaveBeenCalledTimes(1);
    await writeAccountCache("domashniy-bar:favorites", undefined, '["guest"]');
    expect(storage.setItem).toHaveBeenLastCalledWith("domashniy-bar:favorites", '["guest"]');
  });

  it("waits for an in-flight write before removal and blocks late writes until new login", async () => {
    activateAccountCache("bob");
    let finish!: () => void;
    storage.setItem.mockImplementationOnce(() => new Promise<void>((resolve) => { finish = resolve; }));
    const writing = writeAccountCache("domashniy-bar:selected-ingredients", "bob", '["gin"]');
    await vi.waitFor(() => expect(storage.setItem).toHaveBeenCalledOnce());
    const clearing = clearAccountCaches("bob");
    expect(storage.removeItem).not.toHaveBeenCalled();
    finish();
    await Promise.all([writing, clearing]);
    expect(storage.removeItem).toHaveBeenCalledTimes(2);
    activateAccountCache("bob");
    await writeAccountCache("domashniy-bar:favorites", "bob", '["fresh"]');
    expect(storage.setItem).toHaveBeenCalledTimes(2);
  });

  it("rejects unscoped deletion", async () => {
    await expect(clearAccountCaches("")).rejects.toThrow();
    expect(storage.removeItem).not.toHaveBeenCalled();
  });
});
