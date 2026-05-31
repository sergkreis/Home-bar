import { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { IngredientPicker } from "../components/IngredientPicker";
import { SectionPanel } from "../components/SectionPanel";
import { Ingredient, IngredientCategory } from "../data/cocktails";
import { colors, pressed, radii, spacing } from "../theme";

type IngredientGroup = {
  key: IngredientCategory;
  label: string;
};

type OnboardingScreenProps = {
  ingredients: Ingredient[];
  ingredientGroups: readonly IngredientGroup[];
  selectedIngredients: string[];
  perfectMatchesCount: number;
  accountPanel?: ReactNode;
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
  accountPanel,
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
          <Text style={styles.eyebrow}>Домашний бар</Text>
          <Text style={styles.heroTitle}>Что есть дома?</Text>
          <Text style={styles.subtitle}>
            Отметь алкоголь, соки, цитрус и сиропы. Потом сразу покажем, что можно смешать сейчас.
          </Text>

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
          title="Выбери ингредиенты"
          hint="Начни с реальных бутылок и миксеров. Если хочешь быстро посмотреть демо, нажми «Стартовый»."
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
        {accountPanel ?? (
          <View style={styles.accountLater}>
            <Text style={styles.accountLaterTitle}>Аккаунт позже</Text>
            <Text style={styles.hint}>Сейчас бар сохраняется на этом устройстве.</Text>
          </View>
        )}
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
    padding: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  hero: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.md,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: "#313b48",
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  heroTitle: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 34,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  stat: {
    flex: 1,
    backgroundColor: "#121a24",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "#344151",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  statValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
  },
  statLabel: {
    color: "#91a0b4",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  dock: {
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: "#303f4d",
    paddingHorizontal: spacing.md,
    paddingTop: 10,
    paddingBottom: spacing.md,
    gap: 8,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  primaryButtonDisabled: {
    backgroundColor: "#303846",
  },
  primaryButtonText: {
    color: colors.accentText,
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },
  primaryButtonTextDisabled: {
    color: "#8591a3",
  },
  accountLater: {
    minHeight: 42,
    borderRadius: radii.md,
    backgroundColor: "#151b23",
    borderWidth: 1,
    borderColor: "#283241",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 2,
  },
  accountLaterTitle: {
    color: "#dce4ef",
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
  },
  hint: {
    color: "#91a0b4",
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
  },
});
