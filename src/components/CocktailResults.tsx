import { Pressable, StyleSheet, Text, View } from "react-native";

import { Ingredient } from "../data/cocktails";
import { getStrengthLabel } from "../utils/cocktailLabels";
import { RankedCocktail } from "../utils/cocktailMatcher";
import { SectionPanel } from "./SectionPanel";

type CocktailResultsProps = {
  title?: string;
  hint?: string;
  emptyText?: string;
  cocktails: RankedCocktail[];
  ingredients: Ingredient[];
  onSelectCocktail: (cocktail: RankedCocktail) => void;
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
}: CocktailResultsProps) {
  return (
    <SectionPanel title={title} hint={hint} style={styles.resultsPanel}>
      {cocktails.length === 0 ? <Text style={styles.emptyText}>{emptyText}</Text> : null}

      {cocktails.map((cocktail) => {
        const isPerfect = cocktail.missingIngredients.length === 0;
        const missingNames = cocktail.missingIngredients
          .map((ingredientId) => getIngredientName(ingredients, ingredientId))
          .join(", ");

        return (
          <Pressable
            accessibilityRole="button"
            key={cocktail.id}
            onPress={() => onSelectCocktail(cocktail)}
            style={styles.resultCard}
          >
            <View style={styles.resultHeader}>
              <View style={styles.resultHeaderInfo}>
                <Text style={styles.resultTitle}>{cocktail.name}</Text>
                <Text style={styles.resultMeta}>
                  {cocktail.baseSpirit} - {getStrengthLabel(cocktail.strength)}
                </Text>
              </View>
              <View style={[styles.badge, isPerfect ? styles.badgeReady : styles.badgeAlmost]}>
                <Text style={styles.badgeLabel}>
                  {isPerfect ? "Готов" : `-${cocktail.missingIngredients.length}`}
                </Text>
              </View>
            </View>

            <Text style={styles.resultMatch}>
              {Math.round(cocktail.matchRatio * 100)}% - {cocktail.availableCount}/
              {cocktail.ingredients.length} ингредиентов
            </Text>

            {isPerfect ? (
              <Text style={styles.resultReady}>Можно смешивать прямо сейчас.</Text>
            ) : (
              <Text style={styles.resultMissing} numberOfLines={2}>
                Нужно: {missingNames}
              </Text>
            )}
          </Pressable>
        );
      })}
    </SectionPanel>
  );
}

const styles = StyleSheet.create({
  resultsPanel: {
    gap: 8,
  },
  resultCard: {
    backgroundColor: "#141a22",
    borderRadius: 8,
    padding: 12,
    gap: 7,
    borderWidth: 1,
    borderColor: "#303846",
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  resultHeaderInfo: {
    flex: 1,
    gap: 2,
  },
  resultTitle: {
    color: "#f8fafc",
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 22,
  },
  resultMeta: {
    color: "#97a3b6",
    fontSize: 13,
    lineHeight: 18,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 54,
    alignItems: "center",
  },
  badgeReady: {
    backgroundColor: "#214b35",
  },
  badgeAlmost: {
    backgroundColor: "#5f4a1f",
  },
  badgeLabel: {
    color: "#f8fafc",
    fontSize: 12,
    fontWeight: "900",
  },
  resultMatch: {
    color: "#dce4ef",
    fontSize: 13,
    fontWeight: "800",
  },
  resultMissing: {
    color: "#f0c985",
    fontSize: 13,
    lineHeight: 18,
  },
  resultReady: {
    color: "#7ce0ab",
    fontSize: 13,
    lineHeight: 18,
  },
  emptyText: {
    color: "#97a3b6",
    fontSize: 14,
    lineHeight: 20,
  },
});
