import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { CocktailResults } from "./src/components/CocktailResults";
import { IngredientPicker } from "./src/components/IngredientPicker";
import { SectionPanel } from "./src/components/SectionPanel";
import { cocktails, ingredients, TasteTag } from "./src/data/cocktails";
import { starterIngredients } from "./src/data/starterIngredients";
import { getStrengthLabel, getTasteLabel } from "./src/utils/cocktailLabels";
import { rankCocktails, RankedCocktail } from "./src/utils/cocktailMatcher";
import { buildShoppingSuggestions, buildTonightHeadline } from "./src/utils/shoppingAdvisor";

const SAVED_BAR_STORAGE_KEY = "domashniy-bar:selected-ingredients";

const tasteFilters: { id: TasteTag; label: string }[] = [
  { id: "refreshing", label: "Свежее" },
  { id: "sweet", label: "Сладкое" },
  { id: "sour", label: "Кислое" },
  { id: "strong", label: "Крепче" },
  { id: "bitter", label: "Горькое" },
];

const ingredientGroups = [
  { key: "spirit", label: "Крепкий алкоголь" },
  { key: "liqueur", label: "Ликеры и аперитивы" },
  { key: "wine", label: "Вино и игристое" },
  { key: "mixer", label: "Миксеры, соки, кофе" },
  { key: "citrus", label: "Цитрус" },
  { key: "sweetener", label: "Сиропы" },
  { key: "garnish", label: "Гарниры" },
  { key: "pantry", label: "Кухня" },
  { key: "other", label: "Редкое" },
] as const;

const quickModes = [
  {
    id: "easy",
    title: "Без заморочек",
    subtitle: "Можно смешать сразу",
    accent: "amber",
    taste: null as TasteTag | null,
  },
  {
    id: "refreshing",
    title: "Что-то свежее",
    subtitle: "Легкие и освежающие",
    accent: "teal",
    taste: "refreshing" as TasteTag,
  },
  {
    id: "strong",
    title: "Покрепче",
    subtitle: "Короткие и мощные",
    accent: "berry",
    taste: "strong" as TasteTag,
  },
];

type AppTab = "today" | "bar" | "buy" | "recipes";

const tabs: { id: AppTab; label: string; icon: string }[] = [
  { id: "today", label: "Сегодня", icon: "●" },
  { id: "bar", label: "Мой бар", icon: "◐" },
  { id: "buy", label: "Докупить", icon: "+" },
  { id: "recipes", label: "Рецепты", icon: "≡" },
];

const tabSubtitles: Record<AppTab, string> = {
  today: "Лучшие варианты из того, что уже есть.",
  bar: "Отметь бутылки, соки и мелочи, которые есть дома.",
  buy: "Минимальные покупки, которые откроют больше коктейлей.",
  recipes: "Полный список с фильтром по настроению.",
};

function getIngredientName(ingredientId: string) {
  return ingredients.find((ingredient) => ingredient.id === ingredientId)?.name ?? ingredientId;
}

