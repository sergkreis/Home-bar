import { describe, expect, it } from "vitest";

import {
  getScopedStorageKey,
  resolveAuthoritativeRemoteIds,
  uniqueKnownIds,
} from "./persistedIds";

const knownIds = new Set(["gin", "tonic", "lime"]);

describe("persisted id helpers", () => {
  it("keeps guest storage keys separate from account storage keys", () => {
    expect(getScopedStorageKey("domashniy-bar:favorites")).toBe("domashniy-bar:favorites");
    expect(getScopedStorageKey("domashniy-bar:favorites", "user-123")).toBe(
      "domashniy-bar:favorites:user:user-123",
    );
  });

  it("filters unknown ids and preserves first-seen known ids", () => {
    expect(uniqueKnownIds(["gin", "unknown", "tonic", "gin", 42, "lime"], knownIds)).toEqual([
      "gin",
      "tonic",
      "lime",
    ]);
  });

  it("treats missing or empty remote state as authoritative empty state", () => {
    expect(resolveAuthoritativeRemoteIds(null, knownIds)).toEqual([]);
    expect(resolveAuthoritativeRemoteIds(undefined, knownIds)).toEqual([]);
    expect(resolveAuthoritativeRemoteIds([], knownIds)).toEqual([]);
  });

  it("drops stale remote ids instead of keeping a phantom saved state", () => {
    expect(resolveAuthoritativeRemoteIds(["removed-ingredient", "also-removed"], knownIds)).toEqual([]);
  });

  it("sanitizes remote ids before saving them locally", () => {
    expect(resolveAuthoritativeRemoteIds(["unknown", "lime", "lime", "gin"], knownIds)).toEqual([
      "lime",
      "gin",
    ]);
  });
});
