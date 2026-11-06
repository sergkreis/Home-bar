import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AccountIsolationHookHarness, accountIsolationDeferred } from "./accountIsolationHookHarness";
import { getScopedStorageKey } from "../utils/persistedIds";
import { useFavorites } from "./useFavorites";
import { useSavedBar } from "./useSavedBar";
import type { Ingredient } from "../data/cocktails";

vi.mock("react", async () => (await import("./accountIsolationHookHarness")).accountIsolationReact);
const storage = vi.hoisted(() => ({ getItem: vi.fn(), setItem: vi.fn() }));
const remote = vi.hoisted(() => ({ load: vi.fn(), save: vi.fn() }));
vi.mock("@react-native-async-storage/async-storage", () => ({ default: storage }));
vi.mock("../services/userFavoritesService", () => ({ loadRemoteUserFavorites: remote.load, saveRemoteUserFavorites: remote.save }));

vi.mock("../services/userBarService", () => ({ loadRemoteUserBar: remote.load, saveRemoteUserBar: remote.save }));
const barBase = "domashniy-bar:selected-ingredients";
const ingredients = [{ id: "a" }, { id: "b" }, { id: "guest" }] as Ingredient[];
const base = "domashniy-bar:favorites";
const ids = ["a", "b", "guest"];
const cache = new Map<string, string>();
const harnesses: AccountIsolationHookHarness<unknown>[] = [];
function mountFavorites(initial: string | undefined = "A") {
  let userId: string | undefined = initial;
  const harness = new AccountIsolationHookHarness(() => useFavorites(ids, userId));
  harnesses.push(harness);
  harness.render();
  return { harness, switchTo: (next?: string) => { userId = next; harness.render(); } };
}
beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  cache.clear();
  cache.set(getScopedStorageKey(base, "A"), JSON.stringify(["a"]));
  storage.getItem.mockImplementation(async (key: string) => cache.get(key) ?? null);
  storage.setItem.mockImplementation(async (key: string, value: string) => { cache.set(key, value); });
  // Keep remote reads pending so this suite isolates local persistence.
  remote.load.mockImplementation(() => new Promise(() => {}));
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(async () => {
  harnesses.splice(0).forEach((harness) => harness.unmount());
  await Promise.resolve();
  vi.useRealTimers();
  vi.restoreAllMocks();
});
describe("favorites account cache isolation", () => {
  it.each([undefined, "B"])("does not write A favorites into %s during its pending cache read", async (destination) => {
    const { harness, switchTo } = mountFavorites();
    await harness.settle();
    expect(harness.result.favorites).toEqual(["a"]);
    const key = getScopedStorageKey(base, destination);
    cache.set(key, JSON.stringify(["guest"]));
    const read = accountIsolationDeferred<string | null>();
    storage.getItem.mockImplementation((requested: string) => requested === key ? read.promise : Promise.resolve(cache.get(requested) ?? null));
    storage.setItem.mockClear();
    switchTo(destination);
    await harness.settle();
    expect(storage.setItem.mock.calls.filter(([written]) => written === key)).toEqual([]);
    expect(cache.get(key)).toBe(JSON.stringify(["guest"]));
    read.resolve(JSON.stringify(["guest"]));
    await harness.settle();
    expect(harness.result.favorites).toEqual(["guest"]);
    expect(cache.get(key)).toBe(JSON.stringify(["guest"]));
  });
});

describe("favorites clears the previous account while loading", () => {
  it.each([undefined, "B"].flatMap((destination) => ["delayed", "failure", "invalid-json", "non-array"].map((mode) => ({ destination, mode }))))("does not retain A after $mode read for $destination", async ({ mode, destination }) => {
    const { harness, switchTo } = mountFavorites();
    await harness.settle();
    const read = accountIsolationDeferred<string | null>();
    storage.getItem.mockReturnValue(read.promise);
    switchTo(destination);
    await harness.settle();
    if (mode === "failure") read.reject(new Error("offline"));
    if (mode === "invalid-json") read.resolve("{");
    if (mode === "non-array") read.resolve("{}");
    await harness.settle();
    expect(harness.result.favorites).toEqual([]);
    expect(harness.result.hasLoadedFavorites).toBe(mode !== "delayed");
    expect(storage.setItem.mock.calls.filter(([key, value]) => key === getScopedStorageKey(base, destination) && value === JSON.stringify(["a"]))).toEqual([]);
  });
});

