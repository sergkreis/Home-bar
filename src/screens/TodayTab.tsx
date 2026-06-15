import { useMemo, type ComponentType } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import ArrowRight from "lucide-react-native/dist/cjs/icons/arrow-right";
import CircleAlert from "lucide-react-native/dist/cjs/icons/circle-alert";
import Flame from "lucide-react-native/dist/cjs/icons/flame";
import Leaf from "lucide-react-native/dist/cjs/icons/leaf";
import Sprout from "lucide-react-native/dist/cjs/icons/sprout";

import { CocktailResults } from "../components/CocktailResults";
import { DrinkArt } from "../components/DrinkArt";
import { SectionPanel } from "../components/SectionPanel";
import { Ingredient, TasteTag } from "../data/cocktails";
import { colors, fonts, pressed, radii, spacing } from "../theme";
import { getStrengthLabel } from "../utils/cocktailLabels";
import { RankedCocktail } from "../utils/cocktailMatcher";

export type QuickMode = {
  id: string;
  title: string;
  subtitle: string;
  accent: "amber" | "teal" | "berry";
  taste: TasteTag | null;
  recipeMode: "easy" | null;
  matches: RankedCocktail[];
};

type TodayTabProps = {
  quickModes: QuickMode[];
  tonightHeadline: string;
  perfectMatches: RankedCocktail[];
  almostReady: RankedCocktail[];
  ingredients: Ingredient[];
  onApplyQuickMode: (taste: TasteTag | null, recipeMode: "easy" | null) => void;
  onSelectCocktail: (cocktail: RankedCocktail) => void;
  isFavorite: (cocktailId: string) => boolean;
  onToggleFavorite: (cocktailId: string) => void;
};

type IconProps = {
  color?: string;
  size?: number | string;
  strokeWidth?: number | string;
};

function getModeVisuals(mode: QuickMode): {
  Icon: ComponentType<IconProps>;
  cardStyle: object;
  iconStyle: object;
  iconColor: string;
} {
  if (mode.accent === "teal") {
    return {
      Icon: Sprout,
      cardStyle: styles.actionCardTeal,
      iconStyle: styles.actionIconTeal,
      iconColor: colors.teal,
    };
  }

  if (mode.accent === "berry") {
    return {
      Icon: Flame,
      cardStyle: styles.actionCardBerry,
      iconStyle: styles.actionIconBerry,
      iconColor: colors.berry,
    };
  }

  return {
    Icon: Leaf,
    cardStyle: styles.actionCardAmber,
    iconStyle: styles.actionIconAmber,
    iconColor: colors.accent,
  };
}

function getIngredientName(ingredientById: Map<string, Ingredient>, ingredientId: string) {
  return ingredientById.get(ingredientId)?.name ?? ingredientId;
}

