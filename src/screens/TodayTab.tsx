import { Pressable, StyleSheet, Text, View } from "react-native";

import { CocktailResults } from "../components/CocktailResults";
import { SectionPanel } from "../components/SectionPanel";
import { Ingredient, TasteTag } from "../data/cocktails";
import { colors, pressed, radii, spacing } from "../theme";
import { RankedCocktail } from "../utils/cocktailMatcher";

export type QuickMode = {
  id: string;
  title: string;
  subtitle: string;
  accent: "amber" | "teal" | "berry";
  taste: TasteTag | null;
  matches: RankedCocktail[];
};

type TodayTabProps = {
  quickModes: QuickMode[];
  tonightHeadline: string;
  perfectMatches: RankedCocktail[];
  almostReady: RankedCocktail[];
  ingredients: Ingredient[];
  onApplyQuickMode: (taste: TasteTag | null) => void;
  onSelectCocktail: (cocktail: RankedCocktail) => void;
  isFavorite: (cocktailId: string) => boolean;
  onToggleFavorite: (cocktailId: string) => void;
};

function getAccentStyle(accent: QuickMode["accent"]) {
  if (accent === "teal") {
    return styles.actionCardTeal;
  }

  if (accent === "berry") {
    return styles.actionCardBerry;
  }

  return styles.actionCardAmber;
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
  const heroCocktail = perfectMatches[0] ?? almostReady[0] ?? null;

  return (
    <>
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>Сегодня</Text>
        <Text style={styles.heroTitle}>
          {perfectMatches.length > 0
            ? `${perfectMatches.length} готовых коктейлей`
            : almostReady.length > 0
              ? "Почти готово"
              : "Собери первый бар"}
        </Text>
        <Text style={styles.heroText}>{tonightHeadline}</Text>

        {heroCocktail ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Открыть ${heroCocktail.name}`}
            onPress={() => onSelectCocktail(heroCocktail)}
            style={({ pressed: isPressed }) => [
              styles.heroPick,
              isPressed && { opacity: pressed.opacity },
            ]}
          >
            <View style={styles.heroPickCopy}>
              <Text style={styles.heroPickLabel}>Лучший вариант</Text>
              <Text style={styles.heroPickTitle}>{heroCocktail.name}</Text>
            </View>
            <Text style={styles.heroPickMeta}>
              {heroCocktail.missingIngredients.length === 0
                ? "Готов"
                : `Не хватает ${heroCocktail.missingIngredients.length}`}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <SectionPanel title="Быстрый выбор">
        <View style={styles.actions}>
          {quickModes.map((mode) => (
            <Pressable
              accessibilityLabel={`${mode.title}: ${mode.matches.length} коктейлей`}
              accessibilityRole="button"
              key={mode.id}
              onPress={() => onApplyQuickMode(mode.taste)}
              style={({ pressed: isPressed }) => [
                styles.actionCard,
                getAccentStyle(mode.accent),
                isPressed && { opacity: pressed.opacity },
              ]}
            >
              <View style={styles.actionCardTop}>
                <Text style={styles.actionTitle}>{mode.title}</Text>
                <Text style={styles.actionMeta}>{mode.matches.length}</Text>
              </View>
              <Text style={styles.actionSubtitle}>{mode.subtitle}</Text>
              <Text style={styles.actionPreview} numberOfLines={1}>
                {mode.matches.slice(0, 2).map((cocktail) => cocktail.name).join(", ")}
              </Text>
            </Pressable>
          ))}
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
    backgroundColor: colors.surfaceDark,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  heroLabel: {
    color: "#b7d9d4",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  heroTitle: {
    color: colors.textInverse,
    fontSize: 31,
    fontWeight: "900",
    lineHeight: 36,
  },
  heroText: {
    color: "#d7ded8",
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 720,
  },
  heroPick: {
    marginTop: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    backgroundColor: "#252820",
    borderWidth: 1,
    borderColor: "#3f4437",
    borderRadius: radii.md,
    padding: spacing.md,
  },
  heroPickCopy: {
    flex: 1,
    gap: 2,
  },
  heroPickLabel: {
    color: "#c8d0c8",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  heroPickTitle: {
    color: colors.textInverse,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 23,
  },
  heroPickMeta: {
    color: colors.accentSoft,
    fontSize: 13,
    fontWeight: "900",
  },
  actions: {
    gap: spacing.sm,
  },
  actionCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.md,
    gap: 6,
  },
  actionCardAmber: {
    borderColor: "#e3c78d",
  },
  actionCardTeal: {
    borderColor: "#a9d5cf",
    backgroundColor: colors.tealSoft,
  },
  actionCardBerry: {
    borderColor: "#e5b3c6",
    backgroundColor: colors.berrySoft,
  },
  actionCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  actionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  actionMeta: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  actionSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  actionPreview: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
});
