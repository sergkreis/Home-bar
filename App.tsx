import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { AccountPanel } from "./src/components/AccountPanel";
import { AppHeader } from "./src/components/AppHeader";
import { AppTab, BottomNav } from "./src/components/BottomNav";
import { SectionPanel } from "./src/components/SectionPanel";
import { cocktails, ingredients, TasteTag } from "./src/data/cocktails";
import { starterIngredients } from "./src/data/starterIngredients";
import { useAuth } from "./src/hooks/useAuth";
import { useEnteredApp } from "./src/hooks/useEnteredApp";
import { useFavorites } from "./src/hooks/useFavorites";
import { useSavedBar } from "./src/hooks/useSavedBar";
import { BarTab } from "./src/screens/BarTab";
import { BuyTab } from "./src/screens/BuyTab";
import { CocktailDetailScreen } from "./src/screens/CocktailDetailScreen";
import { FavoritesTab } from "./src/screens/FavoritesTab";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";
import { RecipesTab } from "./src/screens/RecipesTab";
import { QuickMode, TodayTab } from "./src/screens/TodayTab";
import { colors, spacing } from "./src/theme";
import { rankCocktails, RankedCocktail } from "./src/utils/cocktailMatcher";
import { buildShoppingSuggestions, buildTonightHeadline } from "./src/utils/shoppingAdvisor";

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

const quickModeDefs = [
  { id: "easy", title: "Без заморочек", subtitle: "Простые рецепты из того, что уже есть", accent: "amber" as const, taste: null },
  { id: "refreshing", title: "Что-то свежее", subtitle: "Легкие и освежающие варианты", accent: "teal" as const, taste: "refreshing" as TasteTag },
  { id: "strong", title: "Покрепче", subtitle: "Короткие и более насыщенные рецепты", accent: "berry" as const, taste: "strong" as TasteTag },
];

const tabSubtitles: Record<AppTab, string> = {
  today: "Лучшие варианты из текущего бара и быстрые сценарии на вечер.",
  bar: "Инвентарь бутылок, миксеров и мелочей, которые есть дома.",
  buy: "Покупки, которые открывают больше всего новых коктейлей.",
  favorites: "Любимые рецепты, сохраненные для быстрого возврата.",
  recipes: "Полный список с поиском и фильтрами по настроению.",
  account: "Регистрация, вход и синхронизация бара с избранным.",
};

const tabLabels: Record<AppTab, string> = {
  today: "Сегодня",
  bar: "Мой бар",
  buy: "Купить",
  favorites: "Любимые",
  recipes: "Рецепты",
  account: "Аккаунт",
};

function getSyncPillLabel({
  authUserEmail,
  isSyncingBar,
  isSyncingFavorites,
  syncError,
  favoritesSyncError,
}: {
  authUserEmail?: string;
  isSyncingBar: boolean;
  isSyncingFavorites: boolean;
  syncError: string | null;
  favoritesSyncError: string | null;
}) {
  if (syncError || favoritesSyncError) {
    return "Ошибка";
  }

  if (isSyncingBar || isSyncingFavorites) {
    return "Синхронизация";
  }

  return authUserEmail ? "Аккаунт" : "Локально";
}

