export type IngredientCategory =
  | "spirit"
  | "liqueur"
  | "mixer"
  | "citrus"
  | "sweetener"
  | "other";

export type TasteTag = "sweet" | "sour" | "refreshing" | "strong" | "bitter";

export type CocktailStrength = "light" | "medium" | "strong";

export type Ingredient = {
  id: string;
  name: string;
  category: IngredientCategory;
};

export type CocktailRecord = {
  id: string;
  name: string;
  baseSpirit: string;
  taste: TasteTag[];
  strength: CocktailStrength;
  glassName: string;
  steps: string[];
  garnish?: string;
  imageUrl?: string;
};

export type CocktailIngredientLink = {
  cocktailId: string;
  ingredientId: string;
  sortOrder: number;
  amount: string;
};

export type CocktailIngredientEntry = {
  ingredientId: string;
  amount: string;
};

export type Cocktail = CocktailRecord & {
  ingredients: string[];
  recipeIngredients: CocktailIngredientEntry[];
};
