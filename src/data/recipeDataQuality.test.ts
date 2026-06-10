import { describe, expect, it } from "vitest";

import { cocktailIngredientLinks, cocktailRecords, ingredients } from "./cocktails";

describe("recipe data quality", () => {
  const cocktailIds = new Set(cocktailRecords.map((cocktail) => cocktail.id));
  const ingredientIds = new Set(ingredients.map((ingredient) => ingredient.id));

  it("keeps ingredient links referentially valid", () => {
    const unknownCocktailLinks = cocktailIngredientLinks.filter(
      (link) => !cocktailIds.has(link.cocktailId),
    );
    const unknownIngredientLinks = cocktailIngredientLinks.filter(
      (link) => !ingredientIds.has(link.ingredientId),
    );

    expect(unknownCocktailLinks).toEqual([]);
    expect(unknownIngredientLinks).toEqual([]);
  });

  it("does not expose raw English units in recipe amounts", () => {
    const linksWithLatinAmounts = cocktailIngredientLinks.filter((link) =>
      /[A-Za-z]/.test(link.amount),
    );

    expect(linksWithLatinAmounts).toEqual([]);
  });

  it("keeps user-facing recipe text localized", () => {
    const latinPattern = /[A-Za-z]/;
    const ingredientsWithLatinNames = ingredients.filter((ingredient) =>
      latinPattern.test(ingredient.name),
    );
    const cocktailsWithLatinText = cocktailRecords.filter(
      (cocktail) =>
        latinPattern.test(cocktail.name) ||
        latinPattern.test(cocktail.baseSpirit) ||
        latinPattern.test(cocktail.glassName) ||
        cocktail.steps.some((step) => latinPattern.test(step)),
    );

    expect(ingredientsWithLatinNames).toEqual([]);
    expect(cocktailsWithLatinText).toEqual([]);
  });

  it("classifies every generated ingredient", () => {
    const uncategorizedIngredients = ingredients.filter(
      (ingredient) => ingredient.category === "other",
    );

    expect(uncategorizedIngredients).toEqual([]);
  });

  it("does not duplicate the same ingredient inside one cocktail", () => {
    const seenLinks = new Set<string>();
    const duplicateLinks = cocktailIngredientLinks.filter((link) => {
      const key = `${link.cocktailId}:${link.ingredientId}`;
      const isDuplicate = seenLinks.has(key);
      seenLinks.add(key);
      return isDuplicate;
    });

    expect(duplicateLinks).toEqual([]);
  });

  it("treats citrus juice and citrus garnish as separate ingredients", () => {
    const whiskeySourIngredientIds = cocktailIngredientLinks
      .filter((link) => link.cocktailId === "whiskey-sour")
      .map((link) => link.ingredientId);
    const newYorkSourIngredientIds = cocktailIngredientLinks
      .filter((link) => link.cocktailId === "new-york-sour")
      .map((link) => link.ingredientId);

    expect(whiskeySourIngredientIds).toContain("lemon-juice");
    expect(whiskeySourIngredientIds).toContain("lemon");
    expect(newYorkSourIngredientIds).toContain("lemon-juice");
    expect(newYorkSourIngredientIds).toContain("lemon");
  });
});
