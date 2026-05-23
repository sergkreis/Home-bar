import { describe, expect, it } from "vitest";

import type { Ingredient } from "../data/types";
import type { RankedCocktail } from "./cocktailMatcher";
import { buildShoppingSuggestions, buildTonightHeadline } from "./shoppingAdvisor";

const ingredients: Ingredient[] = [
  { id: "gin", name: "Джин", category: "spirit" },
  { id: "tonic", name: "Тоник", category: "mixer" },
  { id: "lime", name: "Лайм", category: "citrus" },
  { id: "vermouth", name: "Вермут", category: "liqueur" },
];

function ranked(id: string, missing: string[], cocktailIngredients = missing): RankedCocktail {
  return {
    id,
    name: id,
    baseSpirit: "gin",
    taste: ["refreshing"],
    strength: "medium",
    glassName: "highball",
    steps: ["mix"],
    ingredients: cocktailIngredients,
    recipeIngredients: cocktailIngredients.map((ingredientId) => ({ ingredientId, amount: "30ml" })),
    missingIngredients: missing,
    availableCount: cocktailIngredients.length - missing.length,
    matchRatio: (cocktailIngredients.length - missing.length) / cocktailIngredients.length,
  };
}

describe("buildShoppingSuggestions", () => {
  it("returns empty array when no cocktails are missing anything", () => {
    const cocktails = [ranked("a", [])];
    expect(buildShoppingSuggestions(cocktails, ingredients)).toEqual([]);
  });

  it("ignores cocktails missing more than 2 ingredients", () => {
    const cocktails = [ranked("a", ["gin", "tonic", "lime"], ["gin", "tonic", "lime"])];
    expect(buildShoppingSuggestions(cocktails, ingredients)).toEqual([]);
  });

  it("aggregates the same missing ingredient set across cocktails", () => {
    const cocktails = [
      ranked("a", ["tonic"]),
      ranked("b", ["tonic"]),
      ranked("c", ["tonic"]),
    ];
    const result = buildShoppingSuggestions(cocktails, ingredients);

    expect(result).toHaveLength(1);
    expect(result[0].ids).toEqual(["tonic"]);
    expect(result[0].cocktailCount).toBe(3);
    expect(result[0].unlockedCocktails).toEqual(["a", "b", "c"]);
  });

  it("sorts suggestions by cocktailCount descending", () => {
    const cocktails = [
      ranked("a", ["tonic"]),
      ranked("b", ["lime"]),
      ranked("c", ["lime"]),
      ranked("d", ["lime"]),
    ];
    const result = buildShoppingSuggestions(cocktails, ingredients);

    expect(result[0].ids).toEqual(["lime"]);
    expect(result[0].cocktailCount).toBe(3);
    expect(result[1].ids).toEqual(["tonic"]);
  });

  it("prefers single-ingredient suggestions when tied on count", () => {
    const cocktails = [
      ranked("a", ["tonic"]),
      ranked("b", ["lime", "vermouth"]),
    ];
    const result = buildShoppingSuggestions(cocktails, ingredients);

    expect(result[0].ids).toHaveLength(1);
  });

  it("returns at most 4 suggestions", () => {
    const cocktails = [
      ranked("a", ["gin"]),
      ranked("b", ["tonic"]),
      ranked("c", ["lime"]),
      ranked("d", ["vermouth"]),
      ranked("e", ["gin", "tonic"]),
    ];
    expect(buildShoppingSuggestions(cocktails, ingredients).length).toBeLessThanOrEqual(4);
  });

  it("resolves ingredient names from the catalog", () => {
    const cocktails = [ranked("a", ["tonic"])];
    const result = buildShoppingSuggestions(cocktails, ingredients);

    expect(result[0].names).toEqual(["Тоник"]);
  });

  it("falls back to the id if the ingredient is unknown", () => {
    const cocktails = [ranked("a", ["unknown-id"])];
    const result = buildShoppingSuggestions(cocktails, ingredients);

    expect(result[0].names).toEqual(["unknown-id"]);
  });
});

describe("buildTonightHeadline", () => {
  it("returns starter prompt when nothing matches", () => {
    const headline = buildTonightHeadline([], [], ingredients);
    expect(headline).toContain("Добавь несколько ингредиентов");
  });

  it("celebrates a ready cocktail when topMatch is complete", () => {
    const cocktails = [ranked("Mojito", [])];
    const headline = buildTonightHeadline(cocktails, ["a"], ingredients);
    expect(headline).toContain("Mojito");
    expect(headline).toContain("уже готов");
  });

  it("recommends closest with shopping hint when topMatch is incomplete", () => {
    const cocktails = [ranked("Margarita", ["tonic"])];
    const headline = buildTonightHeadline(cocktails, ["a"], ingredients);
    expect(headline).toContain("Margarita");
    expect(headline).toContain("Тоник");
  });
});
