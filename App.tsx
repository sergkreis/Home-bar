import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { CocktailResults } from "./src/components/CocktailResults";
import { IngredientPicker } from "./src/components/IngredientPicker";
import { SectionPanel } from "./src/components/SectionPanel";
import { cocktails, ingredients, TasteTag } from "./src/data/cocktails";
import { starterIngredients } from "./src/data/starterIngredients";
import { rankCocktails } from "./src/utils/cocktailMatcher";
import { buildShoppingSuggestions, buildTonightHeadline } from "./src/utils/shoppingAdvisor";

const SAVED_BAR_STORAGE_KEY = "domashniy-bar:selected-ingredients";

const tasteFilters: { id: TasteTag; label: string }[] = [
  { id: "refreshing", label: "Освежающее" },
  { id: "sweet", label: "Сладкое" },
  { id: "sour", label: "Кислое" },
  { id: "strong", label: "Покрепче" },
  { id: "bitter", label: "Горькое" },
];

type ScreenMode =
  | {
      name: "home";
    }
  | {
      name: "tonight";
      title: string;
      hint: string;
      taste: TasteTag | null;
    };

const ingredientGroups = [
  { key: "spirit", label: "Крепкий алкоголь" },
  { key: "liqueur", label: "Ликеры и аперитивы" },
  { key: "mixer", label: "Миксеры и соки" },
  { key: "citrus", label: "Цитрус" },
  { key: "sweetener", label: "Сиропы" },
  { key: "other", label: "Дополнительно" },
] as const;

const quickModes = [
  {
    id: "easy",
    title: "Без заморочек",
    subtitle: "Покажи то, что можно смешать сразу",
    taste: null as TasteTag | null,
  },
  {
    id: "refreshing",
    title: "Что-то свежее",
    subtitle: "Легкие и освежающие варианты",
    taste: "refreshing" as TasteTag,
  },
  {
    id: "strong",
    title: "Нужно покрепче",
    subtitle: "Короткие и более мощные коктейли",
    taste: "strong" as TasteTag,
  },
];