export function TodayTab({
  quickModes,
  tonightHeadline,
  perfectMatches,
  almostReady,
  ingredients,
  onApplyQuickMode,
  onSelectCocktail,
  isFavorite,
  onToggleFavorite,
}: TodayTabProps) {
  const ingredientById = useMemo(
    () => new Map(ingredients.map((ingredient) => [ingredient.id, ingredient])),
    [ingredients],
  );
  const heroCocktail = perfectMatches[0] ?? almostReady[0] ?? null;
  const heroMissingText = heroCocktail?.missingIngredients.length
    ? `Не хватает: ${heroCocktail.missingIngredients
        .slice(0, 2)
        .map((ingredientId) => getIngredientName(ingredientById, ingredientId))
        .join(", ")}`
    : "Все ингредиенты есть дома";

  return (
    <>
      <View style={styles.hero}>
        <View style={styles.heroBackdrop} />
        <View style={styles.heroContent}>
          <Text style={styles.heroLabel}>План на вечер ✧</Text>
          <Text style={styles.heroText}>Рекомендуем сегодня</Text>

          {heroCocktail ? (
            <View style={styles.heroPickCopy}>
              <Text style={styles.heroPickTitle}>{heroCocktail.name}</Text>
              <Text style={styles.heroPickMeta}>
                {heroCocktail.baseSpirit} · {getStrengthLabel(heroCocktail.strength)} · {heroCocktail.glassName}
              </Text>
              <View style={styles.heroMissingRow}>
                {heroCocktail.missingIngredients.length > 0 ? (
                  <View style={styles.heroWarningIcon}>
                    <CircleAlert color={colors.berry} size={15} strokeWidth={2.5} />
                  </View>
                ) : (
                  <View style={styles.heroReadyDot} />
                )}
                <Text style={styles.heroMissingText} numberOfLines={2}>{heroMissingText}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.heroPickCopy}>
              <Text style={styles.heroPickTitle}>Собери первый бар</Text>
              <Text style={styles.heroPickMeta}>{tonightHeadline}</Text>
            </View>
          )}
        </View>

        <View style={styles.heroVisual}>
          <DrinkArt cocktail={heroCocktail} size="hero" />
        </View>

        {heroCocktail ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Открыть ${heroCocktail.name}`}
            onPress={() => onSelectCocktail(heroCocktail)}
            style={({ pressed: isPressed }) => [
              styles.heroArrow,
              isPressed && { opacity: pressed.opacity },
            ]}
          >
            <ArrowRight color={colors.paper} size={28} strokeWidth={2.4} />
          </Pressable>
        ) : null}
      </View>

      <SectionPanel title="Быстрый выбор">
        <View style={styles.actions}>
          {quickModes.map((mode) => {
            const visual = getModeVisuals(mode);
            const Icon = visual.Icon;

            return (
              <Pressable
                accessibilityLabel={`${mode.title}: ${mode.matches.length} коктейлей`}
                accessibilityRole="button"
                key={mode.id}
                onPress={() => onApplyQuickMode(mode.taste, mode.recipeMode)}
                style={({ pressed: isPressed }) => [
                  styles.actionCard,
                  visual.cardStyle,
                  isPressed && { opacity: pressed.opacity },
                ]}
              >
                <View style={[styles.actionIcon, visual.iconStyle]}>
                  <Icon color={visual.iconColor} size={34} strokeWidth={1.9} />
                </View>
                <View style={styles.actionCopy}>
                  <Text style={styles.actionTitle}>{mode.title}</Text>
                  <Text style={styles.actionSubtitle}>{mode.subtitle}</Text>
                </View>
                <View style={styles.actionMeta}>
                  <Text style={[styles.actionCount, { color: visual.iconColor }]}>{mode.matches.length}</Text>
                  <ArrowRight color={visual.iconColor} size={19} strokeWidth={2.4} />
                </View>
              </Pressable>
            );
          })}
        </View>
      </SectionPanel>

      <CocktailResults
        title="Можно смешать сейчас"
        hint="Коктейли, для которых все уже есть дома."
        cocktails={perfectMatches.slice(0, 6)}
        ingredients={ingredients}
        emptyText="Пока нет точных совпадений. Загляни в покупки или добавь ингредиенты в бар."
        onSelectCocktail={onSelectCocktail}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
      />

      <CocktailResults
        title="Ближе всего"
        hint="Нужно докупить не больше двух ингредиентов."
        cocktails={almostReady.slice(0, 6)}
        ingredients={ingredients}
        emptyText="Добавь несколько базовых ингредиентов, и здесь появятся близкие варианты."
        onSelectCocktail={onSelectCocktail}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
      />
    </>
  );
}

const styles = StyleSheet.create({
  hero: {
    position: "relative",
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: colors.backgroundSoft,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.accentBorder,
    padding: 28,
    paddingRight: 86,
    gap: spacing.lg,
    overflow: "hidden",
    minHeight: 260,
  },
  heroBackdrop: {
    position: "absolute",
    right: -30,
    bottom: -45,
    width: 420,
    height: 260,
    borderRadius: 110,
    backgroundColor: colors.accentOverlay,
  },
  heroContent: {
    flex: 1,
    flexBasis: 360,
    minWidth: 0,
    justifyContent: "center",
    gap: spacing.sm,
  },
  heroLabel: {
    color: colors.accent,
    fontFamily: fonts.display,
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 38,
  },
  heroText: {
    color: colors.textMuted,
    fontFamily: fonts.display,
    fontSize: 18,
    lineHeight: 24,
    maxWidth: 760,
  },
  heroPickCopy: {
    gap: 8,
    marginTop: 2,
  },
  heroPickTitle: {
    color: colors.paper,
    fontFamily: fonts.display,
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 39,
  },
  heroPickMeta: {
    color: colors.textSubtle,
    fontFamily: fonts.display,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
  },
  heroMissingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginTop: spacing.md,
  },
  heroWarningIcon: {
    width: 22,
    height: 22,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.berry,
    alignItems: "center",
    justifyContent: "center",
  },
  heroReadyDot: {
    width: 13,
    height: 13,
    borderRadius: radii.pill,
    backgroundColor: colors.success,
  },
  heroMissingText: {
    color: colors.paper,
    flex: 1,
    fontFamily: fonts.display,
    fontSize: 17,
    lineHeight: 23,
  },
  heroVisual: {
    flex: 0.85,
    flexBasis: 330,
    minHeight: 248,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: -20,
    marginRight: -20,
  },
  heroArrow: {
    position: "absolute",
    top: 26,
    right: 28,
    width: 58,
    height: 58,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.accentBorderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  actionCard: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 250,
    minHeight: 104,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceTranslucentSoft,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  actionCardAmber: {
    borderColor: colors.accentBorder,
    backgroundColor: colors.accentSoft,
  },
  actionCardTeal: {
    borderColor: colors.tealBorder,
    backgroundColor: colors.tealSoft,
  },
  actionCardBerry: {
    borderColor: colors.berryBorder,
    backgroundColor: colors.berrySoft,
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  actionIconAmber: {
    backgroundColor: colors.accentOverlay,
  },
  actionIconTeal: {
    backgroundColor: colors.tealOverlay,
  },
  actionIconBerry: {
    backgroundColor: colors.berryOverlay,
  },
  actionCopy: {
    flex: 1,
    gap: 4,
  },
  actionMeta: {
    alignItems: "center",
    gap: 6,
  },
  actionCount: {
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 22,
  },
  actionTitle: {
    color: colors.paper,
    fontFamily: fonts.display,
    fontSize: 19,
    fontWeight: "800",
    lineHeight: 23,
  },
  actionSubtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});
