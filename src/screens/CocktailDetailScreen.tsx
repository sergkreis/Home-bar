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
          {cocktail.baseSpirit} - {getStrengthLabel(cocktail.strength)}
        </Text>
      </View>

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

      {missingCount > 0 ? (
        <View style={styles.callout}>
          <Text style={styles.calloutLabel}>Докупить</Text>
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
          <Text style={styles.calloutHint}>Нажми, чтобы отметить как купленное.</Text>
        </View>
      ) : null}

      <SectionPanel title="Ингредиенты">
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
      </SectionPanel>

      <SectionPanel title="Как приготовить" hint={`Бокал: ${cocktail.glassName}`}>
        {cocktail.steps.map((step, index) => (
          <View key={`${cocktail.id}-${index}`} style={styles.stepRow}>
            <View style={styles.stepIndexWrap}>
              <Text style={styles.stepIndexText}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
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
    padding: spacing.md,
    paddingBottom: 40,
    gap: spacing.md,
  },
  header: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  backButton: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    borderRadius: radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  backButtonLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 34,
  },
  meta: {
    color: "#9fb0c5",
    fontSize: 15,
    lineHeight: 20,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  statusBadge: {
    borderRadius: radii.sm,
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
    color: "#c4cfdd",
    fontSize: 13,
    fontWeight: "800",
  },
  callout: {
    backgroundColor: "#151b23",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    padding: 12,
    gap: 8,
  },
  calloutLabel: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  calloutText: {
    color: "#d7deea",
    fontSize: 14,
    lineHeight: 20,
  },
  calloutHint: {
    color: colors.textSubtle,
    fontSize: 12,
    fontStyle: "italic",
  },
  shoppingChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  shoppingChip: {
    backgroundColor: "#3a2f17",
    borderColor: colors.accent,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  shoppingChipText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "900",
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
    fontSize: 15,
  },
  recipeRowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recipeAmount: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: "900",
  },
  addButton: {
    backgroundColor: "#3a2f17",
    borderColor: colors.accent,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  addButtonText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "900",
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
    backgroundColor: colors.accent,
  },
  stepRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  stepIndexWrap: {
    width: 28,
    height: 28,
    borderRadius: radii.sm,
    backgroundColor: colors.teal,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  stepIndexText: {
    color: "#102124",
    fontSize: 14,
    fontWeight: "900",
  },
  stepText: {
    flex: 1,
    color: "#d7deea",
    fontSize: 15,
    lineHeight: 22,
  },
});
