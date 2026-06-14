export type IngredientCategory =
  | "spirit"
  | "liqueur"
  | "wine"
  | "mixer"
  | "citrus"
  | "sweetener"
  | "garnish"
  | "pantry"
  | "other";

export type TasteTag = "sweet" | "sour" | "refreshing" | "strong" | "bitter";

export type CocktailStrength = "light" | "medium" | "strong";

export type CocktailImageStatus = "todo" | "reference-needed" | "generated" | "approved";

export type Ingredient = {
  id: string;
  name: string;
  category: IngredientCategory;
  aliases?: string[];
  family?: string;
  shoppingName?: string;
  isCommon?: boolean;
  isGarnish?: boolean;
  isOptionalDefault?: boolean;
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
  imageAssetKey?: string;
  imageStatus?: CocktailImageStatus;
  isPublished?: boolean;
  referenceUrls?: string[];
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
