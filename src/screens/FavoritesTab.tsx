import { StyleSheet, Text, View } from "react-native";

import { CocktailResults } from "../components/CocktailResults";
import { SectionPanel } from "../components/SectionPanel";
import { Ingredient } from "../data/cocktails";
import { colors, radii } from "../theme";
import { RankedCocktail } from "../utils/cocktailMatcher";

type FavoritesTabProps = {
  favoriteCocktails: RankedCocktail[];
  ingredients: Ingredient[];
  onSelectCocktail: (cocktail: RankedCocktail) => void;
  isFavorite: (cocktailId: string) => boolean;
  onToggleFavorite: (cocktailId: string) => void;
};

export function FavoritesTab({
  favoriteCocktails,
  ingredients,
  onSelectCocktail,
  isFavorite,
  onToggleFavorite,
}: FavoritesTabProps) {
  if (favoriteCocktails.length === 0) {
    return (
      <SectionPanel title="Избранное" hint="Здесь будут коктейли, которые ты отметил звездочкой.">
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>☆</Text>
          <Text style={styles.emptyTitle}>Пока ничего не отмечено</Text>
          <Text style={styles.emptyText}>
            Нажми на звездочку рядом с любым коктейлем, чтобы сохранить его сюда.
          </Text>
        </View>
      </SectionPanel>
    );
  }

  return (
    <CocktailResults
      title="Избранное"
      hint="Коктейли, отмеченные звездочкой."
      cocktails={favoriteCocktails}
      ingredients={ingredients}
      emptyText="Пока ничего не отмечено."
      onSelectCocktail={onSelectCocktail}
      isFavorite={isFavorite}
      onToggleFavorite={onToggleFavorite}
    />
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  emptyEmoji: {
    color: colors.accent,
    fontSize: 48,
    fontWeight: "900",
    lineHeight: 52,
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
    textAlign: "center",
  },
});