export default function App() {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [activeTaste, setActiveTaste] = useState<TasteTag | null>(null);
  const [activeTab, setActiveTab] = useState<AppTab>("today");
  const [selectedCocktail, setSelectedCocktail] = useState<RankedCocktail | null>(null);
  const [hasEnteredApp, setHasEnteredApp] = useState(false);
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
    () => rankCocktails(cocktails, selectedIngredients, activeTaste, ingredients),
    [activeTaste, selectedIngredients],
  );

  const allRankedCocktails = useMemo(
    () => rankCocktails(cocktails, selectedIngredients, null, ingredients),
    [selectedIngredients],
  );

  const tonightQuickList = useMemo(
    () =>
      quickModes.map((mode) => ({
        ...mode,
        matches: rankCocktails(cocktails, selectedIngredients, mode.taste, ingredients).slice(0, 4),
      })),
    [selectedIngredients],
  );

  const perfectMatches = rankedCocktails.filter((cocktail) => cocktail.missingIngredients.length === 0);
  const allPerfectMatches = allRankedCocktails.filter((cocktail) => cocktail.missingIngredients.length === 0);
  const almostReady = rankedCocktails.filter(
    (cocktail) => cocktail.missingIngredients.length > 0 && cocktail.missingIngredients.length <= 2,
  );
  const shoppingSuggestions = useMemo(
    () => buildShoppingSuggestions(allRankedCocktails, ingredients),
    [allRankedCocktails],
  );
  const tonightHeadline = useMemo(
    () => buildTonightHeadline(allRankedCocktails, selectedIngredients, ingredients),
    [allRankedCocktails, selectedIngredients],
  );

  const toggleIngredient = (ingredientId: string) => {
    setSelectedIngredients((current) =>
      current.includes(ingredientId)
        ? current.filter((value) => value !== ingredientId)
        : [...current, ingredientId],
    );
  };

  const openCocktail = (cocktail: RankedCocktail) => {
    setSelectedCocktail(cocktail);
  };

  const applyQuickMode = (taste: TasteTag | null) => {
    setActiveTaste(taste);
    setActiveTab("recipes");
  };

  const resetStarterBar = () => {
    setSelectedIngredients(starterIngredients);
  };

  const clearBar = () => {
    setSelectedIngredients([]);
  };

  const startMatching = () => {
    if (selectedIngredients.length === 0) {
      return;
    }

    setActiveTaste(null);
    setActiveTab("today");
    setSelectedCocktail(null);
    setHasEnteredApp(true);
  };

  if (!hasLoadedSavedBar) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <View style={styles.loadingScreen}>
          <Text style={styles.eyebrow}>Домашний бар</Text>
          <Text style={styles.loadingTitle}>Загружаем твой бар</Text>
          <Text style={styles.loadingText}>Проверяем сохраненные ингредиенты на этом устройстве.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (selectedCocktail) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <ScrollView style={styles.screen} contentContainerStyle={styles.detailContent}>
          <View style={styles.detailHeader}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setSelectedCocktail(null)}
              style={styles.backButton}
            >
              <Text style={styles.backButtonLabel}>Назад</Text>
            </Pressable>
            <Text style={styles.detailTitle}>{selectedCocktail.name}</Text>
            <Text style={styles.detailMeta}>
              {selectedCocktail.baseSpirit} - {getStrengthLabel(selectedCocktail.strength)}
            </Text>
          </View>

          <View style={styles.detailStatusRow}>
            <View style={[styles.statusBadge, selectedCocktail.missingIngredients.length === 0 ? styles.readyBadge : styles.missingBadge]}>
              <Text style={styles.statusBadgeText}>
                {selectedCocktail.missingIngredients.length === 0
                  ? "Готово сейчас"
                  : `Не хватает ${selectedCocktail.missingIngredients.length}`}
              </Text>
            </View>
            <Text style={styles.matchText}>
              {Math.round(selectedCocktail.matchRatio * 100)}% совпадение
            </Text>
          </View>

          {selectedCocktail.missingIngredients.length > 0 ? (
            <View style={styles.callout}>
              <Text style={styles.calloutLabel}>Докупить</Text>
              <Text style={styles.calloutText}>
                {selectedCocktail.missingIngredients.map(getIngredientName).join(", ")}
              </Text>
            </View>
          ) : null}

          <SectionPanel title="Ингредиенты">
            {selectedCocktail.recipeIngredients.map(({ ingredientId, amount }) => {
              const isOwned = !selectedCocktail.missingIngredients.includes(ingredientId);

              return (
                <View key={ingredientId} style={styles.recipeRow}>
                  <View style={styles.recipeRowMain}>
                    <View style={[styles.dot, isOwned ? styles.dotOwned : styles.dotMissing]} />
                    <Text style={styles.recipeRowText}>{getIngredientName(ingredientId)}</Text>
                  </View>
                  <Text style={styles.recipeAmount}>{amount}</Text>
                </View>
              );
            })}
          </SectionPanel>

          <SectionPanel title="Как приготовить" hint={`Бокал: ${selectedCocktail.glassName}`}>
            {selectedCocktail.steps.map((step, index) => (
              <View key={`${selectedCocktail.id}-${index}`} style={styles.stepRow}>
                <View style={styles.stepIndexWrap}>
                  <Text style={styles.stepIndexText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
            {selectedCocktail.garnish ? (
              <View style={styles.callout}>
                <Text style={styles.calloutLabel}>Подача</Text>
                <Text style={styles.calloutText}>{selectedCocktail.garnish}</Text>
              </View>
            ) : null}
          </SectionPanel>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!hasEnteredApp) {
    const canStartMatching = selectedIngredients.length > 0;

    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <View style={styles.onboardingShell}>
          <ScrollView style={styles.screen} contentContainerStyle={styles.onboardingContent}>
            <View style={styles.onboardingHero}>
              <Text style={styles.eyebrow}>Домашний бар</Text>
              <Text style={styles.onboardingTitle}>Что есть дома?</Text>
              <Text style={styles.subtitle}>
                Отметь алкоголь, соки, цитрус и сиропы. Потом сразу покажем, что можно смешать сейчас.
              </Text>

              <View style={styles.onboardingStats}>
                <View style={styles.onboardingStat}>
                  <Text style={styles.summaryValue}>{selectedIngredients.length}</Text>
                  <Text style={styles.summaryLabel}>выбрано</Text>
                </View>
                <View style={styles.onboardingStat}>
                  <Text style={styles.summaryValue}>{allPerfectMatches.length}</Text>
                  <Text style={styles.summaryLabel}>готово</Text>
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
                onToggleIngredient={toggleIngredient}
                onClear={clearBar}
                onReset={resetStarterBar}
              />
            </SectionPanel>
          </ScrollView>

          <View style={styles.onboardingDock}>
            <View style={styles.onboardingActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: !canStartMatching }}
                disabled={!canStartMatching}
                onPress={startMatching}
                style={[styles.primaryButton, !canStartMatching && styles.primaryButtonDisabled]}
              >
                <Text style={[styles.primaryButtonText, !canStartMatching && styles.primaryButtonTextDisabled]}>
                  Подобрать коктейли
                </Text>
              </Pressable>
              <View style={styles.accountLater}>
                <Text style={styles.accountLaterTitle}>Аккаунт позже</Text>
                <Text style={styles.onboardingHint}>Сейчас бар сохраняется на этом устройстве.</Text>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.appShell}>
        <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
          <View style={styles.appHeader}>
            <View style={styles.headerTop}>
              <View style={styles.headerTextBlock}>
                <Text style={styles.eyebrow}>Домашний бар</Text>
                <Text style={styles.title}>{tabs.find((tab) => tab.id === activeTab)?.label}</Text>
              </View>
              <View style={styles.savedPill}>
                <Text style={styles.savedPillText}>{hasLoadedSavedBar ? "Сохранено" : "Загрузка"}</Text>
              </View>
            </View>
            <Text style={styles.subtitle}>{tabSubtitles[activeTab]}</Text>

            <View style={styles.summaryStrip}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{selectedIngredients.length}</Text>
                <Text style={styles.summaryLabel}>дома</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{perfectMatches.length}</Text>
                <Text style={styles.summaryLabel}>готово</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{almostReady.length}</Text>
                <Text style={styles.summaryLabel}>почти</Text>
              </View>
            </View>
          </View>

          {activeTab === "today" ? (
            <>
              <SectionPanel title="Что выпить сегодня" hint={tonightHeadline}>
                <View style={styles.primaryActions}>
                  {tonightQuickList.map((mode) => (
                    <Pressable
                      accessibilityLabel={`${mode.title}: ${mode.matches.length} коктейлей`}
                      accessibilityRole="button"
                      key={mode.id}
                      onPress={() => applyQuickMode(mode.taste)}
                      style={[
                        styles.actionCard,
                        mode.accent === "teal" && styles.actionCardTeal,
                        mode.accent === "berry" && styles.actionCardBerry,
                      ]}
                    >
                      <View
                        style={[
                          styles.actionAccent,
                          mode.accent === "teal" && styles.actionAccentTeal,
                          mode.accent === "berry" && styles.actionAccentBerry,
                        ]}
                      />
                      <View style={styles.actionCardTop}>
                        <Text style={styles.actionTitle}>{mode.title}</Text>
                        <Text style={styles.actionMeta}>{mode.matches.length}</Text>
                      </View>
                      <Text style={styles.actionSubtitle}>{mode.subtitle}</Text>
                      <Text style={styles.actionPreview}>
                        {mode.matches.slice(0, 2).map((cocktail) => cocktail.name).join(", ")}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </SectionPanel>

              <CocktailResults
                title="Готово сейчас"
                hint="Коктейли, для которых все уже есть дома."
                cocktails={perfectMatches.slice(0, 6)}
                ingredients={ingredients}
                emptyText="Пока нет точных совпадений. Открой вкладку «Докупить» или добавь ингредиенты в «Мой бар»."
                onSelectCocktail={openCocktail}
              />

              <CocktailResults
                title="Ближе всего"
                hint="Нужно докупить не больше двух ингредиентов."
                cocktails={almostReady.slice(0, 6)}
                ingredients={ingredients}
                emptyText="Добавь несколько базовых ингредиентов, и здесь появятся близкие варианты."
                onSelectCocktail={openCocktail}
              />
            </>
          ) : null}

          {activeTab === "bar" ? (
            <SectionPanel
              title="Мой бар"
              hint="Список сохраняется на этом устройстве. Начни с того, что реально есть под рукой."
            >
              <IngredientPicker
                ingredients={ingredients}
                ingredientGroups={ingredientGroups}
                selectedIngredients={selectedIngredients}
                onToggleIngredient={toggleIngredient}
                onClear={clearBar}
                onReset={resetStarterBar}
              />
            </SectionPanel>
          ) : null}

          {activeTab === "buy" ? (
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
          ) : null}

          {activeTab === "recipes" ? (
            <>
              <SectionPanel title="Настроение">
                <View style={styles.filterRow}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setActiveTaste(null)}
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
                        accessibilityRole="button"
                        key={filter.id}
                        onPress={() => setActiveTaste(isActive ? null : filter.id)}
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

              <CocktailResults
                cocktails={rankedCocktails}
                ingredients={ingredients}
                onSelectCocktail={openCocktail}
              />
            </>
          ) : null}
        </ScrollView>

        <View style={styles.bottomNav}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <Pressable
                accessibilityRole="button"
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={[styles.navItem, isActive && styles.navItemActive]}
              >
                <Text style={[styles.navIcon, isActive && styles.navIconActive]}>{tab.icon}</Text>
                <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#101318",
  },
  appShell: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: "#101318",
  },
  content: {
    padding: 12,
    paddingBottom: 96,
    gap: 12,
  },
  detailContent: {
    padding: 12,
    paddingBottom: 40,
    gap: 12,
  },
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    gap: 8,
  },
  loadingTitle: {
    color: "#f8fafc",
    fontSize: 26,
    fontWeight: "900",
    lineHeight: 31,
  },
  loadingText: {
    color: "#b7c2d3",
    fontSize: 14,
    lineHeight: 20,
  },
  onboardingShell: {
    flex: 1,
  },
  onboardingContent: {
    padding: 12,
    paddingBottom: 158,
    gap: 12,
  },
  onboardingHero: {
    backgroundColor: "#1b2029",
    borderRadius: 8,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: "#313b48",
  },
  onboardingTitle: {
    color: "#f8fafc",
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 34,
  },
  onboardingStats: {
    flexDirection: "row",
    gap: 8,
  },
  onboardingStat: {
    flex: 1,
    backgroundColor: "#121a24",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#344151",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  onboardingActions: {
    gap: 8,
  },
  onboardingDock: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#101318",
    borderTopWidth: 1,
    borderTopColor: "#303f4d",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4b860",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  primaryButtonDisabled: {
    backgroundColor: "#303846",
  },
  primaryButtonText: {
    color: "#151922",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },
  primaryButtonTextDisabled: {
    color: "#8591a3",
  },
  accountLater: {
    minHeight: 42,
    borderRadius: 8,
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
  onboardingHint: {
    color: "#91a0b4",
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
  },
  appHeader: {
    backgroundColor: "#1a1f27",
    borderRadius: 8,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: "#252d38",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },
  headerTextBlock: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    color: "#f4b860",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  title: {
    color: "#f8fafc",
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 32,
  },
  subtitle: {
    color: "#b7c2d3",
    fontSize: 14,
    lineHeight: 20,
  },
  savedPill: {
    backgroundColor: "#142922",
    borderColor: "#285840",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  savedPillText: {
    color: "#7ce0ab",
    fontSize: 12,
    fontWeight: "800",
  },
  summaryStrip: {
    flexDirection: "row",
    backgroundColor: "#121821",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2b3441",
    overflow: "hidden",
  },
  summaryItem: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: "#2b3441",
  },
  summaryValue: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "900",
  },
  summaryLabel: {
    color: "#91a0b4",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  primaryActions: {
    gap: 8,
  },
  actionCard: {
    position: "relative",
    backgroundColor: "#141a22",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#303846",
    padding: 12,
    paddingLeft: 16,
    gap: 6,
    overflow: "hidden",
  },
  actionCardTeal: {
    borderColor: "#2a6864",
  },
  actionCardBerry: {
    borderColor: "#684052",
  },
  actionAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: "#f4b860",
  },
  actionAccentTeal: {
    backgroundColor: "#52c4c8",
  },
  actionAccentBerry: {
    backgroundColor: "#d06b87",
  },
  actionCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  actionTitle: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "900",
  },
  actionMeta: {
    color: "#f4b860",
    fontSize: 16,
    fontWeight: "900",
  },
  actionSubtitle: {
    color: "#9fb0c5",
    fontSize: 13,
    lineHeight: 18,
  },
  actionPreview: {
    color: "#e4ebf5",
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
    backgroundColor: "#141a22",
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
    fontWeight: "800",
  },
  filterLabelActive: {
    color: "#0d2022",
  },
  shopCard: {
    backgroundColor: "#151b23",
    borderRadius: 8,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "#354151",
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
    fontWeight: "800",
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
    fontWeight: "800",
  },
  shopText: {
    color: "#97a3b6",
    fontSize: 14,
    lineHeight: 20,
  },
  emptyText: {
    color: "#97a3b6",
    fontSize: 14,
    lineHeight: 20,
  },
  bottomNav: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    flexDirection: "row",
    gap: 6,
    backgroundColor: "#151b23",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#344151",
    padding: 6,
  },
  navItem: {
    flex: 1,
    minHeight: 50,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    gap: 2,
  },
  navItemActive: {
    backgroundColor: "#f4b860",
  },
  navIcon: {
    color: "#7f8fa3",
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 16,
  },
  navIconActive: {
    color: "#151922",
  },
  navLabel: {
    color: "#c4cfdd",
    fontSize: 11,
    fontWeight: "900",
  },
  navLabelActive: {
    color: "#151922",
  },
  detailHeader: {
    backgroundColor: "#1a1f27",
    borderRadius: 8,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: "#252d38",
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: "#141a22",
    borderWidth: 1,
    borderColor: "#303846",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  backButtonLabel: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "900",
  },
  detailTitle: {
    color: "#f8fafc",
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 34,
  },
  detailMeta: {
    color: "#9fb0c5",
    fontSize: 15,
    lineHeight: 20,
  },
  detailStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  readyBadge: {
    backgroundColor: "#214b35",
  },
  missingBadge: {
    backgroundColor: "#5f4a1f",
  },
  statusBadgeText: {
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: "900",
  },
  matchText: {
    color: "#c4cfdd",
    fontSize: 13,
    fontWeight: "800",
  },
  callout: {
    backgroundColor: "#151b23",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#303846",
    padding: 12,
    gap: 4,
  },
  calloutLabel: {
    color: "#f4b860",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  calloutText: {
    color: "#d7deea",
    fontSize: 14,
    lineHeight: 20,
  },
  recipeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  recipeRowMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  recipeRowText: {
    color: "#d7deea",
    fontSize: 15,
  },
  recipeAmount: {
    color: "#f4b860",
    fontSize: 14,
    fontWeight: "900",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotOwned: {
    backgroundColor: "#62d29b",
  },
  dotMissing: {
    backgroundColor: "#f4b860",
  },
  stepRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  stepIndexWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#52c4c8",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  stepIndexText: {
    color: "#102124",
    fontSize: 14,
    fontWeight: "900",
  },
  stepText: {
    flex: 1,
    color: "#d7deea",
    fontSize: 15,
    lineHeight: 22,
  },
});
