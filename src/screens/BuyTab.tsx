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
      title="Выгодные покупки"
      hint="Минимум ингредиентов, максимум новых коктейлей."
    >
      {shoppingSuggestions.length > 0 ? (
        <View style={styles.list}>
          {shoppingSuggestions.map((suggestion, index) => (
            <View key={suggestion.ids.join("-")} style={styles.shopCard}>
              <View style={styles.rank}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <View style={styles.shopMain}>
                <View style={styles.shopHeader}>
                  <Text style={styles.shopTitle}>{suggestion.names.join(" + ")}</Text>
                  <View style={styles.shopBadge}>
                    <Text style={styles.shopBadgeText}>+{suggestion.cocktailCount}</Text>
                  </View>
                </View>
                <Text style={styles.shopText}>Откроет: {suggestion.unlockedCocktails.join(", ")}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Покупки не нужны</Text>
          <Text style={styles.emptyText}>Сейчас у тебя уже есть все для лучших вариантов из базы.</Text>
        </View>
      )}
    </SectionPanel>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  shopCard: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rank: {
    width: 34,
    height: 34,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceDark,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: "900",
  },
  shopMain: {
    flex: 1,
    gap: 8,
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
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 22,
  },
  shopBadge: {
    backgroundColor: colors.successBg,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  shopBadgeText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: "900",
  },
  shopText: {
    color: colors.textSubtle,
    fontSize: 14,
    lineHeight: 20,
  },
  empty: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 6,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  emptyText: {
    color: colors.textSubtle,
    fontSize: 14,
    lineHeight: 20,
  },
});
