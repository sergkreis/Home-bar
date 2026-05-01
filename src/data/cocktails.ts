import { cocktailIngredientLinks } from "./cocktailIngredients";
import { cocktailRecords } from "./cocktailRecords";
import { ingredients } from "./ingredients";
import { Cocktail } from "./types";

export * from "./types";
export { ingredients, cocktailIngredientLinks, cocktailRecords };

export const cocktails: Cocktail[] = cocktailRecords.map((cocktail) => {
  const recipeIngredients = cocktailIngredientLinks
    .filter((link) => link.cocktailId === cocktail.id)
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((link) => ({
      ingredientId: link.ingredientId,
      amount: link.amount,
    }));

  return {
    ...cocktail,
    ingredients: recipeIngredients.map((entry) => entry.ingredientId),
    recipeIngredients,
  };
});
