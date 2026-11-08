import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AccountIsolationHookHarness, accountIsolationDeferred } from "./accountIsolationHookHarness";
import { useUserProfile } from "./useUserProfile";
import type { UserProfile } from "../services/userProfileService";
vi.mock("react", async () => {
  const hooks = (await import("./accountIsolationHookHarness")).accountIsolationReact;
  return { ...hooks, useLayoutEffect: hooks.useEffect };
});
const remote = vi.hoisted(() => ({ load: vi.fn(), save: vi.fn() }));
vi.mock("../services/userProfileService", () => ({ loadRemoteUserProfile: remote.load, saveRemoteUserProfile: remote.save }));
const profile = (name: string): UserProfile => ({ birthDate: "", displayName: name, updatedAt: name });
const harnesses: AccountIsolationHookHarness<unknown>[] = [];
function mountProfile() {
  let userId: string | undefined = "A";
  let ready = true;
  const harness = new AccountIsolationHookHarness(() => useUserProfile(userId, ready));
  harnesses.push(harness);
  harness.render();
  return {
    harness,
    switchTo: (next?: string, authReady = true) => { userId = next; ready = authReady; harness.render(); },
  };
}
beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  remote.load.mockImplementation(async (id: string) => profile(id));
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  harnesses.splice(0).forEach((harness) => harness.unmount());
  vi.useRealTimers();
  vi.restoreAllMocks();
});
describe("profile save lifetime isolation", () => {
  it.each([
    ["logout", "success"], ["logout", "error"],
    ["switch", "success"], ["switch", "error"],
    ["return-to-A", "success"], ["return-to-A", "error"],
    ["unmount", "success"], ["unmount", "error"],
  ])("ignores stale %s save %s", async (transition, outcome) => {
    const { harness, switchTo } = mountProfile();
    await harness.settle();
    const save = accountIsolationDeferred<UserProfile | null>();
    remote.save.mockReturnValue(save.promise);
    const saving = harness.result.saveProfile({ birthDate: "", displayName: "obsolete" });
    harness.flush();
    if (transition === "logout") switchTo(undefined);
    else if (transition === "unmount") harness.unmount();
    else {
      switchTo("B");
      await harness.settle();
      if (transition === "return-to-A") switchTo("A");
    }
    await harness.settle();
    const expected = { ...harness.result };
    if (outcome === "success") save.resolve(profile("obsolete"));
    else save.reject(new Error("obsolete save failed"));
    await saving;
    await harness.settle();
    expect(harness.result.profile).toEqual(expected.profile);
    expect(harness.result.profileMessage).toBe(expected.profileMessage);
    expect(harness.result.profileError).toBe(expected.profileError);
    expect(harness.result.profileSyncStatus).toBe(expected.profileSyncStatus);
    expect(harness.stateUpdatesAfterUnmount).toBe(0);
  });
});

describe("profile save current lifetime", () => {
  it.each(["success", "error", "null"])("keeps current save %s behavior", async (outcome) => {
    const { harness } = mountProfile();
    await harness.settle();
    if (outcome === "error") remote.save.mockRejectedValue(new Error("current failure"));
    else remote.save.mockResolvedValue(outcome === "null" ? null : profile("current"));
    await harness.result.saveProfile({ birthDate: " ", displayName: " current " });
    await harness.settle();
    expect(remote.save).toHaveBeenCalledWith("A", { birthDate: "", displayName: "current" });
    if (outcome === "error") {
      expect(harness.result.profileError).not.toBeNull();
      expect(harness.result.profileSyncStatus).toBe("error");
    } else {
      expect(harness.result.profile.displayName).toBe("current");
      expect(harness.result.profileMessage).not.toBeNull();
      expect(harness.result.profileSyncStatus).toBe("saved");
      await vi.advanceTimersByTimeAsync(3000);
      await harness.settle();
      expect(harness.result.profileSyncStatus).toBe("idle");
      expect(harness.result.profileMessage).toBeNull();
    }
  });
  it.each(["success", "error"])("invalidates pending save %s when auth readiness changes", async (outcome) => {
    const { harness, switchTo } = mountProfile();
    await harness.settle();
    const pending = accountIsolationDeferred<UserProfile | null>();
    remote.save.mockReturnValue(pending.promise);
    const saving = harness.result.saveProfile(profile("obsolete"));
    switchTo("A", false);
    switchTo("A", true);
    await harness.settle();
    if (outcome === "success") pending.resolve(profile("obsolete"));
    else pending.reject(new Error("obsolete error"));
    await saving;
    await harness.settle();
    expect(harness.result.profile).toEqual(profile("A"));
    expect(harness.result.profileError).toBeNull();
    expect(harness.result.profileMessage).toBeNull();
    expect(harness.result.profileSyncStatus).toBe("idle");
  });
});
