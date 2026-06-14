import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { DrinkMark } from "../components/DrinkMark";
import { IngredientPicker } from "../components/IngredientPicker";
import { SectionPanel } from "../components/SectionPanel";
import { Ingredient, IngredientCategory } from "../data/cocktails";
import { colors, fonts, pressed, radii, spacing } from "../theme";

type IngredientGroup = {
  key: IngredientCategory;
  label: string;
};

type OnboardingScreenProps = {
  ingredients: Ingredient[];
  ingredientGroups: readonly IngredientGroup[];
  selectedIngredients: string[];
  perfectMatchesCount: number;
  onToggleIngredient: (ingredientId: string) => void;
  onClear: () => void;
  onResetToStarter: () => void;
  onStartMatching: () => void;
};

export function OnboardingScreen({
  ingredients,
  ingredientGroups,
  selectedIngredients,
  perfectMatchesCount,
  onToggleIngredient,
  onClear,
  onResetToStarter,
  onStartMatching,
}: OnboardingScreenProps) {
  const canStartMatching = selectedIngredients.length > 0;

  return (
    <View style={styles.shell}>
      <ScrollView key="onboarding" style={styles.screen} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>Домашний бар</Text>
            <Text style={styles.heroTitle}>Что можно смешать из того, что есть дома?</Text>
            <Text style={styles.subtitle}>
              Отметь бутылки, соки, цитрус и сиропы. Подборка сразу покажет готовые рецепты и самые выгодные покупки.
            </Text>
          </View>
          <View style={styles.heroMark}>
            <DrinkMark size="large" tone="amber" variant="shaker" />
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{selectedIngredients.length}</Text>
              <Text style={styles.statLabel}>выбрано</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{perfectMatchesCount}</Text>
              <Text style={styles.statLabel}>готово</Text>
            </View>
          </View>
        </View>

        <SectionPanel
          title="Собери бар"
          hint="Начни с реальных бутылок и миксеров. Для быстрой проверки можно взять стартовый набор."
        >
          <IngredientPicker
            ingredients={ingredients}
            ingredientGroups={ingredientGroups}
            selectedIngredients={selectedIngredients}
            onToggleIngredient={onToggleIngredient}
            onClear={onClear}
            onReset={onResetToStarter}
          />
        </SectionPanel>
      </ScrollView>

      <View style={styles.dock}>
        <View style={styles.dockInner}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Подобрать коктейли из выбранных ингредиентов"
            accessibilityState={{ disabled: !canStartMatching }}
            disabled={!canStartMatching}
            onPress={onStartMatching}
            style={({ pressed: isPressed }) => [
              styles.primaryButton,
              !canStartMatching && styles.primaryButtonDisabled,
              isPressed && canStartMatching && { opacity: pressed.opacity },
            ]}
          >
            <Text
              style={[
                styles.primaryButtonText,
                !canStartMatching && styles.primaryButtonTextDisabled,
              ]}
            >
              Подобрать коктейли
            </Text>
          </Pressable>
          <Text style={styles.dockHint}>Аккаунт можно создать позже, бар сохранится на устройстве.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    width: "100%",
    maxWidth: 980,
    alignSelf: "center",
    padding: spacing.lg,
    paddingBottom: 118,
    gap: spacing.xl,
  },
  hero: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#06170f",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(237, 169, 52, 0.58)",
    padding: spacing.xl,
    gap: spacing.md,
    overflow: "hidden",
  },
  heroCopy: {
    flex: 1,
    flexBasis: 460,
    minWidth: 0,
    gap: spacing.md,
  },
  heroMark: {
    width: 150,
    minHeight: 132,
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: {
    color: colors.accent,
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  heroTitle: {
    color: colors.paper,
    fontFamily: fonts.display,
    fontSize: 40,
    fontWeight: "900",
    lineHeight: 46,
    maxWidth: 760,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 23,
    maxWidth: 720,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  stat: {
    flex: 1,
    backgroundColor: "rgba(7, 26, 18, 0.88)",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(237, 169, 52, 0.34)",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  statValue: {
    color: colors.paper,
    fontFamily: fonts.display,
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 28,
  },
  statLabel: {
    color: colors.textSubtle,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  dock: {
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.borderMuted,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  dockInner: {
    width: "100%",
    maxWidth: 980,
    alignSelf: "center",
    gap: 7,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.success,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  primaryButtonDisabled: {
    backgroundColor: colors.surfaceMuted,
  },
  primaryButtonText: {
    color: colors.textOnAccent,
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },
  primaryButtonTextDisabled: {
    color: colors.textDim,
  },
  dockHint: {
    color: colors.textSubtle,
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
  },
});
