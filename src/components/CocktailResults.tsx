import { Pressable, StyleSheet, Text, View } from "react-native";

import { Ingredient } from "../data/cocktails";
import { colors, pressed, radii, spacing } from "../theme";
import { getStrengthLabel } from "../utils/cocktailLabels";
import { RankedCocktail } from "../utils/cocktailMatcher";
import { FavoriteButton } from "./FavoriteButton";
import { SectionPanel } from "./SectionPanel";

type CocktailResultsProps = {
  title?: string;
  hint?: string;
  emptyText?: string;
  cocktails: RankedCocktail[];
  ingredients: Ingredient[];
  onSelectCocktail: (cocktail: RankedCocktail) => void;
  isFavorite?: (cocktailId: string) => boolean;
  onToggleFavorite?: (cocktailId: string) => void;
};

function getIngredientName(ingredients: Ingredient[], ingredientId: string) {
  return ingredients.find((ingredient) => ingredient.id === ingredientId)?.name ?? ingredientId;
}

export function CocktailResults({
  title = "Все рецепты",
  hint = "Сначала идут готовые коктейли, затем самые близкие варианты.",
  emptyText = "Здесь пока нет подходящих вариантов.",
  cocktails,
  ingredients,
  onSelectCocktail,
  isFavorite,
  onToggleFavorite,
}: CocktailResultsProps) {
  return (
    <SectionPanel title={title} hint={hint} style={styles.resultsPanel}>
      {cocktails.length === 0 ? <Text style={styles.emptyText}>{emptyText}</Text> : null}

      <View style={styles.resultGrid}>
        {cocktails.map((cocktail) => {
          const isPerfect = cocktail.missingIngredients.length === 0;
          const missingNames = cocktail.missingIngredients
            .map((ingredientId) => getIngredientName(ingredients, ingredientId))
            .join(", ");
          const progress = Math.max(
            0,
            Math.min(100, Math.round((cocktail.availableCount / cocktail.ingredients.length) * 100)),
          );

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Открыть ${cocktail.name}. ${cocktail.availableCount} из ${cocktail.ingredients.length} ингредиентов.`}
              key={cocktail.id}
              onPress={() => onSelectCocktail(cocktail)}
              style={({ pressed: isPressed }) => [
                styles.resultCard,
                isPerfect && styles.resultCardReady,
                isPressed && { opacity: pressed.opacity },
              ]}
            >
              <View style={styles.resultHeader}>
                <View style={styles.resultHeaderInfo}>
                  <Text style={styles.resultTitle}>{cocktail.name}</Text>
                  <Text style={styles.resultMeta}>
                    {cocktail.baseSpirit} · {getStrengthLabel(cocktail.strength)}
                  </Text>
                </View>
                <View style={styles.resultHeaderRight}>
                  {isFavorite && onToggleFavorite ? (
                    <FavoriteButton
                      isFavorite={isFavorite(cocktail.id)}
                      onToggle={() => onToggleFavorite(cocktail.id)}
                      label={cocktail.name}
                    />
                  ) : null}
                  <View style={[styles.badge, isPerfect ? styles.badgeReady : styles.badgeAlmost]}>
                    <Text style={styles.badgeLabel}>
                      {isPerfect ? "Готов" : `-${cocktail.missingIngredients.length}`}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    isPerfect ? styles.progressFillReady : styles.progressFillAlmost,
                    { width: `${progress}%` },
                  ]}
                />
              </View>

              <Text style={styles.resultMatch}>
                {cocktail.availableCount}/{cocktail.ingredients.length} ингредиентов
              </Text>

              {isPerfect ? (
                <Text style={styles.resultReady}>Можно смешивать сейчас.</Text>
              ) : (
                <Text style={styles.resultMissing} numberOfLines={2}>
                  Нужно: {missingNames}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </SectionPanel>
  );
}

const styles = StyleSheet.create({
  resultsPanel: {
    gap: spacing.sm,
  },
  resultGrid: {
    gap: spacing.sm,
  },
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultCardReady: {
    borderColor: "#b8d8c6",
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  resultHeaderInfo: {
    flex: 1,
    gap: 2,
  },
  resultHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  resultTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 23,
  },
  resultMeta: {
    color: colors.textSubtle,
    fontSize: 13,
    lineHeight: 18,
  },
  progressTrack: {
    height: 5,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: radii.pill,
  },
  progressFillReady: {
    backgroundColor: colors.success,
  },
  progressFillAlmost: {
    backgroundColor: colors.accent,
  },
  badge: {
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 54,
    alignItems: "center",
  },
  badgeReady: {
    backgroundColor: colors.successBg,
  },
  badgeAlmost: {
    backgroundColor: colors.warningBg,
  },
  badgeLabel: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
  },
  resultMatch: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "900",
  },
  resultMissing: {
    color: colors.warning,
    fontSize: 13,
    lineHeight: 18,
  },
  resultReady: {
    color: colors.success,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
  },
  emptyText: {
    color: colors.textSubtle,
    fontSize: 14,
    lineHeight: 20,
  },
});
