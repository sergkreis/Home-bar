import { StyleSheet, Text, View } from "react-native";

import { SectionPanel } from "../components/SectionPanel";
import { colors, radii, spacing } from "../theme";
import { ShoppingSuggestion } from "../utils/shoppingAdvisor";

type BuyTabProps = {
  shoppingSuggestions: ShoppingSuggestion[];
};

export function BuyTab({ shoppingSuggestions }: BuyTabProps) {
  return (
    <SectionPanel
      title="Что докупить"
      hint="Самые выгодные покупки: минимум ингредиентов, максимум новых коктейлей."
    >
      {shoppingSuggestions.length > 0 ? (
        shoppingSuggestions.map((suggestion) => (
          <View key={suggestion.ids.join("-")} style={styles.shopCard}>
            <View style={styles.shopHeader}>
              <Text style={styles.shopTitle}>{suggestion.names.join(" + ")}</Text>
              <View style={styles.shopBadge}>
                <Text style={styles.shopBadgeText}>+{suggestion.cocktailCount}</Text>
              </View>
            </View>
            <Text style={styles.shopText}>Откроет: {suggestion.unlockedCocktails.join(", ")}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>Сейчас у тебя уже есть все для лучших вариантов.</Text>
      )}
    </SectionPanel>
  );
}

const styles = StyleSheet.create({
  shopCard: {
    backgroundColor: "#151b23",
    borderRadius: radii.md,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "#354151",
  },
  shopHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    alignItems: "flex-start",
  },
  shopTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  shopBadge: {
    backgroundColor: colors.successBg,
    borderRadius: radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  shopBadgeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
  },
  shopText: {
    color: colors.textSubtle,
    fontSize: 14,
    lineHeight: 20,
  },
  emptyText: {
    color: colors.textSubtle,
    fontSize: 14,
    lineHeight: 20,
  },
});
