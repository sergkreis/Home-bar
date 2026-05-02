import { Cocktail, Ingredient, TasteTag } from "../data/types";

export type RankedCocktail = Cocktail & {
  missingIngredients: string[];
  availableCount: number;
  matchRatio: number;
};

export function rankCocktails(
  cocktailList: Cocktail[],
  selectedIngredients: string[],
  activeTaste: TasteTag | null,
  ingredientCatalog: Ingredient[] = [],
): RankedCocktail[] {
  const owned = new Set(selectedIngredients);
  const ingredientById = new Map(ingredientCatalog.map((ingredient) => [ingredient.id, ingredient]));

  const isBlockingIngredient = (ingredientId: string) => {
    const ingredient = ingredientById.get(ingredientId);

    return !ingredient?.isGarnish && !ingredient?.isOptionalDefault;
  };

  return cocktailList
    .filter((cocktail) => (activeTaste ? cocktail.taste.includes(activeTaste) : true))
    .map((cocktail) => {
      const requiredIngredients = cocktail.ingredients.filter(isBlockingIngredient);
      const matchingIngredientIds = requiredIngredients.length > 0 ? requiredIngredients : cocktail.ingredients;
      const missingIngredients = matchingIngredientIds.filter((ingredient) => !owned.has(ingredient));
      const availableCount = matchingIngredientIds.length - missingIngredients.length;

      return {
        ...cocktail,
        missingIngredients,
        availableCount,
        matchRatio: availableCount / matchingIngredientIds.length,
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
