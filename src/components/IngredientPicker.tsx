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
};

function normalizeText(value: string) {
  return value.trim().toLocaleLowerCase("ru-RU");
}

export function IngredientPicker({
  ingredients,
  ingredientGroups,
  selectedIngredients,
  onToggleIngredient,
}: IngredientPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");

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
      <View style={styles.searchWrap}>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Поиск по бутылкам, сокам и ингредиентам"
          placeholderTextColor="#6f7d90"
          style={styles.searchInput}
        />
      </View>

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
    gap: 14,
  },
  searchWrap: {
    backgroundColor: "#161b22",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#303846",
    paddingHorizontal: 14,
  },
  searchInput: {
    color: "#f8fafc",
    fontSize: 15,
    paddingVertical: 12,
  },
  groupBlock: {
    gap: 10,
  },
  groupTitle: {
    color: "#cfd7e3",
    fontSize: 14,
    fontWeight: "700",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#3a4250",
    backgroundColor: "#161b22",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  chipActive: {
    backgroundColor: "#f4b860",
    borderColor: "#f4b860",
  },
  chipLabel: {
    color: "#d5dcea",
    fontSize: 14,
    fontWeight: "600",
  },
  chipLabelActive: {
    color: "#1a1d24",
  },
  emptyState: {
    backgroundColor: "#161b22",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#303846",
    padding: 14,
    gap: 6,
  },
  emptyTitle: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "700",
  },
  emptyText: {
    color: "#97a3b6",
    fontSize: 14,
    lineHeight: 20,
  },
});
