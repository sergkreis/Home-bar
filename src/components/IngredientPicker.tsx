import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { Ingredient, IngredientCategory } from "../data/cocktails";

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

export function IngredientPicker({
  ingredients,
  ingredientGroups,
  selectedIngredients,
  onToggleIngredient,
  onClear,
  onReset,
}: IngredientPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");

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

    return ingredients.filter((ingredient) =>
      normalizeText(ingredient.name).includes(normalizedQuery),
    );
  }, [ingredients, searchQuery]);

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <View>
          <Text style={styles.toolbarValue}>{selectedIngredients.length}</Text>
          <Text style={styles.toolbarLabel}>выбрано</Text>
        </View>
        <View style={styles.toolbarActions}>
          <Pressable accessibilityRole="button" onPress={onReset} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Стартовый</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={onClear} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Очистить</Text>
          </Pressable>
        </View>
      </View>

      {selectedIngredientNames.length > 0 ? (
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
      ) : (
        <Text style={styles.emptySelection}>Бар пуст. Добавь несколько базовых ингредиентов.</Text>
      )}

      <View style={styles.searchWrap}>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Поиск по бутылкам, сокам и ингредиентам"
          placeholderTextColor="#6f7d90"
          style={styles.searchInput}
        />
      </View>

      {searchQuery ? (
        <Text style={styles.searchMeta}>Найдено: {filteredIngredients.length}</Text>
      ) : null}

      {ingredientGroups.map((group) => {
        const groupIngredients = filteredIngredients.filter(
          (ingredient) => ingredient.category === group.key,
        );

        if (groupIngredients.length === 0) {
          return null;
        }

        return (
          <View key={group.key} style={styles.groupBlock}>
            <Text style={styles.groupTitle}>{group.label}</Text>
            <View style={styles.chipWrap}>
              {groupIngredients.map((ingredient) => {
                const isActive = selectedIngredients.includes(ingredient.id);

                return (
                  <Pressable
                    accessibilityRole="button"
                    key={ingredient.id}
                    onPress={() => onToggleIngredient(ingredient.id)}
                    style={[styles.chip, isActive && styles.chipActive]}
                  >
                    <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>
                      {ingredient.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}

      {filteredIngredients.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Ничего не нашлось</Text>
          <Text style={styles.emptyText}>
            Попробуй другое название ингредиента или очисти поиск.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    backgroundColor: "#121821",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2b3441",
    padding: 12,
  },
  toolbarValue: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "900",
  },
  toolbarLabel: {
    color: "#91a0b4",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  toolbarActions: {
    flexDirection: "row",
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: "#141a22",
    borderColor: "#39414f",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  secondaryButtonText: {
    color: "#dce4ef",
    fontSize: 12,
    fontWeight: "900",
  },
  selectedWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  selectedChip: {
    color: "#15202a",
    backgroundColor: "#f4b860",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: "900",
    overflow: "hidden",
  },
  selectedMore: {
    color: "#f8fafc",
    backgroundColor: "#303846",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: "900",
    overflow: "hidden",
  },
  emptySelection: {
    color: "#97a3b6",
    fontSize: 14,
    lineHeight: 20,
  },
  searchWrap: {
    backgroundColor: "#141a22",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#303846",
    paddingHorizontal: 12,
  },
  searchInput: {
    color: "#f8fafc",
    fontSize: 15,
    paddingVertical: 12,
  },
  searchMeta: {
    color: "#97a3b6",
    fontSize: 12,
    fontWeight: "800",
  },
  groupBlock: {
    gap: 10,
  },
  groupTitle: {
    color: "#cfd7e3",
    fontSize: 14,
    fontWeight: "900",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#3a4250",
    backgroundColor: "#141a22",
    borderRadius: 8,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  chipActive: {
    backgroundColor: "#f4b860",
    borderColor: "#f4b860",
  },
  chipLabel: {
    color: "#d5dcea",
    fontSize: 14,
    fontWeight: "800",
  },
  chipLabelActive: {
    color: "#1a1d24",
  },
  emptyState: {
    backgroundColor: "#141a22",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#303846",
    padding: 12,
    gap: 6,
  },
  emptyTitle: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "900",
  },
  emptyText: {
    color: "#97a3b6",
    fontSize: 14,
    lineHeight: 20,
  },
});
