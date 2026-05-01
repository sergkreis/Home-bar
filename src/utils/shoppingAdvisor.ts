import { Ingredient } from "../data/types";
import { RankedCocktail } from "./cocktailMatcher";

export type ShoppingSuggestion = {
  ids: string[];
  names: string[];
  unlockedCocktails: string[];
  cocktailCount: number;
};

export function buildShoppingSuggestions(
  rankedCocktails: RankedCocktail[],
  ingredientList: Ingredient[],
): ShoppingSuggestion[] {
  const suggestionMap = new Map<string, ShoppingSuggestion>();

  rankedCocktails
    .filter((cocktail) => cocktail.missingIngredients.length > 0 && cocktail.missingIngredients.length <= 2)
    .forEach((cocktail) => {
      const ids = [...cocktail.missingIngredients].sort();
      const key = ids.join("|");
      const names = ids.map(
        (id) => ingredientList.find((ingredient) => ingredient.id === id)?.name ?? id,
      );

      const existing = suggestionMap.get(key);
      if (existing) {
        existing.unlockedCocktails.push(cocktail.name);
        existing.cocktailCount += 1;
        return;
      }

      suggestionMap.set(key, {
        ids,
        names,
        unlockedCocktails: [cocktail.name],
        cocktailCount: 1,
      });
    });

  return [...suggestionMap.values()]
    .sort((left, right) => {
      if (right.cocktailCount !== left.cocktailCount) {
        return right.cocktailCount - left.cocktailCount;
      }

      if (left.ids.length !== right.ids.length) {
        return left.ids.length - right.ids.length;
      }

      return left.names.join(", ").localeCompare(right.names.join(", "));
    })
    .slice(0, 4);
}

export function buildTonightHeadline(
  rankedCocktails: RankedCocktail[],
  selectedIngredients: string[],
  ingredientList: Ingredient[],
): string {
  const topMatch = rankedCocktails[0];
  if (!topMatch) {
    return "Добавь несколько ингредиентов, и я соберу варианты на вечер.";
  }

  if (topMatch.missingIngredients.length === 0) {
    return `Сегодня можно без похода в магазин: ${topMatch.name} уже готов к смешиванию.`;
  }

  const missingNames = topMatch.missingIngredients.map(
    (id) => ingredientList.find((ingredient) => ingredient.id === id)?.name ?? id,
  );

  return `Ближайший вариант на сегодня: ${topMatch.name}. Не хватает: ${missingNames.join(", ")}.`;
}
