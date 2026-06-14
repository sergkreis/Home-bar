import { cocktails as staticCocktails } from "../data/cocktails";
import {
  Cocktail,
  CocktailImageStatus,
  CocktailIngredientEntry,
  CocktailStrength,
  TasteTag,
} from "../data/types";
import { supabase } from "../lib/supabase";

export type CocktailCatalogSource = "remote" | "remote-empty" | "static";

export type RemoteCocktailCatalog = {
  cocktails: Cocktail[];
  source: CocktailCatalogSource;
};

export type CocktailCatalogSaveInput = Cocktail & {
  imageAssetKey?: string;
  imageStatus?: CocktailImageStatus;
  isPublished?: boolean;
  referenceUrls?: string[];
};

type CocktailRecordRow = {
  id: string;
  name: string;
  base_spirit: string;
  taste: string[];
  strength: string;
  glass_name: string;
  steps: string[];
  garnish: string | null;
  image_asset_key: string | null;
  image_status: string;
  is_published: boolean;
  reference_urls: string[];
  updated_at: string;
  updated_by: string | null;
};

type CocktailIngredientLinkRow = {
  cocktail_id: string;
  ingredient_id: string;
  sort_order: number;
  amount: string;
};

type CocktailRecordUpsert = {
  id: string;
  name: string;
  base_spirit: string;
  taste: TasteTag[];
  strength: CocktailStrength;
  glass_name: string;
  steps: string[];
  garnish: string | null;
  image_asset_key: string | null;
  image_status: CocktailImageStatus;
  is_published: boolean;
  reference_urls: string[];
  updated_at: string;
  updated_by?: string;
};

type CocktailIngredientLinkInsert = {
  cocktail_id: string;
  ingredient_id: string;
  sort_order: number;
  amount: string;
};

const validTasteTags = new Set<TasteTag>(["sweet", "sour", "refreshing", "strong", "bitter"]);
const validStrengths = new Set<CocktailStrength>(["light", "medium", "strong"]);
const validImageStatuses = new Set<CocktailImageStatus>([
  "todo",
  "reference-needed",
  "generated",
  "approved",
]);

function normalizeTasteTags(values: string[]): TasteTag[] {
  return values.filter((value): value is TasteTag => validTasteTags.has(value as TasteTag));
}

function normalizeStrength(value: string): CocktailStrength {
  return validStrengths.has(value as CocktailStrength) ? (value as CocktailStrength) : "medium";
}

function normalizeImageStatus(value: string): CocktailImageStatus {
  return validImageStatuses.has(value as CocktailImageStatus)
    ? (value as CocktailImageStatus)
    : "todo";
}

function normalizeRecipeIngredients(values: CocktailIngredientEntry[]) {
  return values.filter((entry) => entry.ingredientId.trim() && entry.amount.trim());
}

function buildCocktails(
  records: CocktailRecordRow[],
  links: CocktailIngredientLinkRow[],
): Cocktail[] {
  const linksByCocktail = new Map<string, CocktailIngredientLinkRow[]>();

  links.forEach((link) => {
    const existing = linksByCocktail.get(link.cocktail_id) ?? [];
    existing.push(link);
    linksByCocktail.set(link.cocktail_id, existing);
  });

  return records.map((record) => {
    const recipeIngredients = (linksByCocktail.get(record.id) ?? [])
      .slice()
      .sort((left, right) => left.sort_order - right.sort_order)
      .map((link) => ({
        ingredientId: link.ingredient_id,
        amount: link.amount,
      }));

    return {
      id: record.id,
      name: record.name,
      baseSpirit: record.base_spirit,
      taste: normalizeTasteTags(record.taste),
      strength: normalizeStrength(record.strength),
      glassName: record.glass_name,
      steps: record.steps,
      garnish: record.garnish ?? undefined,
      imageAssetKey: record.image_asset_key ?? undefined,
      imageStatus: normalizeImageStatus(record.image_status),
      isPublished: record.is_published,
      referenceUrls: record.reference_urls,
      ingredients: recipeIngredients.map((entry) => entry.ingredientId),
      recipeIngredients,
    };
  });
}

