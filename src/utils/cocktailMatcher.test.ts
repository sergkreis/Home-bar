import { describe, expect, it } from "vitest";

import type { Cocktail, Ingredient } from "../data/types";
import { rankCocktails } from "./cocktailMatcher";

const sampleIngredients: Ingredient[] = [
  { id: "gin", name: "Джин", category: "spirit" },
  { id: "tonic", name: "Тоник", category: "mixer" },
  { id: "lime", name: "Лайм", category: "citrus" },
  { id: "vodka", name: "Водка", category: "spirit" },
  { id: "lime-wedge", name: "Долька лайма", category: "garnish", isGarnish: true },
  { id: "mint-leaves", name: "Листья мяты", category: "garnish", isOptionalDefault: true },
];

function makeCocktail(
  id: string,
  ingredients: string[],
  taste: Cocktail["taste"] = ["refreshing"],
): Cocktail {
  return {
    id,
    name: id,
    baseSpirit: "gin",
    taste,
    strength: "medium",
    glassName: "highball",
    steps: ["mix"],
    ingredients,
    recipeIngredients: ingredients.map((ingredientId) => ({ ingredientId, amount: "30ml" })),
  };
}

describe("rankCocktails", () => {
  it("returns 100% match when all required ingredients are owned", () => {
    const cocktails = [makeCocktail("gin-tonic", ["gin", "tonic", "lime-wedge"])];
    const result = rankCocktails(cocktails, ["gin", "tonic"], null, sampleIngredients);

    expect(result).toHaveLength(1);
    expect(result[0].matchRatio).toBe(1);
    expect(result[0].missingIngredients).toHaveLength(0);
  });

  it("ignores garnish ingredients when ranking", () => {
    // lime-wedge is a garnish — not owning it shouldn't block a 100% match
    const cocktails = [makeCocktail("gin-tonic", ["gin", "tonic", "lime-wedge"])];
    const result = rankCocktails(cocktails, ["gin", "tonic"], null, sampleIngredients);

    expect(result[0].matchRatio).toBe(1);
  });

  it("ignores optional-default ingredients", () => {
    // mint-leaves is optionalDefault — shouldn't block a match
    const cocktails = [makeCocktail("mojito", ["white-rum", "lime", "mint-leaves"])];
    const result = rankCocktails(cocktails, ["white-rum", "lime"], null, [
      ...sampleIngredients,
      { id: "white-rum", name: "Белый ром", category: "spirit" },
    ]);

    expect(result[0].matchRatio).toBe(1);
  });

  it("reports correct missing ingredients", () => {
    const cocktails = [makeCocktail("gin-tonic", ["gin", "tonic"])];
    const result = rankCocktails(cocktails, ["gin"], null, sampleIngredients);

    expect(result[0].missingIngredients).toEqual(["tonic"]);
    expect(result[0].availableCount).toBe(1);
    expect(result[0].matchRatio).toBe(0.5);
  });

  it("sorts by match ratio descending", () => {
    const cocktails = [
      makeCocktail("a-half-match", ["gin", "tonic"]),
      makeCocktail("z-full-match", ["gin"]),
    ];
    const result = rankCocktails(cocktails, ["gin"], null, sampleIngredients);

    // z-full-match has higher matchRatio, should come first
    expect(result[0].id).toBe("z-full-match");
    expect(result[1].id).toBe("a-half-match");
  });

  it("breaks ties by missing count, then alphabetically", () => {
    const cocktails = [
      makeCocktail("z-cocktail", ["gin", "tonic"]),
      makeCocktail("a-cocktail", ["gin", "tonic"]),
    ];
    const result = rankCocktails(cocktails, ["gin"], null, sampleIngredients);

    // Same ratio, same missing count — alphabetical
    expect(result[0].id).toBe("a-cocktail");
    expect(result[1].id).toBe("z-cocktail");
  });

  it("filters by taste tag when activeTaste is set", () => {
    const cocktails = [
      makeCocktail("refresh", ["gin"], ["refreshing"]),
      makeCocktail("strong", ["vodka"], ["strong"]),
    ];
    const result = rankCocktails(cocktails, [], "refreshing", sampleIngredients);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("refresh");
  });

  it("returns empty array when no cocktails match the taste filter", () => {
    const cocktails = [makeCocktail("refresh", ["gin"], ["refreshing"])];
    const result = rankCocktails(cocktails, ["gin"], "bitter", sampleIngredients);

    expect(result).toEqual([]);
  });

  it("handles empty selectedIngredients gracefully", () => {
    const cocktails = [makeCocktail("gin-tonic", ["gin", "tonic"])];
    const result = rankCocktails(cocktails, [], null, sampleIngredients);

    expect(result[0].matchRatio).toBe(0);
    expect(result[0].missingIngredients).toEqual(["gin", "tonic"]);
    expect(result[0].availableCount).toBe(0);
  });
});