export default function App() {
  const {
    authError,
    authMessage,
    authMode,
    authUser,
    isAuthReady,
    isAuthLoading,
    isSupabaseConfigured,
    resetPassword,
    setAuthMode,
    signIn,
    signOut,
    signUp,
    updatePassword,
  } = useAuth();
  const {
    hasLoadedSavedBar,
    hasSavedBar,
    isSyncingBar,
    selectedIngredients,
    setSelectedIngredients,
    syncError,
    syncStatus,
  } = useSavedBar(ingredients, authUser?.id, isAuthReady);
  const { hasLoadedEntered, hasEnteredApp, markEntered } = useEnteredApp();
  const knownCocktailIds = useMemo(() => cocktails.map((cocktail) => cocktail.id), []);
  const {
    hasLoadedFavorites,
    isFavorite,
    isSyncingFavorites,
    favoritesSyncError,
    favoritesSyncStatus,
    toggleFavorite,
  } = useFavorites(knownCocktailIds, authUser?.id, isAuthReady);

  const [activeTaste, setActiveTaste] = useState<TasteTag | null>(null);
  const [activeTab, setActiveTab] = useState<AppTab>("today");
  const [selectedCocktail, setSelectedCocktail] = useState<RankedCocktail | null>(null);

  useEffect(() => {
    if (hasLoadedSavedBar && hasLoadedEntered && hasSavedBar && !hasEnteredApp) {
      markEntered();
    }
  }, [hasLoadedSavedBar, hasLoadedEntered, hasSavedBar, hasEnteredApp, markEntered]);

  const rankedCocktails = useMemo(
    () => rankCocktails(cocktails, selectedIngredients, activeTaste, ingredients),
    [activeTaste, selectedIngredients],
  );
  const allRankedCocktails = useMemo(
    () => rankCocktails(cocktails, selectedIngredients, null, ingredients),
    [selectedIngredients],
  );

  const tonightQuickList: QuickMode[] = useMemo(
    () =>
      quickModeDefs.map((mode) => ({
        ...mode,
        matches: rankCocktails(cocktails, selectedIngredients, mode.taste, ingredients).slice(0, 4),
      })),
    [selectedIngredients],
  );

  const perfectMatches = rankedCocktails.filter((c) => c.missingIngredients.length === 0);
  const allPerfectMatches = allRankedCocktails.filter((c) => c.missingIngredients.length === 0);
  const almostReady = rankedCocktails.filter(
    (c) => c.missingIngredients.length > 0 && c.missingIngredients.length <= 2,
  );

  const shoppingSuggestions = useMemo(
    () => buildShoppingSuggestions(allRankedCocktails, ingredients),
    [allRankedCocktails],
  );
  const tonightHeadline = useMemo(
    () => buildTonightHeadline(allRankedCocktails, selectedIngredients, ingredients),
    [allRankedCocktails, selectedIngredients],
  );

  const favoriteCocktails = useMemo(
    () => allRankedCocktails.filter((c) => isFavorite(c.id)),
    [allRankedCocktails, isFavorite],
  );

  const accountPanel = (
    <AccountPanel
      authError={authError}
      authMessage={authMessage}
      authMode={authMode}
      authUserEmail={authUser?.email}
      barSyncError={syncError}
      barSyncStatus={syncStatus}
      favoritesSyncError={favoritesSyncError}
      favoritesSyncStatus={favoritesSyncStatus}
      isAuthLoading={isAuthLoading}
      isSupabaseConfigured={isSupabaseConfigured}
      onResetPassword={resetPassword}
      onSetAuthMode={setAuthMode}
      onSignIn={signIn}
      onSignOut={signOut}
      onSignUp={signUp}
      onUpdatePassword={updatePassword}
    />
  );

  const toggleIngredient = (ingredientId: string) => {
    setSelectedIngredients((current) =>
      current.includes(ingredientId)
        ? current.filter((value) => value !== ingredientId)
        : [...current, ingredientId],
    );
  };

  const addIngredientToBar = (ingredientId: string) => {
    setSelectedIngredients((current) =>
      current.includes(ingredientId) ? current : [...current, ingredientId],
    );
  };

  const applyQuickMode = (taste: TasteTag | null) => {
    setActiveTaste(taste);
    setActiveTab("recipes");
  };

  const startMatching = () => {
    if (selectedIngredients.length === 0) {
      return;
    }

    setActiveTaste(null);
    setActiveTab("today");
    setSelectedCocktail(null);
    markEntered();
  };

  if (!hasLoadedSavedBar || !hasLoadedEntered || !hasLoadedFavorites || !isAuthReady) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.loadingScreen}>
          <Text style={styles.eyebrow}>Домашний бар</Text>
          <Text style={styles.loadingTitle}>Загружаем твой бар</Text>
          <Text style={styles.loadingText}>Проверяем локальные данные и сессию аккаунта.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (selectedCocktail) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <CocktailDetailScreen
          cocktail={selectedCocktail}
          ingredients={ingredients}
          ownedIngredientIds={selectedIngredients}
          isFavorite={isFavorite(selectedCocktail.id)}
          onToggleFavorite={() => toggleFavorite(selectedCocktail.id)}
          onAddIngredientToBar={addIngredientToBar}
          onBack={() => setSelectedCocktail(null)}
        />
      </SafeAreaView>
    );
  }

  if (!hasEnteredApp) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <OnboardingScreen
          ingredients={ingredients}
          ingredientGroups={ingredientGroups}
          selectedIngredients={selectedIngredients}
          perfectMatchesCount={allPerfectMatches.length}
          onToggleIngredient={toggleIngredient}
          onClear={() => setSelectedIngredients([])}
          onResetToStarter={() => setSelectedIngredients(starterIngredients)}
          onStartMatching={startMatching}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.appShell}>
        <ScrollView
          key={`app-${activeTab}`}
          style={styles.screen}
          contentContainerStyle={styles.content}
        >
          <AppHeader
            title={tabLabels[activeTab]}
            subtitle={tabSubtitles[activeTab]}
            rightPill={getSyncPillLabel({
              authUserEmail: authUser?.email,
              isSyncingBar,
              isSyncingFavorites,
              syncError,
              favoritesSyncError,
            })}
            stats={[
              { value: selectedIngredients.length, label: "дома" },
              { value: perfectMatches.length, label: "готово" },
              { value: almostReady.length, label: "почти" },
            ]}
          />

          {activeTab === "today" ? (
            <TodayTab
              quickModes={tonightQuickList}
              tonightHeadline={tonightHeadline}
              perfectMatches={perfectMatches}
              almostReady={almostReady}
              ingredients={ingredients}
              onApplyQuickMode={applyQuickMode}
              onSelectCocktail={setSelectedCocktail}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
            />
          ) : null}

          {activeTab === "bar" ? (
            <BarTab
              ingredients={ingredients}
              ingredientGroups={ingredientGroups}
              selectedIngredients={selectedIngredients}
              onToggleIngredient={toggleIngredient}
              onClear={() => setSelectedIngredients([])}
              onResetToStarter={() => setSelectedIngredients(starterIngredients)}
            />
          ) : null}

          {activeTab === "buy" ? <BuyTab shoppingSuggestions={shoppingSuggestions} /> : null}

          {activeTab === "favorites" ? (
            <FavoritesTab
              favoriteCocktails={favoriteCocktails}
              ingredients={ingredients}
              onSelectCocktail={setSelectedCocktail}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
            />
          ) : null}

          {activeTab === "recipes" ? (
            <RecipesTab
              rankedCocktails={rankedCocktails}
              tasteFilters={tasteFilters}
              activeTaste={activeTaste}
              onChangeTaste={setActiveTaste}
              ingredients={ingredients}
              onSelectCocktail={setSelectedCocktail}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
            />
          ) : null}

          {activeTab === "account" ? (
            <SectionPanel
              title="Аккаунт"
              hint="Регистрация не обязательна для первого запуска, но нужна для синхронизации между устройствами."
            >
              {accountPanel}
            </SectionPanel>
          ) : null}
        </ScrollView>

        <BottomNav
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          favoritesCount={favoriteCocktails.length}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  appShell: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    width: "100%",
    maxWidth: 920,
    alignSelf: "center",
    padding: spacing.md,
    paddingBottom: 112,
    gap: spacing.xl,
  },
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    gap: 8,
  },
  eyebrow: {
    color: colors.teal,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  loadingTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 32,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});
