import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { CocktailResults } from "../components/CocktailResults";
import { SectionPanel } from "../components/SectionPanel";
import { Ingredient, TasteTag } from "../data/cocktails";
import { colors, pressed, radii, spacing } from "../theme";
import { RankedCocktail } from "../utils/cocktailMatcher";

type TasteFilter = { id: TasteTag; label: string };
type RecipeMode = "easy" | null;

type RecipesTabProps = {
  rankedCocktails: RankedCocktail[];
  activeRecipeMode: RecipeMode;
  tasteFilters: TasteFilter[];
  activeTaste: TasteTag | null;
  onChangeTaste: (taste: TasteTag | null) => void;
  onClearRecipeMode: () => void;
  ingredients: Ingredient[];
  onSelectCocktail: (cocktail: RankedCocktail) => void;
  isFavorite: (cocktailId: string) => boolean;
  onToggleFavorite: (cocktailId: string) => void;
};

function normalizeText(value: string) {
  return value.trim().toLocaleLowerCase("ru-RU");
}

function isSimpleCocktail(cocktail: RankedCocktail, ingredientById: Map<string, Ingredient>) {
  const requiredIngredientCount = cocktail.recipeIngredients.filter(({ ingredientId }) => {
    const ingredient = ingredientById.get(ingredientId);

    return !ingredient?.isGarnish && !ingredient?.isOptionalDefault;
  }).length;

  return requiredIngredientCount <= 3 && cocktail.steps.length <= 3;
}

function getSearchText(cocktail: RankedCocktail, ingredientById: Map<string, Ingredient>) {
  const ingredientText = cocktail.recipeIngredients
    .flatMap(({ ingredientId }) => {
      const ingredient = ingredientById.get(ingredientId);

      return ingredient ? [ingredient.name, ...(ingredient.aliases ?? [])] : [ingredientId];
    })
    .join(" ");

  return normalizeText(
    [
      cocktail.name,
      cocktail.baseSpirit,
      cocktail.glassName,
      cocktail.taste.join(" "),
      ingredientText,
    ].join(" "),
  );
}

export function RecipesTab({
  rankedCocktails,
  activeRecipeMode,
  tasteFilters,
  activeTaste,
  onChangeTaste,
  onClearRecipeMode,
  ingredients,
  onSelectCocktail,
  isFavorite,
  onToggleFavorite,
}: RecipesTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const ingredientById = useMemo(
    () => new Map(ingredients.map((ingredient) => [ingredient.id, ingredient])),
    [ingredients],
  );

  const filteredCocktails = useMemo(() => {
    const normalized = normalizeText(searchQuery);
    const modeFilteredCocktails =
      activeRecipeMode === "easy"
        ? rankedCocktails.filter((cocktail) => isSimpleCocktail(cocktail, ingredientById))
        : rankedCocktails;

    if (!normalized) {
      return modeFilteredCocktails;
    }

    return modeFilteredCocktails.filter((cocktail) =>
      getSearchText(cocktail, ingredientById).includes(normalized),
    );
  }, [activeRecipeMode, ingredientById, rankedCocktails, searchQuery]);

  return (
    <>
      <SectionPanel title="Фильтр рецептов" hint="Поиск и настроение влияют на порядок выдачи. Готовые варианты остаются выше.">
        <View style={styles.filterRow}>
          {activeRecipeMode === "easy" ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Отключить фильтр простых рецептов"
              onPress={onClearRecipeMode}
              style={({ pressed: isPressed }) => [
                styles.filterPill,
                styles.filterPillActive,
                isPressed && { opacity: pressed.opacity },
              ]}
            >
              <Text style={[styles.filterLabel, styles.filterLabelActive]}>
                Простые
              </Text>
            </Pressable>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Показать все коктейли"
            onPress={() => {
              onClearRecipeMode();
              onChangeTaste(null);
            }}
            style={({ pressed: isPressed }) => [
              styles.filterPill,
              activeTaste === null && activeRecipeMode === null && styles.filterPillActive,
              isPressed && { opacity: pressed.opacity },
            ]}
          >
            <Text style={[styles.filterLabel, activeTaste === null && activeRecipeMode === null && styles.filterLabelActive]}>
              Все
            </Text>
          </Pressable>
          {tasteFilters.map((filter) => {
            const isActive = activeTaste === filter.id;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Фильтр: ${filter.label}`}
                accessibilityState={{ selected: isActive }}
                key={filter.id}
                onPress={() => onChangeTaste(isActive ? null : filter.id)}
                style={({ pressed: isPressed }) => [
                  styles.filterPill,
                  isActive && styles.filterPillActive,
                  isPressed && { opacity: pressed.opacity },
                ]}
              >
                <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.searchWrap}>
          <TextInput
            accessibilityLabel="Поиск коктейля по названию, базе или ингредиентам"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => setSearchQuery((value) => value.trim())}
            placeholder="Найти по названию, базе или ингредиенту"
            placeholderTextColor={colors.textDim}
            returnKeyType="search"
            style={styles.searchInput}
          />
        </View>

        {searchQuery ? (
          <Text style={styles.searchMeta}>Найдено: {filteredCocktails.length}</Text>
        ) : null}
      </SectionPanel>

      <CocktailResults
        cocktails={filteredCocktails}
        ingredients={ingredients}
        onSelectCocktail={onSelectCocktail}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
      />
    </>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterPillActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  filterLabelActive: {
    color: colors.textOnAccent,
  },
  searchWrap: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 12,
    marginTop: spacing.sm,
  },
  searchInput: {
    color: colors.text,
    fontSize: 15,
    paddingVertical: 12,
  },
  searchMeta: {
    color: colors.textSubtle,
    fontSize: 12,
    fontWeight: "800",
  },
});
