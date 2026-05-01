import { Cocktail, TasteTag } from "../data/types";

export type RankedCocktail = Cocktail & {
  missingIngredients: string[];
  availableCount: number;
  matchRatio: number;
};

export function rankCocktails(
  cocktailList: Cocktail[],
  selectedIngredients: string[],
  activeTaste: TasteTag | null,
): RankedCocktail[] {
  const owned = new Set(selectedIngredients);

  return cocktailList
    .filter((cocktail) => (activeTaste ? cocktail.taste.includes(activeTaste) : true))
    .map((cocktail) => {
      const missingIngredients = cocktail.ingredients.filter((ingredient) => !owned.has(ingredient));
      const availableCount = cocktail.ingredients.length - missingIngredients.length;

      return {
        ...cocktail,
        missingIngredients,
        availableCount,
        matchRatio: availableCount / cocktail.ingredients.length,
      };
    })
    .sort((left, right) => {
      if (right.matchRatio !== left.matchRatio) {
        return right.matchRatio - left.matchRatio;
      }

      if (left.missingIngredients.length !== right.missingIngredients.length) {
        return left.missingIngredients.length - right.missingIngredients.length;
      }

      return left.name.localeCompare(right.name);
    });
}
