import { Pressable, StyleSheet, Text, View } from "react-native";

import { Ingredient } from "../data/cocktails";
import { colors, fonts, pressed, radii, spacing } from "../theme";
import { getStrengthLabel } from "../utils/cocktailLabels";
import { RankedCocktail } from "../utils/cocktailMatcher";
import { DrinkArt } from "./DrinkArt";
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
          const matchTotal = Math.max(
            cocktail.availableCount + cocktail.missingIngredients.length,
            cocktail.availableCount,
            1,
          );
          const progress = Math.max(
            0,
            Math.min(100, Math.round((cocktail.availableCount / matchTotal) * 100)),
          );

          const openLabel = `Открыть ${cocktail.name}. ${cocktail.availableCount} из ${matchTotal} ингредиентов.`;

          return (
            <View key={cocktail.id} style={[styles.resultCard, isPerfect && styles.resultCardReady]}>
              <View style={styles.resultHeader}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={openLabel}
                  onPress={() => onSelectCocktail(cocktail)}
                  style={({ pressed: isPressed }) => [
                    styles.resultHeaderPressable,
                    isPressed && { opacity: pressed.opacity },
                  ]}
                >
                  <View style={[styles.drinkPlate, isPerfect ? styles.drinkPlateReady : styles.drinkPlateAlmost]}>
                    <DrinkArt cocktail={cocktail} size="thumb" />
                  </View>
                  <View style={styles.resultHeaderInfo}>
                    <Text style={styles.resultTitle}>{cocktail.name}</Text>
                    <Text style={styles.resultMeta}>
                      {cocktail.baseSpirit} · {getStrengthLabel(cocktail.strength)}
                    </Text>
                  </View>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={openLabel}
                  onPress={() => onSelectCocktail(cocktail)}
                  style={({ pressed: isPressed }) => [
                    styles.resultMetrics,
                    isPressed && { opacity: pressed.opacity },
                  ]}
                >
                  <Text style={styles.resultMatch}>
                    {cocktail.availableCount}/{matchTotal} ингредиентов
                  </Text>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        isPerfect ? styles.progressFillReady : styles.progressFillAlmost,
                        { width: `${progress}%` },
                      ]}
                    />
                  </View>
                  {isPerfect ? (
                    <Text style={styles.resultReady}>Можно смешивать сейчас.</Text>
                  ) : (
                    <Text style={styles.resultMissing} numberOfLines={1}>
                      Нужно: {missingNames}
                    </Text>
                  )}
                </Pressable>
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
            </View>
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
    backgroundColor: "rgba(7, 26, 18, 0.9)",
    borderRadius: radii.md,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(237, 169, 52, 0.42)",
    overflow: "hidden",
  },
  resultCardReady: {
    borderColor: "rgba(135, 217, 167, 0.46)",
    backgroundColor: "rgba(9, 31, 21, 0.94)",
  },
  resultHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.md,
  },
  resultHeaderPressable: {
    flex: 1,
    flexBasis: 280,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  resultMetrics: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 230,
    gap: 8,
    minWidth: 160,
  },
  drinkPlate: {
    width: 92,
    height: 84,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  drinkPlateReady: {
    backgroundColor: "rgba(12, 43, 30, 0.18)",
  },
  drinkPlateAlmost: {
    backgroundColor: "rgba(46, 29, 8, 0.14)",
  },
  resultHeaderInfo: {
    flex: 1,
    gap: 5,
  },
  resultHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  resultTitle: {
    color: colors.paper,
    fontFamily: fonts.display,
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 24,
  },
  resultMeta: {
    color: colors.textSubtle,
    fontFamily: fonts.display,
    fontSize: 16,
    lineHeight: 21,
  },
  progressTrack: {
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: "#010604",
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
    paddingHorizontal: 11,
    paddingVertical: 7,
    minWidth: 50,
    alignItems: "center",
    borderWidth: 1,
  },
  badgeReady: {
    backgroundColor: "rgba(12, 43, 30, 0.78)",
    borderColor: "rgba(135, 217, 167, 0.5)",
  },
  badgeAlmost: {
    backgroundColor: "rgba(46, 29, 8, 0.8)",
    borderColor: "rgba(237, 169, 52, 0.5)",
  },
  badgeLabel: {
    color: colors.paper,
    fontSize: 12,
    fontWeight: "900",
  },
  resultMatch: {
    color: colors.paper,
    fontFamily: fonts.display,
    fontSize: 16,
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
