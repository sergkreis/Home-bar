import type { ComponentType } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import ArrowRight from "lucide-react-native/dist/cjs/icons/arrow-right";
import BadgeCheck from "lucide-react-native/dist/cjs/icons/badge-check";
import CircleAlert from "lucide-react-native/dist/cjs/icons/circle-alert";
import Droplets from "lucide-react-native/dist/cjs/icons/droplets";
import Flame from "lucide-react-native/dist/cjs/icons/flame";
import Zap from "lucide-react-native/dist/cjs/icons/zap";

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
      Icon: Droplets,
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
    Icon: Zap,
    cardStyle: styles.actionCardAmber,
    iconStyle: styles.actionIconAmber,
    iconColor: colors.accent,
  };
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
  const hasPerfectMatches = perfectMatches.length > 0;
  const HeroIcon = hasPerfectMatches ? BadgeCheck : CircleAlert;

  return (
    <>
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={[styles.heroIcon, hasPerfectMatches ? styles.heroIconReady : styles.heroIconAlmost]}>
            <HeroIcon
              color={hasPerfectMatches ? colors.success : colors.accent}
              size={22}
              strokeWidth={2.5}
            />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroLabel}>План на вечер</Text>
            <Text style={styles.heroTitle}>
              {hasPerfectMatches
                ? `${perfectMatches.length} готовых рецептов`
                : almostReady.length > 0
                  ? "Почти готово"
                  : "Собери первый бар"}
            </Text>
          </View>
        </View>

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
              <Text style={styles.heroPickMeta}>
                {heroCocktail.missingIngredients.length === 0
                  ? "Все ингредиенты есть"
                  : `Не хватает: ${heroCocktail.missingIngredients.length}`}
              </Text>
            </View>
            <ArrowRight color={colors.textMuted} size={22} strokeWidth={2.4} />
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
                onPress={() => onApplyQuickMode(mode.taste)}
                style={({ pressed: isPressed }) => [
                  styles.actionCard,
                  visual.cardStyle,
                  isPressed && { opacity: pressed.opacity },
                ]}
              >
                <View style={styles.actionCardTop}>
                  <View style={[styles.actionIcon, visual.iconStyle]}>
                    <Icon color={visual.iconColor} size={18} strokeWidth={2.5} />
                  </View>
                  <Text style={styles.actionMeta}>{mode.matches.length}</Text>
                </View>
                <Text style={styles.actionTitle}>{mode.title}</Text>
                <Text style={styles.actionSubtitle}>{mode.subtitle}</Text>
                <Text style={styles.actionPreview} numberOfLines={1}>
                  {mode.matches.slice(0, 2).map((cocktail) => cocktail.name).join(", ")}
                </Text>
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
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  heroIconReady: {
    backgroundColor: colors.successBg,
  },
  heroIconAlmost: {
    backgroundColor: colors.warningBg,
  },
  heroCopy: {
    flex: 1,
    gap: 2,
  },
  heroLabel: {
    color: colors.teal,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  heroTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 33,
  },
  heroText: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 760,
  },
  heroPick: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  heroPickCopy: {
    flex: 1,
    gap: 3,
  },
  heroPickLabel: {
    color: colors.textSubtle,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  heroPickTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 24,
  },
  heroPickMeta: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  actionCard: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 165,
    minHeight: 132,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 7,
  },
  actionCardAmber: {
    borderColor: "#dfc993",
  },
  actionCardTeal: {
    borderColor: "#abd6d0",
  },
  actionCardBerry: {
    borderColor: "#e3b4c5",
  },
  actionCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  actionIcon: {
    width: 34,
    height: 34,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  actionIconAmber: {
    backgroundColor: colors.accentSoft,
  },
  actionIconTeal: {
    backgroundColor: colors.tealSoft,
  },
  actionIconBerry: {
    backgroundColor: colors.berrySoft,
  },
  actionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  actionMeta: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
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
