import { describe, expect, it } from "vitest";

import { buildCocktailPath, buildTabPath, parseAppPath } from "./appNavigation";

describe("app navigation", () => {
  it("maps top-level tabs to stable paths", () => {
    expect(buildTabPath("today")).toBe("/today");
    expect(buildTabPath("favorites")).toBe("/favorites");
    expect(parseAppPath("/recipes")).toEqual({ cocktailId: null, tab: "recipes" });
  });

  it("round-trips encoded cocktail ids", () => {
    const path = buildCocktailPath("dry martini");

    expect(path).toBe("/cocktails/dry%20martini");
    expect(parseAppPath(path)).toEqual({ cocktailId: "dry martini", tab: "today" });
  });

  it("falls back to today for unknown or malformed paths", () => {
    expect(parseAppPath("/unknown")).toEqual({ cocktailId: null, tab: "today" });
    expect(parseAppPath("/cocktails/%E0%A4%A")).toEqual({ cocktailId: null, tab: "today" });
  });
});
