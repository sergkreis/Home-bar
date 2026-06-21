import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { AccountPanel } from "./src/components/AccountPanel";
import { AppErrorBoundary } from "./src/components/AppErrorBoundary";
import { AppHeader } from "./src/components/AppHeader";
import { AuthModal } from "./src/components/AuthModal";
import { AppTab, BottomNav } from "./src/components/BottomNav";
import { SectionPanel } from "./src/components/SectionPanel";
import { ingredients, TasteTag } from "./src/data/cocktails";
import { starterIngredients } from "./src/data/starterIngredients";
import { useAgeGate } from "./src/hooks/useAgeGate";
import { useAdminAccess } from "./src/hooks/useAdminAccess";
import { useAuth } from "./src/hooks/useAuth";
import { useCocktailCatalog } from "./src/hooks/useCocktailCatalog";
import { useEnteredApp } from "./src/hooks/useEnteredApp";
import { useFavorites } from "./src/hooks/useFavorites";
import { useSavedBar } from "./src/hooks/useSavedBar";
import { useUserProfile } from "./src/hooks/useUserProfile";
import { AdminCocktailsTab } from "./src/screens/AdminCocktailsTab";
import { AgeGateScreen } from "./src/screens/AgeGateScreen";
import { BarTab } from "./src/screens/BarTab";
import { BuyTab } from "./src/screens/BuyTab";
import { CocktailDetailScreen } from "./src/screens/CocktailDetailScreen";
import { FavoritesTab } from "./src/screens/FavoritesTab";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";
import { RecipesTab } from "./src/screens/RecipesTab";
import { QuickMode, TodayTab } from "./src/screens/TodayTab";
import { colors, fonts, spacing } from "./src/theme";
import { rankCocktails, RankedCocktail } from "./src/utils/cocktailMatcher";
import { buildShoppingSuggestions, buildTonightHeadline } from "./src/utils/shoppingAdvisor";

type RecipeMode = "easy" | null;

const safeAreaEdges = ["top", "right", "bottom", "left"] as const;

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
  { id: "easy", title: "Без заморочек", subtitle: "До 3 ключевых ингредиентов и короткие шаги", accent: "amber" as const, taste: null, recipeMode: "easy" as RecipeMode },
  { id: "refreshing", title: "Что-то свежее", subtitle: "Легкие и освежающие варианты", accent: "teal" as const, taste: "refreshing" as TasteTag, recipeMode: null },
  { id: "strong", title: "Покрепче", subtitle: "Короткие и более насыщенные рецепты", accent: "berry" as const, taste: "strong" as TasteTag, recipeMode: null },
];

const ingredientById = new Map(ingredients.map((ingredient) => [ingredient.id, ingredient]));

function isSimpleCocktail(cocktail: Pick<RankedCocktail, "recipeIngredients" | "steps">) {
  const requiredIngredientCount = cocktail.recipeIngredients.filter(({ ingredientId }) => {
    const ingredient = ingredientById.get(ingredientId);

    return !ingredient?.isGarnish && !ingredient?.isOptionalDefault;
  }).length;

  return requiredIngredientCount <= 3 && cocktail.steps.length <= 3;
}

const tabSubtitles: Record<AppTab, string> = {
  today: "Лучшие варианты из текущего бара и быстрые сценарии на вечер.",
  bar: "Инвентарь бутылок, миксеров и мелочей, которые есть дома.",
  buy: "Покупки, которые открывают больше всего новых коктейлей.",
  favorites: "Любимые рецепты, сохраненные для быстрого возврата.",
  recipes: "Полный список с поиском и фильтрами по настроению.",
  account: "Регистрация, вход и синхронизация бара с избранным.",
  admin: "Закрытый доступ к облачной базе коктейлей и статусам иллюстраций.",
};

const tabLabels: Record<AppTab, string> = {
  today: "Сегодня",
  bar: "Мой бар",
  buy: "Купить",
  favorites: "Любимые",
  recipes: "Рецепты",
  account: "Аккаунт",
  admin: "Админ",
};

