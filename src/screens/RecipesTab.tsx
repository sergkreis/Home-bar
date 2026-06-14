import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { CocktailResults } from "../components/CocktailResults";
import { SectionPanel } from "../components/SectionPanel";
import { Ingredient, TasteTag } from "../data/cocktails";
import { colors, pressed, radii, spacing } from "../theme";
import { RankedCocktail } from "../utils/cocktailMatcher";

type TasteFilter = { id: TasteTag; label: string };

type RecipesTabProps = {
  rankedCocktails: RankedCocktail[];
  tasteFilters: TasteFilter[];
  activeTaste: TasteTag | null;
  onChangeTaste: (taste: TasteTag | null) => void;
  ingredients: Ingredient[];
  onSelectCocktail: (cocktail: RankedCocktail) => void;
  isFavorite: (cocktailId: string) => boolean;
  onToggleFavorite: (cocktailId: string) => void;
};

function normalizeText(value: string) {
  return value.trim().toLocaleLowerCase("ru-RU");
}

export function RecipesTab({
  rankedCocktails,
  tasteFilters,
  activeTaste,
  onChangeTaste,
  ingredients,
  onSelectCocktail,
  isFavorite,
  onToggleFavorite,
}: RecipesTabProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCocktails = useMemo(() => {
    const normalized = normalizeText(searchQuery);
    if (!normalized) {
      return rankedCocktails;
    }
    return rankedCocktails.filter((cocktail) =>
      normalizeText(cocktail.name).includes(normalized),
    );
  }, [rankedCocktails, searchQuery]);

  return (
    <>
      <SectionPanel title="Фильтр рецептов" hint="Поиск и настроение влияют на порядок выдачи. Готовые варианты остаются выше.">
        <View style={styles.filterRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Показать все коктейли"
            onPress={() => onChangeTaste(null)}
            style={({ pressed: isPressed }) => [
              styles.filterPill,
              activeTaste === null && styles.filterPillActive,
              isPressed && { opacity: pressed.opacity },
            ]}
          >
            <Text style={[styles.filterLabel, activeTaste === null && styles.filterLabelActive]}>
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
            accessibilityLabel="Поиск коктейля по названию"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Найти коктейль по названию"
            placeholderTextColor={colors.textDim}
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
    fontWeight: "900",
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
