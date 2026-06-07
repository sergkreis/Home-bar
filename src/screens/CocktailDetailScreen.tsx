import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { FavoriteButton } from "../components/FavoriteButton";
import { SectionPanel } from "../components/SectionPanel";
import { Ingredient } from "../data/cocktails";
import { colors, pressed, radii, spacing } from "../theme";
import { getStrengthLabel } from "../utils/cocktailLabels";
import { RankedCocktail } from "../utils/cocktailMatcher";

type CocktailDetailScreenProps = {
  cocktail: RankedCocktail;
  ingredients: Ingredient[];
  onBack: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onAddIngredientToBar: (ingredientId: string) => void;
  ownedIngredientIds: string[];
};

function getIngredientName(ingredients: Ingredient[], ingredientId: string) {
  return ingredients.find((ingredient) => ingredient.id === ingredientId)?.name ?? ingredientId;
}

export function CocktailDetailScreen({
  cocktail,
  ingredients,
  onBack,
  isFavorite,
  onToggleFavorite,
  onAddIngredientToBar,
  ownedIngredientIds,
}: CocktailDetailScreenProps) {
  const ownedSet = new Set(ownedIngredientIds);
  const missingCount = cocktail.missingIngredients.length;

  return (
    <ScrollView key="detail" style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Вернуться к списку коктейлей"
            onPress={onBack}
            style={({ pressed: isPressed }) => [
              styles.backButton,
              isPressed && { opacity: pressed.opacity },
            ]}
          >
            <Text style={styles.backButtonLabel}>← Назад</Text>
          </Pressable>
          <FavoriteButton
            isFavorite={isFavorite}
            onToggle={onToggleFavorite}
            label={cocktail.name}
            size="large"
          />
        </View>
        <Text style={styles.title}>{cocktail.name}</Text>
        <Text style={styles.meta}>
          {cocktail.baseSpirit} · {getStrengthLabel(cocktail.strength)} · {cocktail.glassName}
        </Text>

        <View style={styles.statusRow}>
          <View
            style={[styles.statusBadge, missingCount === 0 ? styles.readyBadge : styles.missingBadge]}
          >
            <Text style={styles.statusBadgeText}>
              {missingCount === 0 ? "Готово сейчас" : `Не хватает ${missingCount}`}
            </Text>
          </View>
          <Text style={styles.matchText}>
            {cocktail.availableCount}/{cocktail.ingredients.length} ингредиентов
          </Text>
        </View>
      </View>

      {missingCount > 0 ? (
        <View style={styles.callout}>
          <Text style={styles.calloutLabel}>Докупи и отметь</Text>
          <View style={styles.shoppingChips}>
            {cocktail.missingIngredients.map((ingredientId) => (
              <Pressable
                key={ingredientId}
                accessibilityRole="button"
                accessibilityLabel={`Добавить ${getIngredientName(ingredients, ingredientId)} в мой бар`}
                onPress={() => onAddIngredientToBar(ingredientId)}
                style={({ pressed: isPressed }) => [
                  styles.shoppingChip,
                  isPressed && { opacity: pressed.opacity },
                ]}
              >
                <Text style={styles.shoppingChipText}>
                  + {getIngredientName(ingredients, ingredientId)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <SectionPanel title="Ингредиенты">
        <View style={styles.recipeList}>
          {cocktail.recipeIngredients.map(({ ingredientId, amount }) => {
            const isOwned = ownedSet.has(ingredientId);
            const isMissing = cocktail.missingIngredients.includes(ingredientId);

            return (
              <View key={ingredientId} style={styles.recipeRow}>
                <View style={styles.recipeRowMain}>
                  <View style={[styles.dot, isOwned ? styles.dotOwned : styles.dotMissing]} />
                  <Text style={styles.recipeRowText}>
                    {getIngredientName(ingredients, ingredientId)}
                  </Text>
                </View>
                <View style={styles.recipeRowRight}>
                  <Text style={styles.recipeAmount}>{amount}</Text>
                  {isMissing ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Добавить ${getIngredientName(ingredients, ingredientId)} в мой бар`}
                      onPress={() => onAddIngredientToBar(ingredientId)}
                      style={({ pressed: isPressed }) => [
                        styles.addButton,
                        isPressed && { opacity: pressed.opacity },
                      ]}
                    >
                      <Text style={styles.addButtonText}>+ В бар</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      </SectionPanel>

      <SectionPanel title="Как приготовить">
        <View style={styles.steps}>
          {cocktail.steps.map((step, index) => (
            <View key={`${cocktail.id}-${index}`} style={styles.stepRow}>
              <View style={styles.stepIndexWrap}>
                <Text style={styles.stepIndexText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
        {cocktail.garnish ? (
          <View style={styles.callout}>
            <Text style={styles.calloutLabel}>Подача</Text>
            <Text style={styles.calloutText}>{cocktail.garnish}</Text>
          </View>
        ) : null}
      </SectionPanel>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    width: "100%",
    maxWidth: 920,
    alignSelf: "center",
    padding: spacing.md,
    paddingBottom: 40,
    gap: spacing.xl,
  },
  header: {
    backgroundColor: colors.surfaceDark,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.md,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  backButton: {
    backgroundColor: "#272923",
    borderWidth: 1,
    borderColor: "#3a3e35",
    borderRadius: radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  backButtonLabel: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: "900",
  },
  title: {
    color: colors.textInverse,
    fontSize: 36,
    fontWeight: "900",
    lineHeight: 40,
  },
  meta: {
    color: "#d7ded8",
    fontSize: 15,
    lineHeight: 21,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  statusBadge: {
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  readyBadge: {
    backgroundColor: colors.successBg,
  },
  missingBadge: {
    backgroundColor: colors.warningBg,
  },
  statusBadgeText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  matchText: {
    color: "#d7ded8",
    fontSize: 13,
    fontWeight: "900",
  },
  callout: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  calloutLabel: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  calloutText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  shoppingChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  shoppingChip: {
    backgroundColor: colors.warningBg,
    borderColor: "#dfc37d",
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  shoppingChipText: {
    color: colors.warning,
    fontSize: 13,
    fontWeight: "900",
  },
  recipeList: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  recipeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    minHeight: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderMuted,
  },
  recipeRowMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  recipeRowText: {
    color: colors.text,
    fontSize: 15,
  },
  recipeRowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recipeAmount: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  addButton: {
    backgroundColor: colors.warningBg,
    borderColor: "#dfc37d",
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  addButtonText: {
    color: colors.warning,
    fontSize: 11,
    fontWeight: "900",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotOwned: {
    backgroundColor: colors.success,
  },
  dotMissing: {
    backgroundColor: colors.accent,
  },
  steps: {
    gap: spacing.sm,
  },
  stepRow: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  stepIndexWrap: {
    width: 30,
    height: 30,
    borderRadius: radii.pill,
    backgroundColor: colors.teal,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  stepIndexText: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: "900",
  },
  stepText: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
});