function getSyncPillLabel({
  authUserEmail,
  profileDisplayName,
  isSupabaseConfigured,
  isSyncingBar,
  isSyncingFavorites,
  syncError,
  favoritesSyncError,
}: {
  authUserEmail?: string;
  profileDisplayName?: string;
  isSupabaseConfigured: boolean;
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

  if (authUserEmail) {
    return profileDisplayName?.trim() || authUserEmail;
  }

  if (!isSupabaseConfigured) {
    return "Локально";
  }

  return "Войти";
}

function AppContent() {
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
    catalogCocktails,
    catalogError,
    catalogSource,
    isLoadingCatalog,
    reloadCatalog,
  } = useCocktailCatalog(authUser?.id, isAuthReady);
  const {
    adminAccessError,
    hasLoadedAdminAccess,
    isAdmin,
  } = useAdminAccess(authUser?.id, isAuthReady);
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
  const knownCocktailIds = useMemo(
    () => catalogCocktails.map((cocktail) => cocktail.id),
    [catalogCocktails],
  );
  const {
    hasLoadedFavorites,
    isFavorite,
    isSyncingFavorites,
    favoritesSyncError,
    favoritesSyncStatus,
    toggleFavorite,
  } = useFavorites(knownCocktailIds, authUser?.id, isAuthReady);
  const {
    hasLoadedProfile,
    profile,
    profileError,
    profileMessage,
    profileSyncStatus,
    saveProfile,
  } = useUserProfile(authUser?.id, isAuthReady);
  const {
    confirmAge,
    hasConfirmedAge,
    hasLoadedAgeGate,
  } = useAgeGate();

  const [activeTaste, setActiveTaste] = useState<TasteTag | null>(null);
  const [activeRecipeMode, setActiveRecipeMode] = useState<RecipeMode>(null);
  const [activeTab, setActiveTab] = useState<AppTab>("today");
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
  const [selectedCocktail, setSelectedCocktail] = useState<RankedCocktail | null>(null);

  useEffect(() => {
    if (hasLoadedSavedBar && hasLoadedEntered && hasSavedBar && !hasEnteredApp) {
      markEntered();
    }
  }, [hasLoadedSavedBar, hasLoadedEntered, hasSavedBar, hasEnteredApp, markEntered]);

  useEffect(() => {
    if (authUser && authMode !== "update-password") {
      setIsAuthModalVisible(false);
    }
  }, [authMode, authUser]);

  useEffect(() => {
    if (authMode === "update-password") {
      setIsAuthModalVisible(true);
    }
  }, [authMode]);

  useEffect(() => {
    if (!isAdmin && activeTab === "admin") {
      setActiveTab("account");
    }
  }, [activeTab, isAdmin]);

  const rankedCocktails = useMemo(
    () => rankCocktails(catalogCocktails, selectedIngredients, activeTaste, ingredients),
    [activeTaste, catalogCocktails, selectedIngredients],
  );
  const visibleRankedCocktails = useMemo(
    () => (activeRecipeMode === "easy" ? rankedCocktails.filter(isSimpleCocktail) : rankedCocktails),
    [activeRecipeMode, rankedCocktails],
  );
  const allRankedCocktails = useMemo(
    () => rankCocktails(catalogCocktails, selectedIngredients, null, ingredients),
    [catalogCocktails, selectedIngredients],
  );

  const tonightQuickList: QuickMode[] = useMemo(
    () =>
      quickModeDefs.map((mode) => ({
        ...mode,
        matches: rankCocktails(catalogCocktails, selectedIngredients, mode.taste, ingredients)
          .filter((cocktail) => (mode.recipeMode === "easy" ? isSimpleCocktail(cocktail) : true))
          .slice(0, 4),
      })),
    [catalogCocktails, selectedIngredients],
  );

  const perfectMatches = visibleRankedCocktails.filter((c) => c.missingIngredients.length === 0);
  const allPerfectMatches = allRankedCocktails.filter((c) => c.missingIngredients.length === 0);
  const almostReady = visibleRankedCocktails.filter(
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

  const openAuthModal = () => {
    setAuthMode("sign-in");
    setIsAuthModalVisible(true);
  };

  const changeTab = (tab: AppTab) => {
    if (tab !== "recipes") {
      setActiveTaste(null);
      setActiveRecipeMode(null);
    }

    setActiveTab(tab);
  };

  const openAccountPanel = () => {
    setActiveTaste(null);
    setActiveRecipeMode(null);
    setActiveTab("account");
  };

  const accountPanel = (
    <AccountPanel
      authUserEmail={authUser?.email}
      barSyncError={syncError}
      barSyncStatus={syncStatus}
      favoritesSyncError={favoritesSyncError}
      favoritesSyncStatus={favoritesSyncStatus}
      isAuthLoading={isAuthLoading}
      isSupabaseConfigured={isSupabaseConfigured}
      onOpenAuth={openAuthModal}
      onSaveProfile={saveProfile}
      onSignOut={signOut}
      profile={profile}
      profileError={profileError}
      profileMessage={profileMessage}
      profileSyncStatus={profileSyncStatus}
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

  const applyQuickMode = (taste: TasteTag | null, recipeMode: RecipeMode) => {
    setActiveTaste(taste);
    setActiveRecipeMode(recipeMode);
    setActiveTab("recipes");
  };

  const startMatching = () => {
    if (selectedIngredients.length === 0) {
      return;
    }

    setActiveTaste(null);
    setActiveRecipeMode(null);
    setActiveTab("today");
    setSelectedCocktail(null);
    markEntered();
  };

  const authModal = (
    <AuthModal
      authError={authError}
      authMessage={authMessage}
      authMode={authMode}
      isAuthLoading={isAuthLoading}
      onClose={() => setIsAuthModalVisible(false)}
      onResetPassword={resetPassword}
      onSetAuthMode={setAuthMode}
      onSignIn={signIn}
      onSignUp={signUp}
      onUpdatePassword={updatePassword}
      visible={isAuthModalVisible}
    />
  );

  if (
    !hasLoadedSavedBar ||
    !hasLoadedEntered ||
    !hasLoadedFavorites ||
    !hasLoadedProfile ||
    !hasLoadedAdminAccess ||
    !hasLoadedAgeGate ||
    !isAuthReady
  ) {
    return (
      <SafeAreaView edges={safeAreaEdges} style={styles.safeArea}>
        <StatusBar style="light" />
        <View style={styles.loadingScreen}>
          <Text style={styles.eyebrow}>Домашний бар</Text>
          <Text style={styles.loadingTitle}>Загружаем твой бар</Text>
          <Text style={styles.loadingText}>Проверяем локальные данные и сессию аккаунта.</Text>
        </View>
        {authModal}
      </SafeAreaView>
    );
  }

  if (!hasConfirmedAge) {
    return (
      <SafeAreaView edges={safeAreaEdges} style={styles.safeArea}>
        <StatusBar style="light" />
        <AgeGateScreen onConfirm={confirmAge} />
        {authModal}
      </SafeAreaView>
    );
  }

  if (selectedCocktail) {
    return (
      <SafeAreaView edges={safeAreaEdges} style={styles.safeArea}>
        <StatusBar style="light" />
        <CocktailDetailScreen
          cocktail={selectedCocktail}
          ingredients={ingredients}
          ownedIngredientIds={selectedIngredients}
          isFavorite={isFavorite(selectedCocktail.id)}
          onToggleFavorite={() => toggleFavorite(selectedCocktail.id)}
          onAddIngredientToBar={addIngredientToBar}
          onBack={() => setSelectedCocktail(null)}
        />
        {authModal}
      </SafeAreaView>
    );
  }

  if (!hasEnteredApp) {
    return (
      <SafeAreaView edges={safeAreaEdges} style={styles.safeArea}>
        <StatusBar style="light" />
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
        {authModal}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={safeAreaEdges} style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.appShell}>
        <ScrollView
          key={`app-${activeTab}`}
          style={styles.screen}
          contentContainerStyle={styles.content}
        >
          <AppHeader
            title={tabLabels[activeTab]}
            subtitle={tabSubtitles[activeTab]}
            onPressRightPill={
              authUser
                ? openAccountPanel
                : isSupabaseConfigured
                  ? openAuthModal
                  : openAccountPanel
            }
            rightPill={getSyncPillLabel({
              authUserEmail: authUser?.email,
              profileDisplayName: profile.displayName,
              isSupabaseConfigured,
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
              activeRecipeMode={activeRecipeMode}
              tasteFilters={tasteFilters}
              activeTaste={activeTaste}
              onChangeTaste={(taste) => {
                setActiveTaste(taste);
                setActiveRecipeMode(null);
              }}
              onClearRecipeMode={() => setActiveRecipeMode(null)}
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

          {activeTab === "admin" ? (
            <AdminCocktailsTab
              adminAccessError={adminAccessError}
              catalogCocktails={catalogCocktails}
              catalogError={catalogError}
              catalogSource={catalogSource}
              ingredients={ingredients}
              isAdmin={isAdmin}
              isLoadingCatalog={isLoadingCatalog}
              onReloadCatalog={reloadCatalog}
              userId={authUser?.id}
            />
          ) : null}
        </ScrollView>

        <BottomNav
          activeTab={activeTab}
          onChangeTab={changeTab}
          favoritesCount={favoriteCocktails.length}
          showAdmin={isAdmin}
        />
        {authModal}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppErrorBoundary>
        <AppContent />
      </AppErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  appShell: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    width: "100%",
    maxWidth: 920,
    alignSelf: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 112,
    gap: spacing.xl,
  },
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    gap: 8,
    backgroundColor: colors.background,
  },
  eyebrow: {
    color: colors.teal,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  loadingTitle: {
    color: colors.text,
    fontFamily: fonts.display,
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
