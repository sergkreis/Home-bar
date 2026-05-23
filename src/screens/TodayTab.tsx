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
  return (
    <>
      <SectionPanel title="Что выпить сегодня" hint={tonightHeadline}>
        <View style={styles.actions}>
          {quickModes.map((mode) => (
            <Pressable
              accessibilityLabel={`${mode.title}: ${mode.matches.length} коктейлей`}
              accessibilityRole="button"
              key={mode.id}
              onPress={() => onApplyQuickMode(mode.taste)}
              style={({ pressed: isPressed }) => [
                styles.actionCard,
                mode.accent === "teal" && styles.actionCardTeal,
                mode.accent === "berry" && styles.actionCardBerry,
                isPressed && { opacity: pressed.opacity },
              ]}
            >
              <View
                style={[
                  styles.actionAccent,
                  mode.accent === "teal" && styles.actionAccentTeal,
                  mode.accent === "berry" && styles.actionAccentBerry,
                ]}
              />
              <View style={styles.actionCardTop}>
                <Text style={styles.actionTitle}>{mode.title}</Text>
                <Text style={styles.actionMeta}>{mode.matches.length}</Text>
              </View>
              <Text style={styles.actionSubtitle}>{mode.subtitle}</Text>
              <Text style={styles.actionPreview}>
                {mode.matches.slice(0, 2).map((cocktail) => cocktail.name).join(", ")}
              </Text>
            </Pressable>
          ))}
        </View>
      </SectionPanel>

      <CocktailResults
        title="Готово сейчас"
        hint="Коктейли, для которых все уже есть дома."
        cocktails={perfectMatches.slice(0, 6)}
        ingredients={ingredients}
        emptyText="Пока нет точных совпадений. Открой вкладку «Докупить» или добавь ингредиенты в «Мой бар»."
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
  actions: {
    gap: 8,
  },
  actionCard: {
    position: "relative",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    padding: 12,
    paddingLeft: spacing.lg,
    gap: 6,
    overflow: "hidden",
  },
  actionCardTeal: {
    borderColor: colors.tealDark,
  },
  actionCardBerry: {
    borderColor: colors.berryDark,
  },
  actionAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.accent,
  },
  actionAccentTeal: {
    backgroundColor: colors.teal,
  },
  actionAccentBerry: {
    backgroundColor: colors.berry,
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
    color: colors.accent,
    fontSize: 16,
    fontWeight: "900",
  },
  actionSubtitle: {
    color: "#9fb0c5",
    fontSize: 13,
    lineHeight: 18,
  },
  actionPreview: {
    color: "#e4ebf5",
    fontSize: 14,
    lineHeight: 20,
  },
});