export default function App() {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>(starterIngredients);
  const [activeTaste, setActiveTaste] = useState<TasteTag | null>(null);
  const [screenMode, setScreenMode] = useState<ScreenMode>({ name: "home" });
  const [hasLoadedSavedBar, setHasLoadedSavedBar] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSavedBar() {
      try {
        const storedIngredients = await AsyncStorage.getItem(SAVED_BAR_STORAGE_KEY);

        if (!storedIngredients) {
          return;
        }

        const parsedIngredients: unknown = JSON.parse(storedIngredients);

        if (!Array.isArray(parsedIngredients)) {
          return;
        }

        const knownIngredientIds = new Set(ingredients.map((ingredient) => ingredient.id));
        const savedIngredients = parsedIngredients.filter(
          (ingredientId): ingredientId is string =>
            typeof ingredientId === "string" && knownIngredientIds.has(ingredientId),
        );

        if (isMounted) {
          setSelectedIngredients(savedIngredients);
        }
      } catch (error) {
        console.warn("Failed to load saved home bar.", error);
      } finally {
        if (isMounted) {
          setHasLoadedSavedBar(true);
        }
      }
    }

    loadSavedBar();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedSavedBar) {
      return;
    }

    AsyncStorage.setItem(SAVED_BAR_STORAGE_KEY, JSON.stringify(selectedIngredients)).catch((error) => {
      console.warn("Failed to save home bar.", error);
    });
  }, [hasLoadedSavedBar, selectedIngredients]);

  const rankedCocktails = useMemo(
    () => rankCocktails(cocktails, selectedIngredients, activeTaste),
    [activeTaste, selectedIngredients],
  );
  const tonightQuickList = useMemo(
    () =>
      quickModes.map((mode) => ({
        ...mode,
        matches: rankCocktails(cocktails, selectedIngredients, mode.taste).slice(0, 6),
      })),
    [selectedIngredients],
  );

  const perfectMatches = rankedCocktails.filter((cocktail) => cocktail.missingIngredients.length === 0);
  const almostReady = rankedCocktails.filter(
    (cocktail) => cocktail.missingIngredients.length > 0 && cocktail.missingIngredients.length <= 2,
  );
  const shoppingSuggestions = buildShoppingSuggestions(rankedCocktails, ingredients);
  const tonightHeadline = buildTonightHeadline(rankedCocktails, selectedIngredients, ingredients);

  const toggleIngredient = (ingredientId: string) => {
    setSelectedIngredients((current) =>
      current.includes(ingredientId)
        ? current.filter((value) => value !== ingredientId)
        : [...current, ingredientId],
    );
  };

  const applyQuickMode = (taste: TasteTag | null) => {
    setActiveTaste(taste);
  };

  const openTonightScreen = (mode: (typeof quickModes)[number]) => {
    setActiveTaste(mode.taste);
    setScreenMode({
      name: "tonight",
      title: mode.title,
      hint: mode.subtitle,
      taste: mode.taste,
    });
  };

  const summaryText =
    perfectMatches.length > 0
      ? `Прямо сейчас можно приготовить ${perfectMatches.length} коктейлей.`
      : "Сейчас нет точного совпадения, но есть варианты, до которых не хватает всего пары ингредиентов.";

  const tonightScreenCocktails =
    screenMode.name === "tonight"
      ? rankCocktails(cocktails, selectedIngredients, screenMode.taste)
      : [];

  if (screenMode.name === "tonight") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
          <View style={styles.pageHeader}>
            <Pressable onPress={() => setScreenMode({ name: "home" })} style={styles.backButton}>
              <Text style={styles.backButtonLabel}>Назад</Text>
            </Pressable>
            <Text style={styles.pageTitle}>{screenMode.title}</Text>
            <Text style={styles.pageHint}>{screenMode.hint}</Text>
          </View>

          <CocktailResults
            title="Подходящие коктейли"
            hint="Нажми на карточку, чтобы развернуть рецепт прямо в списке."
            cocktails={tonightScreenCocktails}
            ingredients={ingredients}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Коктейльный помощник</Text>
          <Text style={styles.title}>Твой домашний бар на сегодня.</Text>
          <Text style={styles.subtitle}>
            Отметь, что у тебя есть дома, и приложение сразу покажет, что лучше всего выпить
            сегодня вечером.
          </Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{selectedIngredients.length}</Text>
              <Text style={styles.summaryLabel}>ингредиентов дома</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{perfectMatches.length}</Text>
              <Text style={styles.summaryLabel}>готовы прямо сейчас</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{almostReady.length}</Text>
              <Text style={styles.summaryLabel}>почти готовы</Text>
            </View>
          </View>
        </View>

        <SectionPanel title="Что мне выпить сегодня" hint={tonightHeadline}>
          <View style={styles.quickGrid}>
            {tonightQuickList.map((mode) => (
              <Pressable
                key={mode.id}
                onPress={() => openTonightScreen(mode)}
                style={styles.quickCard}
              >
                <View style={styles.quickCardTop}>
                  <Text style={styles.quickTitle}>{mode.title}</Text>
                  <Text style={styles.quickMeta}>{mode.matches.length} вариантов</Text>
                </View>
                <Text style={styles.quickSubtitle}>{mode.subtitle}</Text>

                <View style={styles.quickPreviewList}>
                  {mode.matches.slice(0, 3).map((cocktail) => (
                    <Text key={cocktail.id} style={styles.quickPreviewItem}>
                      {cocktail.name}
                    </Text>
                  ))}
                </View>
              </Pressable>
            ))}
          </View>
        </SectionPanel>

        <SectionPanel
          title="Что есть дома"
          hint="Здесь уже большой список для домашнего бара. Просто отмечай бутылки, соки и все, что реально есть."
        >
          <IngredientPicker
            ingredients={ingredients}
            ingredientGroups={ingredientGroups}
            selectedIngredients={selectedIngredients}
            onToggleIngredient={toggleIngredient}
          />
        </SectionPanel>

        <SectionPanel title="Настроение" hint={summaryText}>
          <View style={styles.filterRow}>
            <Pressable
              onPress={() => applyQuickMode(null)}
              style={[styles.filterPill, activeTaste === null && styles.filterPillActive]}
            >
              <Text style={[styles.filterLabel, activeTaste === null && styles.filterLabelActive]}>
                Все
              </Text>
            </Pressable>
            {tasteFilters.map((filter) => {
              const isActive = activeTaste === filter.id;

              return (
                <Pressable
                  key={filter.id}
                  onPress={() => applyQuickMode(isActive ? null : filter.id)}
                  style={[styles.filterPill, isActive && styles.filterPillActive]}
                >
                  <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>
                    {filter.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </SectionPanel>

        <SectionPanel
          title="Докупи 1-2 ингредиента"
          hint="Самые выгодные покупки на вечер: что добавить, чтобы открыть максимум новых коктейлей."
        >
          {shoppingSuggestions.length > 0 ? (
            shoppingSuggestions.map((suggestion) => (
              <View key={suggestion.ids.join("-")} style={styles.shopCard}>
                <View style={styles.shopHeader}>
                  <Text style={styles.shopTitle}>{suggestion.names.join(" + ")}</Text>
                  <View style={styles.shopBadge}>
                    <Text style={styles.shopBadgeText}>+{suggestion.cocktailCount} коктейлей</Text>
                  </View>
                </View>
                <Text style={styles.shopText}>Откроет: {suggestion.unlockedCocktails.join(", ")}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.shopEmptyText}>
              Сейчас у тебя и так уже есть все для лучших вариантов.
            </Text>
          )}
        </SectionPanel>

        <View style={styles.resultsLayout}>
          <CocktailResults
            cocktails={rankedCocktails}
            ingredients={ingredients}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#111318",
  },
  screen: {
    flex: 1,
    backgroundColor: "#111318",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  hero: {
    backgroundColor: "#1b1f27",
    borderRadius: 8,
    padding: 20,
    gap: 10,
  },
  eyebrow: {
    color: "#f4b860",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  title: {
    color: "#f8fafc",
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36,
  },
  subtitle: {
    color: "#b8c0cc",
    fontSize: 15,
    lineHeight: 22,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#222834",
    borderRadius: 8,
    padding: 14,
    gap: 4,
  },
  summaryValue: {
    color: "#f8fafc",
    fontSize: 24,
    fontWeight: "800",
  },
  summaryLabel: {
    color: "#91a0b4",
    fontSize: 11,
    textTransform: "uppercase",
  },
  quickGrid: {
    gap: 10,
  },
  quickCard: {
    backgroundColor: "#161b22",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#303846",
    padding: 14,
    gap: 4,
  },
  quickCardActive: {
    borderColor: "#52c4c8",
    backgroundColor: "#1a2528",
  },
  quickCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },
  quickTitle: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700",
  },
  quickMeta: {
    color: "#f4b860",
    fontSize: 12,
    fontWeight: "700",
  },
  quickSubtitle: {
    color: "#95a5b8",
    fontSize: 13,
    lineHeight: 18,
  },
  quickPreviewList: {
    gap: 10,
    marginTop: 4,
  },
  quickPreviewItem: {
    color: "#dce4ef",
    fontSize: 14,
    lineHeight: 20,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#39414f",
  },
  filterPillActive: {
    backgroundColor: "#52c4c8",
    borderColor: "#52c4c8",
  },
  filterLabel: {
    color: "#d5dcea",
    fontSize: 14,
    fontWeight: "700",
  },
  filterLabelActive: {
    color: "#0d2022",
  },
  shopCard: {
    backgroundColor: "#161b22",
    borderRadius: 8,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: "#303846",
  },
  shopHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },
  shopTitle: {
    flex: 1,
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700",
  },
  shopBadge: {
    backgroundColor: "#214b35",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  shopBadgeText: {
    color: "#f8fafc",
    fontSize: 12,
    fontWeight: "700",
  },
  shopText: {
    color: "#97a3b6",
    fontSize: 14,
    lineHeight: 20,
  },
  shopEmptyText: {
    color: "#97a3b6",
    fontSize: 14,
    lineHeight: 20,
  },
  resultsLayout: {
    gap: 16,
  },
  pageHeader: {
    backgroundColor: "#1b1f27",
    borderRadius: 8,
    padding: 16,
    gap: 10,
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#303846",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backButtonLabel: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "700",
  },
  pageTitle: {
    color: "#f8fafc",
    fontSize: 26,
    fontWeight: "800",
  },
  pageHint: {
    color: "#97a3b6",
    fontSize: 14,
    lineHeight: 20,
  },
});