function mountBar() {
  let userId: string | undefined = "A";
  cache.set(getScopedStorageKey(barBase, "A"), JSON.stringify(["a"]));
  const harness = new AccountIsolationHookHarness(() => useSavedBar(ingredients, userId));
  harnesses.push(harness);
  harness.render();
  return { harness, switchTo: (next?: string) => { userId = next; harness.render(); } };
}
describe("saved bar account cache isolation", () => {
  it.each([undefined, "B"])("does not persist A into %s while a read is pending", async (destination) => {
    const { harness, switchTo } = mountBar();
    await harness.settle();
    expect(harness.result.selectedIngredients).toEqual(["a"]);
    const key = getScopedStorageKey(barBase, destination);
    cache.set(key, JSON.stringify(["guest"]));
    const read = accountIsolationDeferred<string | null>();
    storage.getItem.mockReturnValue(read.promise);
    storage.setItem.mockClear();
    switchTo(destination);
    await harness.settle();
    await vi.advanceTimersByTimeAsync(1000);
    await harness.settle();
    expect(storage.setItem.mock.calls.filter(([written]) => written === key)).toEqual([]);
    expect(cache.get(key)).toBe(JSON.stringify(["guest"]));
    read.resolve(JSON.stringify(["guest"]));
    await harness.settle();
    await vi.advanceTimersByTimeAsync(250);
    await harness.settle();
    expect(harness.result.selectedIngredients).toEqual(["guest"]);
    expect(cache.get(key)).toBe(JSON.stringify(["guest"]));
  });
  it.each([undefined, "B"].flatMap((destination) => ["delayed", "failure", "invalid-json", "non-array"].map((mode) => ({ destination, mode }))))("does not retain A after $mode read for $destination", async ({ mode, destination }) => {
    const { harness, switchTo } = mountBar();
    await harness.settle();
    expect(harness.result.hasSavedBar).toBe(true);
    const read = accountIsolationDeferred<string | null>();
    storage.getItem.mockReturnValue(read.promise);
    switchTo(destination);
    await harness.settle();
    if (mode === "failure") read.reject(new Error("offline"));
    if (mode === "invalid-json") read.resolve("{");
    if (mode === "non-array") read.resolve("{}");
    await harness.settle();
    await vi.advanceTimersByTimeAsync(1000);
    await harness.settle();
    expect(harness.result.selectedIngredients).toEqual([]);
    expect(harness.result.hasSavedBar).toBe(false);
    expect(harness.result.hasLoadedSavedBar).toBe(mode !== "delayed");
    expect(storage.setItem.mock.calls.filter(([key, value]) => key === getScopedStorageKey(barBase, destination) && value === JSON.stringify(["a"]))).toEqual([]);
  });
});

describe.each(["favorites", "bar"])("%s delayed source reads", (kind) => {
  it.each(["success", "failure"])("ignores obsolete A read %s after B is loaded", async (outcome) => {
    const oldRead = accountIsolationDeferred<string | null>();
    const storageBase = kind === "favorites" ? base : barBase;
    cache.set(getScopedStorageKey(storageBase, "B"), JSON.stringify(["b"]));
    storage.getItem.mockImplementation((key: string) => key === getScopedStorageKey(storageBase, "A") ? oldRead.promise : Promise.resolve(cache.get(key) ?? null));
    const mounted = kind === "favorites" ? mountFavorites() : mountBar();
    mounted.switchTo("B");
    await mounted.harness.settle();
    if (outcome === "success") oldRead.resolve(JSON.stringify(["a"]));
    else oldRead.reject(new Error("old read failed"));
    await mounted.harness.settle();
    await vi.advanceTimersByTimeAsync(1000);
    await mounted.harness.settle();
    const result = mounted.harness.result;
    expect("favorites" in result ? result.favorites : result.selectedIngredients).toEqual(["b"]);
    expect(cache.get(getScopedStorageKey(storageBase, "B"))).toBe(JSON.stringify(["b"]));
  });
  it("uses remote data authoritatively and persists later user edits only for the current account", async () => {
    remote.load.mockResolvedValue({ cocktailIds: ["b"], ingredientIds: ["b"], updatedAt: "version-b" });
    remote.save.mockResolvedValue(null);
    const mounted = kind === "favorites" ? mountFavorites() : mountBar();
    await mounted.harness.settle();
    const result = mounted.harness.result;
    expect("favorites" in result ? result.favorites : result.selectedIngredients).toEqual(["b"]);
    if ("toggleFavorite" in result) result.toggleFavorite("guest");
    else result.setSelectedIngredients(["b", "guest"]);
    mounted.harness.flush();
    await vi.advanceTimersByTimeAsync(1000);
    await mounted.harness.settle();
    const storageBase = kind === "favorites" ? base : barBase;
    expect(cache.get(getScopedStorageKey(storageBase, "A"))).toBe(JSON.stringify(["b", "guest"]));
    expect(remote.save).toHaveBeenCalledWith("A", ["b", "guest"], "version-b");
    expect(cache.has(storageBase)).toBe(false);
  });
});
