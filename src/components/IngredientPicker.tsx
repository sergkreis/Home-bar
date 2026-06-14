import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { Ingredient, IngredientCategory } from "../data/cocktails";
import { colors, pressed, radii, spacing } from "../theme";

type IngredientGroup = {
  key: IngredientCategory;
  label: string;
};

type IngredientPickerProps = {
  ingredients: Ingredient[];
  ingredientGroups: readonly IngredientGroup[];
  selectedIngredients: string[];
  onToggleIngredient: (ingredientId: string) => void;
  onClear: () => void;
  onReset: () => void;
};

function normalizeText(value: string) {
  return value.trim().toLocaleLowerCase("ru-RU");
}

const defaultExpandedGroups = new Set<IngredientCategory>(["spirit", "mixer", "liqueur"]);

export function IngredientPicker({
  ingredients,
  ingredientGroups,
  selectedIngredients,
  onToggleIngredient,
  onClear,
  onReset,
}: IngredientPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<IngredientCategory>>(defaultExpandedGroups);
  const isSearching = normalizeText(searchQuery).length > 0;

  const selectedIngredientNames = useMemo(
    () =>
      selectedIngredients
        .map((ingredientId) => ingredients.find((ingredient) => ingredient.id === ingredientId)?.name)
        .filter((name): name is string => Boolean(name)),
    [ingredients, selectedIngredients],
  );

  const filteredIngredients = useMemo(() => {
    const normalizedQuery = normalizeText(searchQuery);

    if (!normalizedQuery) {
      return ingredients;
    }

    return ingredients.filter((ingredient) => {
      const searchableText = [ingredient.name, ...(ingredient.aliases ?? [])].join(" ");

      return normalizeText(searchableText).includes(normalizedQuery);
    });
  }, [ingredients, searchQuery]);

  const commonIngredients = useMemo(
    () => ingredients.filter((ingredient) => ingredient.isCommon).slice(0, 18),
    [ingredients],
  );

  const toggleGroup = (groupKey: IngredientCategory) => {
    setExpandedGroups((current) => {
      const next = new Set(current);

      if (next.has(groupKey)) {
        next.delete(groupKey);
        return next;
      }

      next.add(groupKey);
      return next;
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <View style={styles.toolbarCopy}>
          <Text style={styles.toolbarValue}>{selectedIngredients.length}</Text>
          <Text style={styles.toolbarLabel}>выбрано из {ingredients.length}</Text>
        </View>
        <View style={styles.toolbarActions}>
          <Pressable
            accessibilityRole="button"
            onPress={onReset}
            style={({ pressed: isPressed }) => [styles.secondaryButton, isPressed && { opacity: pressed.opacity }]}
          >
            <Text style={styles.secondaryButtonText}>Стартовый</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={onClear}
            style={({ pressed: isPressed }) => [styles.secondaryButton, isPressed && { opacity: pressed.opacity }]}
          >
            <Text style={styles.secondaryButtonText}>Очистить</Text>
          </Pressable>
        </View>
      </View>

      {selectedIngredientNames.length > 0 ? (
        <View style={styles.selectedBlock}>
          <Text style={styles.selectedTitle}>В баре</Text>
          <View style={styles.selectedWrap}>
            {selectedIngredientNames.slice(0, 12).map((name) => (
              <Text key={name} style={styles.selectedChip}>
                {name}
              </Text>
            ))}
            {selectedIngredientNames.length > 12 ? (
              <Text style={styles.selectedMore}>+{selectedIngredientNames.length - 12}</Text>
            ) : null}
          </View>
        </View>
      ) : (
        <View style={styles.emptySelection}>
          <Text style={styles.emptyTitle}>Бар пока пуст</Text>
          <Text style={styles.emptyText}>Добавь пару бутылок, цитрус или миксер, и подборка оживет.</Text>
        </View>
      )}

      <View style={styles.searchWrap}>
        <TextInput
          accessibilityLabel="Поиск ингредиента"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Поиск по бутылкам, сокам и ингредиентам"
          placeholderTextColor={colors.textDim}
          style={styles.searchInput}
        />
      </View>

      {searchQuery ? (
        <Text style={styles.searchMeta}>Найдено: {filteredIngredients.length}</Text>
      ) : null}

      {!isSearching && commonIngredients.length > 0 ? (
        <View style={styles.featuredBlock}>
          <View style={styles.featuredHeader}>
            <Text style={styles.groupTitle}>Часто бывает дома</Text>
            <Text style={styles.groupCount}>{commonIngredients.length}</Text>
          </View>
          <View style={styles.chipWrap}>
            {commonIngredients.map((ingredient) => {
              const isActive = selectedIngredients.includes(ingredient.id);

              return (
                <Pressable
                  accessibilityRole="button"
                  key={ingredient.id}
                  onPress={() => onToggleIngredient(ingredient.id)}
                  style={({ pressed: isPressed }) => [
                    styles.chip,
                    styles.featuredChip,
                    isActive && styles.chipActive,
                    isPressed && { opacity: pressed.opacity },
                  ]}
                >
                  <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>
                    {ingredient.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {ingredientGroups.map((group) => {
        const groupIngredients = filteredIngredients.filter(
          (ingredient) => ingredient.category === group.key,
        );
        const isExpanded = isSearching || expandedGroups.has(group.key);

        if (groupIngredients.length === 0) {
          return null;
        }

        return (
          <View key={group.key} style={styles.groupBlock}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: isExpanded }}
              onPress={() => toggleGroup(group.key)}
              style={({ pressed: isPressed }) => [
                styles.groupHeader,
                isPressed && { opacity: pressed.opacity },
              ]}
            >
              <Text style={styles.groupTitle}>{group.label}</Text>
              <View style={styles.groupMeta}>
                <Text style={styles.groupCount}>{groupIngredients.length}</Text>
                <Text style={styles.groupChevron}>{isExpanded ? "−" : "+"}</Text>
              </View>
            </Pressable>
            {isExpanded ? (
              <View style={styles.chipWrap}>
                {groupIngredients.map((ingredient) => {
                  const isActive = selectedIngredients.includes(ingredient.id);

                  return (
                    <Pressable
                      accessibilityRole="button"
                      key={ingredient.id}
                      onPress={() => onToggleIngredient(ingredient.id)}
                      style={({ pressed: isPressed }) => [
                        styles.chip,
                        isActive && styles.chipActive,
                        isPressed && { opacity: pressed.opacity },
                      ]}
                    >
                      <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>
                        {ingredient.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>
        );
      })}

      {filteredIngredients.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Ничего не нашлось</Text>
          <Text style={styles.emptyText}>Попробуй другое название ингредиента или очисти поиск.</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  toolbarCopy: {
    flex: 1,
  },
  toolbarValue: {
    color: colors.textInverse,
    fontSize: 26,
    fontWeight: "900",
    lineHeight: 30,
  },
  toolbarLabel: {
    color: colors.textSubtle,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  toolbarActions: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  secondaryButton: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
  },
  selectedBlock: {
    gap: spacing.sm,
  },
  selectedTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  selectedWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  selectedChip: {
    color: colors.tealDark,
    backgroundColor: colors.tealSoft,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "#27695b",
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: "900",
    overflow: "hidden",
  },
  selectedMore: {
    color: colors.text,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: "900",
    overflow: "hidden",
  },
  emptySelection: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 4,
  },
  searchWrap: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 12,
  },
  searchInput: {
    color: colors.text,
    fontSize: 15,
    paddingVertical: 12,
  },
  searchMeta: {
    color: colors.textSubtle,
    fontSize: 12,
    fontWeight: "800",
  },
  groupBlock: {
    gap: 10,
  },
  featuredBlock: {
    gap: 10,
    backgroundColor: colors.tealSoft,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "#27695b",
    padding: spacing.md,
  },
  featuredHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
  },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
    minHeight: 42,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  groupTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  groupCount: {
    color: colors.textSubtle,
    fontSize: 12,
    fontWeight: "900",
  },
  groupMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  groupChevron: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 20,
    minWidth: 14,
    textAlign: "center",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  featuredChip: {
    borderColor: "#27695b",
  },
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  chipLabelActive: {
    color: colors.textOnAccent,
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 6,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  emptyText: {
    color: colors.textSubtle,
    fontSize: 14,
    lineHeight: 20,
  },
});