function toRecordUpsert(cocktail: CocktailCatalogSaveInput, userId?: string): CocktailRecordUpsert {
  return {
    id: cocktail.id.trim(),
    name: cocktail.name.trim(),
    base_spirit: cocktail.baseSpirit.trim(),
    taste: normalizeTasteTags(cocktail.taste),
    strength: normalizeStrength(cocktail.strength),
    glass_name: cocktail.glassName.trim(),
    steps: cocktail.steps.map((step) => step.trim()).filter(Boolean),
    garnish: cocktail.garnish?.trim() || null,
    image_asset_key: cocktail.imageAssetKey?.trim() || null,
    image_status: cocktail.imageStatus ?? "todo",
    is_published: cocktail.isPublished ?? true,
    reference_urls: cocktail.referenceUrls?.map((url) => url.trim()).filter(Boolean) ?? [],
    updated_at: new Date().toISOString(),
    ...(userId ? { updated_by: userId } : {}),
  };
}

function toLinkInserts(cocktail: CocktailCatalogSaveInput): CocktailIngredientLinkInsert[] {
  return normalizeRecipeIngredients(cocktail.recipeIngredients).map((entry, index) => ({
    cocktail_id: cocktail.id.trim(),
    ingredient_id: entry.ingredientId.trim(),
    sort_order: index,
    amount: entry.amount.trim(),
  }));
}

export async function loadRemoteCocktailCatalog(): Promise<RemoteCocktailCatalog | null> {
  if (!supabase) {
    return null;
  }

  const { data: recordRows, error: recordsError } = await supabase
    .from("cocktail_records")
    .select(
      "id, name, base_spirit, taste, strength, glass_name, steps, garnish, image_asset_key, image_status, is_published, reference_urls, updated_at, updated_by",
    )
    .order("name", { ascending: true })
    .returns<CocktailRecordRow[]>();

  if (recordsError) {
    throw recordsError;
  }

  if (!recordRows || recordRows.length === 0) {
    return {
      cocktails: staticCocktails,
      source: "remote-empty",
    };
  }

  const ids = recordRows.map((record) => record.id);
  const { data: linkRows, error: linksError } = await supabase
    .from("cocktail_ingredient_links")
    .select("cocktail_id, ingredient_id, sort_order, amount")
    .in("cocktail_id", ids)
    .order("sort_order", { ascending: true })
    .returns<CocktailIngredientLinkRow[]>();

  if (linksError) {
    throw linksError;
  }

  return {
    cocktails: buildCocktails(recordRows, linkRows ?? []),
    source: "remote",
  };
}

export async function saveRemoteCocktail(
  cocktail: CocktailCatalogSaveInput,
  userId?: string,
): Promise<void> {
  if (!supabase) {
    return;
  }

  const { error: recordError } = await supabase
    .from("cocktail_records")
    .upsert(toRecordUpsert(cocktail, userId));

  if (recordError) {
    throw recordError;
  }

  const { error: deleteError } = await supabase
    .from("cocktail_ingredient_links")
    .delete()
    .eq("cocktail_id", cocktail.id.trim());

  if (deleteError) {
    throw deleteError;
  }

  const linkInserts = toLinkInserts(cocktail);
  if (linkInserts.length === 0) {
    return;
  }

  const { error: insertError } = await supabase
    .from("cocktail_ingredient_links")
    .insert(linkInserts);

  if (insertError) {
    throw insertError;
  }
}

export async function seedRemoteCocktails(
  cocktails: CocktailCatalogSaveInput[] = staticCocktails,
  userId?: string,
): Promise<void> {
  if (!supabase) {
    return;
  }

  const recordRows = cocktails.map((cocktail) => toRecordUpsert(cocktail, userId));
  const ids = recordRows.map((record) => record.id);

  const { error: recordsError } = await supabase.from("cocktail_records").upsert(recordRows);

  if (recordsError) {
    throw recordsError;
  }

  const { error: deleteError } = await supabase
    .from("cocktail_ingredient_links")
    .delete()
    .in("cocktail_id", ids);

  if (deleteError) {
    throw deleteError;
  }

  const linkRows = cocktails.flatMap(toLinkInserts);
  if (linkRows.length === 0) {
    return;
  }

  const { error: linksError } = await supabase.from("cocktail_ingredient_links").insert(linkRows);

  if (linksError) {
    throw linksError;
  }
}
