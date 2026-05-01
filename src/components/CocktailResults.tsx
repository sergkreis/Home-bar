import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Ingredient } from "../data/cocktails";
import { getStrengthLabel, getTasteLabel } from "../utils/cocktailLabels";
import { RankedCocktail } from "../utils/cocktailMatcher";
import { SectionPanel } from "./SectionPanel";

type CocktailResultsProps = {
  title?: string;
  hint?: string;
  cocktails: RankedCocktail[];
  ingredients: Ingredient[];
};

export function CocktailResults({
  title = "Лучшие варианты сверху",
  hint = "Сначала идут коктейли, которые можно приготовить сразу, затем самые близкие по совпадению.",
  cocktails,
  ingredients,
}: CocktailResultsProps) {
  const [expandedCocktailId, setExpandedCocktailId] = useState<string | null>(cocktails[0]?.id ?? null);

  useEffect(() => {
    setExpandedCocktailId(cocktails[0]?.id ?? null);
  }, [cocktails]);

  const toggleCocktail = (cocktailId: string) => {
    setExpandedCocktailId((current) => (current === cocktailId ? null : cocktailId));
  };

  return (
    <SectionPanel title={title} hint={hint} style={styles.resultsPanel}>
      {cocktails.map((cocktail) => {
        const isExpanded = cocktail.id === expandedCocktailId;
        const isPerfect = cocktail.missingIngredients.length === 0;

        return (
          <View key={cocktail.id} style={[styles.resultCard, isExpanded && styles.resultCardExpanded]}>
            <Pressable onPress={() => toggleCocktail(cocktail.id)} style={styles.resultTrigger}>
              <View style={styles.resultHeader}>
                <View style={styles.resultHeaderInfo}>
                  <Text style={styles.resultTitle}>{cocktail.name}</Text>
                  <Text style={styles.resultMeta}>
                    {cocktail.baseSpirit} - {getStrengthLabel(cocktail.strength)}
                  </Text>
                </View>
                <View style={styles.resultAside}>
                  <View style={[styles.badge, isPerfect ? styles.badgeReady : styles.badgeAlmost]}>
                    <Text style={styles.badgeLabel}>
                      {isPerfect ? "Готов" : `Не хватает: ${cocktail.missingIngredients.length}`}
                    </Text>
                  </View>
                  <Text style={styles.chevron}>{isExpanded ? "Свернуть" : "Открыть"}</Text>
                </View>
              </View>

              <Text style={styles.resultMatch}>
                Совпадение {Math.round(cocktail.matchRatio * 100)}% - {cocktail.availableCount}/
                {cocktail.ingredients.length} ингредиентов
              </Text>

              {cocktail.missingIngredients.length > 0 ? (
                <Text style={styles.resultMissing}>
                  Нужно:{" "}
                  {cocktail.missingIngredients
                    .map(
                      (ingredientId) =>
                        ingredients.find((ingredient) => ingredient.id === ingredientId)?.name ??
                        ingredientId,
                    )
                    .join(", ")}
                </Text>
              ) : (
                <Text style={styles.resultReady}>
                  Все уже есть дома, можно смешивать прямо сейчас.
                </Text>
              )}
            </Pressable>

            {isExpanded ? (
              <View style={styles.recipeWrap}>
                <Text style={styles.recipeSummary}>
                  {cocktail.taste.map(getTasteLabel).join(", ")} • {getStrengthLabel(cocktail.strength)}
                </Text>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Бокал</Text>
                  <Text style={styles.infoValue}>{cocktail.glassName}</Text>
                </View>

                <Text style={styles.recipeTitle}>Ингредиенты</Text>
                {cocktail.recipeIngredients.map(({ ingredientId, amount }) => {
                  const ingredient = ingredients.find((item) => item.id === ingredientId);
                  const isOwned = !cocktail.missingIngredients.includes(ingredientId);

                  return (
                    <View key={ingredientId} style={styles.recipeRow}>
                      <View style={styles.recipeRowMain}>
                        <View style={[styles.dot, isOwned ? styles.dotOwned : styles.dotMissing]} />
                        <Text style={styles.recipeRowText}>{ingredient?.name ?? ingredientId}</Text>
                      </View>
                      <Text style={styles.recipeAmount}>{amount}</Text>
                    </View>
                  );
                })}

                <Text style={styles.recipeTitle}>Как приготовить</Text>
                {cocktail.steps.map((step, index) => (
                  <View key={`${cocktail.id}-${index}`} style={styles.stepRow}>
                    <Text style={styles.stepIndex}>{index + 1}</Text>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}

                {cocktail.garnish ? (
                  <View style={styles.tipBox}>
                    <Text style={styles.tipTitle}>Подача</Text>
                    <Text style={styles.tipText}>{cocktail.garnish}</Text>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        );
      })}
    </SectionPanel>
  );
}

const styles = StyleSheet.create({
  resultsPanel: {
    gap: 10,
  },
  resultCard: {
    backgroundColor: "#161b22",
    borderRadius: 8,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: "#303846",
  },
  resultCardExpanded: {
    borderColor: "#f4b860",
  },
  resultTrigger: {
    gap: 8,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  resultHeaderInfo: {
    flex: 1,
    gap: 2,
  },
  resultAside: {
    alignItems: "flex-end",
    gap: 8,
  },
  resultTitle: {
    color: "#f8fafc",
    fontSize: 17,
    fontWeight: "700",
  },
  resultMeta: {
    color: "#97a3b6",
    fontSize: 13,
    marginTop: 2,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
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
    fontWeight: "700",
  },
  chevron: {
    color: "#97a3b6",
    fontSize: 12,
    fontWeight: "700",
  },
  resultMatch: {
    color: "#dce4ef",
    fontSize: 14,
    fontWeight: "600",
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
  recipeWrap: {
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#303846",
    paddingTop: 14,
    gap: 10,
  },
  recipeSummary: {
    color: "#97a3b6",
    fontSize: 13,
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#1b1f27",
    borderRadius: 8,
  },
  infoLabel: {
    color: "#97a3b6",
    fontSize: 13,
    fontWeight: "700",
  },
  infoValue: {
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: "700",
    flex: 1,
    textAlign: "right",
  },
  recipeTitle: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 2,
  },
  recipeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  recipeRowMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  recipeRowText: {
    color: "#d7deea",
    fontSize: 14,
  },
  recipeAmount: {
    color: "#f4b860",
    fontSize: 13,
    fontWeight: "700",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotOwned: {
    backgroundColor: "#62d29b",
  },
  dotMissing: {
    backgroundColor: "#f4b860",
  },
  stepRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  stepIndex: {
    width: 24,
    height: 24,
    borderRadius: 8,
    textAlign: "center",
    textAlignVertical: "center",
    backgroundColor: "#52c4c8",
    color: "#102124",
    fontSize: 13,
    fontWeight: "800",
    overflow: "hidden",
  },
  stepText: {
    flex: 1,
    color: "#d7deea",
    fontSize: 14,
    lineHeight: 20,
  },
  tipBox: {
    backgroundColor: "#1b1f27",
    borderRadius: 8,
    padding: 12,
    gap: 6,
  },
  tipTitle: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "800",
  },
  tipText: {
    color: "#a9b4c6",
    fontSize: 14,
    lineHeight: 20,
  },
});
