import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
}));

vi.mock("../lib/supabase", () => ({
  supabase: { from: mocks.from },
}));

import { loadRemoteUserBar, saveRemoteUserBar } from "./userBarService";
import {
  loadRemoteUserFavorites,
  saveRemoteUserFavorites,
} from "./userFavoritesService";

type QueryResult = {
  data: unknown;
  error: unknown;
};

function createQuery(result: QueryResult) {
  const query = {
    eq: vi.fn(),
    insert: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue(result),
    select: vi.fn(),
    update: vi.fn(),
  };

  query.eq.mockReturnValue(query);
  query.insert.mockReturnValue(query);
  query.select.mockReturnValue(query);
  query.update.mockReturnValue(query);

  return query;
}

describe("remote synchronization services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps a remote home bar row to the application model", async () => {
    mocks.from.mockReturnValue(
      createQuery({
        data: {
          ingredient_ids: ["gin", "lime"],
          updated_at: "2026-07-10T10:00:00.000Z",
        },
        error: null,
      }),
    );

    await expect(loadRemoteUserBar("user-1")).resolves.toEqual({
      ingredientIds: ["gin", "lime"],
      updatedAt: "2026-07-10T10:00:00.000Z",
    });
    expect(mocks.from).toHaveBeenCalledWith("user_bars");
  });

  it("returns the current home bar after an insert conflict", async () => {
    const insertQuery = createQuery({
      data: null,
      error: { code: "23505" },
    });
    const loadQuery = createQuery({
      data: {
        ingredient_ids: ["rum"],
        updated_at: "2026-07-10T11:00:00.000Z",
      },
      error: null,
    });
    mocks.from
      .mockReturnValueOnce(insertQuery)
      .mockReturnValueOnce(loadQuery);

    await expect(
      saveRemoteUserBar("user-1", ["gin"], null),
    ).resolves.toEqual({
      status: "conflict",
      bar: {
        ingredientIds: ["rum"],
        updatedAt: "2026-07-10T11:00:00.000Z",
      },
    });
  });

  it("returns a successfully updated home bar", async () => {
    const query = createQuery({
      data: {
        ingredient_ids: ["gin", "tonic"],
        updated_at: "2026-07-10T12:00:00.000Z",
      },
      error: null,
    });
    mocks.from.mockReturnValue(query);

    await expect(
      saveRemoteUserBar(
        "user-1",
        ["gin", "tonic"],
        "2026-07-10T11:00:00.000Z",
      ),
    ).resolves.toEqual({
      status: "saved",
      bar: {
        ingredientIds: ["gin", "tonic"],
        updatedAt: "2026-07-10T12:00:00.000Z",
      },
    });
    expect(query.eq).toHaveBeenCalledWith(
      "updated_at",
      "2026-07-10T11:00:00.000Z",
    );
  });

  it("maps a remote favorites row to the application model", async () => {
    mocks.from.mockReturnValue(
      createQuery({
        data: {
          cocktail_ids: ["negroni", "gimlet"],
          updated_at: "2026-07-10T13:00:00.000Z",
        },
        error: null,
      }),
    );

    await expect(loadRemoteUserFavorites("user-1")).resolves.toEqual({
      cocktailIds: ["negroni", "gimlet"],
      updatedAt: "2026-07-10T13:00:00.000Z",
    });
    expect(mocks.from).toHaveBeenCalledWith("user_favorites");
  });

  it("returns the current favorites after an optimistic update conflict", async () => {
    const updateQuery = createQuery({ data: null, error: null });
    const loadQuery = createQuery({
      data: {
        cocktail_ids: ["martini"],
        updated_at: "2026-07-10T14:00:00.000Z",
      },
      error: null,
    });
    mocks.from
      .mockReturnValueOnce(updateQuery)
      .mockReturnValueOnce(loadQuery);

    await expect(
      saveRemoteUserFavorites(
        "user-1",
        ["negroni"],
        "2026-07-10T13:00:00.000Z",
      ),
    ).resolves.toEqual({
      status: "conflict",
      favorites: {
        cocktailIds: ["martini"],
        updatedAt: "2026-07-10T14:00:00.000Z",
      },
    });
  });

  it("throws remote favorites errors instead of reporting a false save", async () => {
    mocks.from.mockReturnValue(
      createQuery({ data: null, error: new Error("Network unavailable") }),
    );

    await expect(
      saveRemoteUserFavorites("user-1", ["negroni"], null),
    ).rejects.toThrow("Network unavailable");
  });
});
