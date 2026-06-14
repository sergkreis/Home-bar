import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { SectionPanel } from "../components/SectionPanel";
import {
  Cocktail,
  CocktailImageStatus,
  CocktailStrength,
  Ingredient,
  TasteTag,
} from "../data/cocktails";
import {
  CocktailCatalogSource,
  saveRemoteCocktail,
  seedRemoteCocktails,
} from "../services/cocktailCatalogService";
import { colors, fonts, pressed, radii, spacing } from "../theme";

type AdminCocktailsTabProps = {
  adminAccessError: string | null;
  catalogCocktails: Cocktail[];
  catalogError: string | null;
  catalogSource: CocktailCatalogSource;
  ingredients: Ingredient[];
  isAdmin: boolean;
  isLoadingCatalog: boolean;
  onReloadCatalog: () => Promise<void>;
  userId?: string;
};

type EditorState = {
  baseSpirit: string;
  garnish: string;
  glassName: string;
  id: string;
  imageAssetKey: string;
  imageStatus: CocktailImageStatus;
  isPublished: boolean;
  name: string;
  recipeIngredients: string;
  referenceUrls: string;
  steps: string;
  strength: CocktailStrength;
  taste: string;
};

const tasteTags: TasteTag[] = ["refreshing", "sweet", "sour", "strong", "bitter"];
const strengthValues: CocktailStrength[] = ["light", "medium", "strong"];
const imageStatusValues: CocktailImageStatus[] = [
  "todo",
  "reference-needed",
  "generated",
  "approved",
];

const emptyEditor: EditorState = {
  baseSpirit: "",
  garnish: "",
  glassName: "Рокс",
  id: "",
  imageAssetKey: "",
  imageStatus: "todo",
  isPublished: true,
  name: "",
  recipeIngredients: "",
  referenceUrls: "",
  steps: "",
  strength: "light",
  taste: "refreshing",
};

function toEditorState(cocktail: Cocktail): EditorState {
  return {
    baseSpirit: cocktail.baseSpirit,
    garnish: cocktail.garnish ?? "",
    glassName: cocktail.glassName,
    id: cocktail.id,
    imageAssetKey: cocktail.imageAssetKey ?? "",
    imageStatus: cocktail.imageStatus ?? "todo",
    isPublished: cocktail.isPublished ?? true,
    name: cocktail.name,
    recipeIngredients: cocktail.recipeIngredients
      .map((entry) => `${entry.ingredientId} | ${entry.amount}`)
      .join("\n"),
    referenceUrls: cocktail.referenceUrls?.join("\n") ?? "",
    steps: cocktail.steps.join("\n"),
    strength: cocktail.strength,
    taste: cocktail.taste.join(", "),
  };
}

function normalizeSearch(value: string) {
  return value.trim().toLocaleLowerCase("ru-RU");
}

function parseList(value: string) {
  return value
    .split(/\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function parseTaste(value: string): TasteTag[] {
  const parsed = parseList(value);
  const invalid = parsed.filter((entry) => !tasteTags.includes(entry as TasteTag));

  if (invalid.length > 0) {
    throw new Error(`Неизвестные теги вкуса: ${invalid.join(", ")}.`);
  }

  return parsed as TasteTag[];
}

function parseRecipeIngredients(value: string, knownIngredientIds: Set<string>) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [rawIngredientId, ...amountParts] = line.split("|");
      const ingredientId = rawIngredientId.trim();
      const amount = amountParts.join("|").trim();

      if (!ingredientId || !amount) {
        throw new Error("Ингредиенты рецепта должны быть в формате ingredient-id | количество.");
      }

      if (!knownIngredientIds.has(ingredientId)) {
        throw new Error(`Неизвестный ingredient-id: ${ingredientId}.`);
      }

      return {
        ingredientId,
        amount,
      };
    });
}

function buildCocktailFromEditor(editor: EditorState, knownIngredientIds: Set<string>): Cocktail {
  const id = editor.id.trim();
  const name = editor.name.trim();
  const baseSpirit = editor.baseSpirit.trim();
  const glassName = editor.glassName.trim();
  const steps = editor.steps
    .split("\n")
    .map((step) => step.trim())
    .filter(Boolean);
  const recipeIngredients = parseRecipeIngredients(editor.recipeIngredients, knownIngredientIds);

  if (!id || !name || !baseSpirit || !glassName) {
    throw new Error("ID, название, база и бокал обязательны.");
  }

  if (steps.length === 0) {
    throw new Error("Добавь хотя бы один шаг приготовления.");
  }

  if (recipeIngredients.length === 0) {
    throw new Error("Добавь хотя бы один ингредиент рецепта.");
  }

  return {
    id,
    name,
    baseSpirit,
    taste: parseTaste(editor.taste),
    strength: editor.strength,
    glassName,
    steps,
    garnish: editor.garnish.trim() || undefined,
    imageAssetKey: editor.imageAssetKey.trim() || undefined,
    imageStatus: editor.imageStatus,
    isPublished: editor.isPublished,
    referenceUrls: parseList(editor.referenceUrls),
    ingredients: recipeIngredients.map((entry) => entry.ingredientId),
    recipeIngredients,
  };
}

function getCatalogSourceLabel(source: CocktailCatalogSource) {
  if (source === "remote") {
    return "Supabase";
  }

  if (source === "remote-empty") {
    return "Supabase пустая";
  }

  return "Локальная копия";
}

function getImageStatusLabel(status: CocktailImageStatus) {
  if (status === "approved") return "Картинка принята";
  if (status === "generated") return "Сгенерировано";
  if (status === "reference-needed") return "Нужны референсы";
  return "В очереди";
}

export function AdminCocktailsTab({
  adminAccessError,
  catalogCocktails,
  catalogError,
  catalogSource,
  ingredients,
  isAdmin,
  isLoadingCatalog,
  onReloadCatalog,
  userId,
}: AdminCocktailsTabProps) {
  const [editor, setEditor] = useState<EditorState>(emptyEditor);
  const [message, setMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const knownIngredientIds = useMemo(
    () => new Set(ingredients.map((ingredient) => ingredient.id)),
    [ingredients],
  );

  const filteredCocktails = useMemo(() => {
    const normalized = normalizeSearch(searchQuery);

    if (!normalized) {
      return catalogCocktails;
    }

    return catalogCocktails.filter((cocktail) => {
      const searchable = [
        cocktail.id,
        cocktail.name,
        cocktail.baseSpirit,
        cocktail.glassName,
      ].join(" ");

      return normalizeSearch(searchable).includes(normalized);
    });
  }, [catalogCocktails, searchQuery]);

  const selectedCocktail = useMemo(
    () => catalogCocktails.find((cocktail) => cocktail.id === selectedId) ?? null,
    [catalogCocktails, selectedId],
  );

  const stats = useMemo(() => {
    const published = catalogCocktails.filter((cocktail) => cocktail.isPublished !== false).length;
    const referencesNeeded = catalogCocktails.filter(
      (cocktail) => (cocktail.imageStatus ?? "todo") === "reference-needed",
    ).length;
    const approvedImages = catalogCocktails.filter(
      (cocktail) => (cocktail.imageStatus ?? "todo") === "approved",
    ).length;

    return {
      approvedImages,
      published,
      referencesNeeded,
      total: catalogCocktails.length,
    };
  }, [catalogCocktails]);

  useEffect(() => {
    if (catalogCocktails.length === 0) {
      setSelectedId(null);
      setEditor(emptyEditor);
      return;
    }

    if (!selectedId || !catalogCocktails.some((cocktail) => cocktail.id === selectedId)) {
      setSelectedId(catalogCocktails[0].id);
    }
  }, [catalogCocktails, selectedId]);

  useEffect(() => {
    if (selectedCocktail) {
      setEditor(toEditorState(selectedCocktail));
    }
  }, [selectedCocktail]);

  const updateEditor = <Key extends keyof EditorState>(key: Key, value: EditorState[Key]) => {
    setEditor((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const selectCocktail = (cocktail: Cocktail) => {
    setMessage(null);
    setSelectedId(cocktail.id);
    setEditor(toEditorState(cocktail));
  };

  const createNewCocktail = () => {
    setMessage("Новый коктейль появится в Supabase после сохранения.");
    setSelectedId(null);
    setEditor({
      ...emptyEditor,
      id: "new-cocktail",
      name: "Новый коктейль",
      recipeIngredients: "gin | 45 мл\nlemon-juice | 20 мл",
      steps: "Подготовь бокал.\nСмешай ингредиенты со льдом.\nПодавай сразу.",
    });
  };

  const importLocalDatabase = async () => {
    if (!isAdmin) {
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      await seedRemoteCocktails(undefined, userId);
      await onReloadCatalog();
      setMessage("Локальная база импортирована в Supabase.");
    } catch (error) {
      console.warn("Failed to import cocktail database.", error);
      setMessage("Не удалось импортировать базу. Проверь SQL-схему и админский доступ.");
    } finally {
      setIsSaving(false);
    }
  };

  const saveCocktail = async () => {
    if (!isAdmin || catalogSource !== "remote") {
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const nextCocktail = buildCocktailFromEditor(editor, knownIngredientIds);
      await saveRemoteCocktail(nextCocktail, userId);
      await onReloadCatalog();
      setSelectedId(nextCocktail.id);
      setMessage("Коктейль сохранен.");
    } catch (error) {
      console.warn("Failed to save cocktail.", error);
      setMessage(error instanceof Error ? error.message : "Не удалось сохранить коктейль.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <SectionPanel
        title="Админка"
        hint="Эта вкладка доступна только пользователям из таблицы admin_users."
      >
        <View style={styles.noticeBox}>
          <Text style={styles.noticeTitle}>Нет админского доступа</Text>
          <Text style={styles.noticeText}>
            Войди в нужный аккаунт и добавь его user_id в public.admin_users через Supabase SQL Editor.
          </Text>
          {adminAccessError ? <Text style={styles.errorText}>{adminAccessError}</Text> : null}
        </View>
      </SectionPanel>
    );
  }

  const canSave = catalogSource === "remote" && !isSaving;

  return (
    <>
      <SectionPanel
        title="Админка коктейлей"
        hint="Просмотр, импорт и редактирование облачного каталога. Публичный сайт читает только опубликованные коктейли."
      >
        <View style={styles.statusBox}>
          <View style={styles.statusHeader}>
            <View>
              <Text style={styles.statusTitle}>{getCatalogSourceLabel(catalogSource)}</Text>
              <Text style={styles.statusText}>
                {catalogSource === "remote"
                  ? "Редактирование включено."
                  : "Сначала примени SQL-схему и импортируй локальную базу."}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={onReloadCatalog}
              style={({ pressed: isPressed }) => [
                styles.secondaryButton,
                isPressed && { opacity: pressed.opacity },
              ]}
            >
              <Text style={styles.secondaryButtonText}>
                {isLoadingCatalog ? "Обновляем" : "Обновить"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>в каталоге</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.published}</Text>
              <Text style={styles.statLabel}>опубликовано</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.referencesNeeded}</Text>
              <Text style={styles.statLabel}>нужны рефы</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.approvedImages}</Text>
              <Text style={styles.statLabel}>картинки ok</Text>
            </View>
          </View>

          {catalogError ? <Text style={styles.errorText}>{catalogError}</Text> : null}
          {message ? <Text style={styles.messageText}>{message}</Text> : null}

          <View style={styles.actionRow}>
            <Pressable
              accessibilityRole="button"
              onPress={importLocalDatabase}
              style={({ pressed: isPressed }) => [
                styles.primaryButton,
                isSaving && styles.disabledButton,
                isPressed && !isSaving && { opacity: pressed.opacity },
              ]}
              disabled={isSaving}
            >
              <Text style={styles.primaryButtonText}>
                {isSaving ? "Работаем" : "Импортировать локальную базу"}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={createNewCocktail}
              style={({ pressed: isPressed }) => [
                styles.secondaryButton,
                isPressed && { opacity: pressed.opacity },
              ]}
            >
              <Text style={styles.secondaryButtonText}>Новый коктейль</Text>
            </Pressable>
          </View>
        </View>
      </SectionPanel>

      <View style={styles.adminLayout}>
        <SectionPanel
          title="Каталог"
          hint="Поиск по названию, ID, базе и бокалу."
          style={styles.catalogColumn}
        >
          <View style={styles.searchWrap}>
            <TextInput
              accessibilityLabel="Поиск по каталогу коктейлей"
              onChangeText={setSearchQuery}
              placeholder="Например: negroni, виски, хайбол"
              placeholderTextColor={colors.textDim}
              style={styles.input}
              value={searchQuery}
            />
          </View>

          <View style={styles.list}>
            {filteredCocktails.map((cocktail) => {
              const isSelected = cocktail.id === selectedId;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  key={cocktail.id}
                  onPress={() => selectCocktail(cocktail)}
                  style={({ pressed: isPressed }) => [
                    styles.listItem,
                    isSelected && styles.listItemActive,
                    isPressed && { opacity: pressed.opacity },
                  ]}
                >
                  <View style={styles.listItemCopy}>
                    <Text style={styles.listItemTitle}>{cocktail.name}</Text>
                    <Text style={styles.listItemMeta}>
                      {cocktail.id} · {cocktail.baseSpirit} · {cocktail.glassName}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.imageStatusBadge,
                      (cocktail.imageStatus ?? "todo") === "approved" && styles.imageStatusApproved,
                    ]}
                  >
                    {getImageStatusLabel(cocktail.imageStatus ?? "todo")}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </SectionPanel>

        <SectionPanel
          title="Редактор"
          hint="Ингредиенты вводятся построчно: ingredient-id | количество."
          style={styles.editorColumn}
        >
          <View style={styles.editorBox}>
            {catalogSource !== "remote" ? (
              <View style={styles.noticeBox}>
                <Text style={styles.noticeTitle}>Редактирование пока выключено</Text>
                <Text style={styles.noticeText}>
                  Примени SQL-схему, добавь админа и импортируй локальную базу. После этого кнопка сохранения станет активной.
                </Text>
              </View>
            ) : null}

            <View style={styles.formGrid}>
              <View style={styles.field}>
                <Text style={styles.label}>ID</Text>
                <TextInput
                  autoCapitalize="none"
                  onChangeText={(value) => updateEditor("id", value)}
                  placeholder="cocktail-id"
                  placeholderTextColor={colors.textDim}
                  style={styles.input}
                  value={editor.id}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Название</Text>
                <TextInput
                  onChangeText={(value) => updateEditor("name", value)}
                  placeholder="Название коктейля"
                  placeholderTextColor={colors.textDim}
                  style={styles.input}
                  value={editor.name}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>База</Text>
                <TextInput
                  onChangeText={(value) => updateEditor("baseSpirit", value)}
                  placeholder="Джин, бурбон, ром..."
                  placeholderTextColor={colors.textDim}
                  style={styles.input}
                  value={editor.baseSpirit}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Бокал</Text>
                <TextInput
                  onChangeText={(value) => updateEditor("glassName", value)}
                  placeholder="Рокс, хайбол..."
                  placeholderTextColor={colors.textDim}
                  style={styles.input}
                  value={editor.glassName}
                />
              </View>
            </View>

            <View style={styles.selectorBlock}>
              <Text style={styles.label}>Крепость</Text>
              <View style={styles.chipRow}>
                {strengthValues.map((strength) => (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: editor.strength === strength }}
                    key={strength}
                    onPress={() => updateEditor("strength", strength)}
                    style={({ pressed: isPressed }) => [
                      styles.chip,
                      editor.strength === strength && styles.chipActive,
                      isPressed && { opacity: pressed.opacity },
                    ]}
                  >
                    <Text style={[styles.chipText, editor.strength === strength && styles.chipTextActive]}>
                      {strength}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Теги вкуса</Text>
              <TextInput
                onChangeText={(value) => updateEditor("taste", value)}
                placeholder="refreshing, sweet, sour"
                placeholderTextColor={colors.textDim}
                style={styles.input}
                value={editor.taste}
              />
              <Text style={styles.hint}>Доступно: {tasteTags.join(", ")}.</Text>
            </View>

            <View style={styles.formGrid}>
              <View style={styles.field}>
                <Text style={styles.label}>Статус картинки</Text>
                <View style={styles.chipRow}>
                  {imageStatusValues.map((status) => (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected: editor.imageStatus === status }}
                      key={status}
                      onPress={() => updateEditor("imageStatus", status)}
                      style={({ pressed: isPressed }) => [
                        styles.chip,
                        editor.imageStatus === status && styles.chipActive,
                        isPressed && { opacity: pressed.opacity },
                      ]}
                    >
                      <Text style={[styles.chipText, editor.imageStatus === status && styles.chipTextActive]}>
                        {status}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Ключ ассета</Text>
                <TextInput
                  autoCapitalize="none"
                  onChangeText={(value) => updateEditor("imageAssetKey", value)}
                  placeholder="assets/drinks/..."
                  placeholderTextColor={colors.textDim}
                  style={styles.input}
                  value={editor.imageAssetKey}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Референсы</Text>
              <TextInput
                multiline
                onChangeText={(value) => updateEditor("referenceUrls", value)}
                placeholder="Один URL на строку"
                placeholderTextColor={colors.textDim}
                style={[styles.input, styles.textAreaSmall]}
                textAlignVertical="top"
                value={editor.referenceUrls}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Ингредиенты рецепта</Text>
              <TextInput
                multiline
                onChangeText={(value) => updateEditor("recipeIngredients", value)}
                placeholder="gin | 45 мл"
                placeholderTextColor={colors.textDim}
                style={[styles.input, styles.textArea]}
                textAlignVertical="top"
                value={editor.recipeIngredients}
              />
              <Text style={styles.hint}>Пример ID: {ingredients.slice(0, 8).map((ingredient) => ingredient.id).join(", ")}.</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Шаги приготовления</Text>
              <TextInput
                multiline
                onChangeText={(value) => updateEditor("steps", value)}
                placeholder="Один шаг на строку"
                placeholderTextColor={colors.textDim}
                style={[styles.input, styles.textArea]}
                textAlignVertical="top"
                value={editor.steps}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Подача / гарнир</Text>
              <TextInput
                onChangeText={(value) => updateEditor("garnish", value)}
                placeholder="Например: цедра апельсина"
                placeholderTextColor={colors.textDim}
                style={styles.input}
                value={editor.garnish}
              />
            </View>

            <View style={styles.actionRow}>
              <Pressable
                accessibilityRole="switch"
                accessibilityState={{ checked: editor.isPublished }}
                onPress={() => updateEditor("isPublished", !editor.isPublished)}
                style={({ pressed: isPressed }) => [
                  styles.publishToggle,
                  editor.isPublished && styles.publishToggleActive,
                  isPressed && { opacity: pressed.opacity },
                ]}
              >
                <Text style={[styles.publishToggleText, editor.isPublished && styles.publishToggleTextActive]}>
                  {editor.isPublished ? "Опубликован" : "Черновик"}
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: !canSave }}
                disabled={!canSave}
                onPress={saveCocktail}
                style={({ pressed: isPressed }) => [
                  styles.primaryButton,
                  !canSave && styles.disabledButton,
                  isPressed && canSave && { opacity: pressed.opacity },
                ]}
              >
                <Text style={[styles.primaryButtonText, !canSave && styles.disabledButtonText]}>
                  {isSaving ? "Сохраняем" : "Сохранить коктейль"}
                </Text>
              </Pressable>
            </View>
          </View>
        </SectionPanel>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  statusBox: {
    backgroundColor: "rgba(7, 26, 18, 0.9)",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(237, 169, 52, 0.38)",
    padding: spacing.md,
    gap: spacing.md,
  },
  statusHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  statusTitle: {
    color: colors.paper,
    fontFamily: fonts.display,
    fontSize: 20,
    fontWeight: "900",
  },
  statusText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: 120,
    backgroundColor: "rgba(18, 43, 31, 0.8)",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(135, 217, 167, 0.2)",
    padding: spacing.md,
    gap: 2,
  },
  statValue: {
    color: colors.paper,
    fontFamily: fonts.display,
    fontSize: 26,
    fontWeight: "900",
  },
  statLabel: {
    color: colors.textSubtle,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  adminLayout: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xl,
  },
  catalogColumn: {
    flexGrow: 1,
    flexBasis: 300,
  },
  editorColumn: {
    flexGrow: 2,
    flexBasis: 420,
  },
  searchWrap: {
    backgroundColor: "rgba(7, 26, 18, 0.9)",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(237, 169, 52, 0.34)",
    paddingHorizontal: 12,
  },
  list: {
    gap: spacing.sm,
  },
  listItem: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    backgroundColor: "rgba(7, 26, 18, 0.82)",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(237, 169, 52, 0.28)",
    padding: spacing.md,
  },
  listItemActive: {
    borderColor: colors.accent,
    backgroundColor: "rgba(46, 29, 8, 0.58)",
  },
  listItemCopy: {
    flex: 1,
    minWidth: 200,
    gap: 4,
  },
  listItemTitle: {
    color: colors.paper,
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: "900",
  },
  listItemMeta: {
    color: colors.textSubtle,
    fontSize: 12,
    lineHeight: 17,
  },
  imageStatusBadge: {
    color: colors.warning,
    backgroundColor: colors.warningBg,
    borderRadius: radii.pill,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 11,
    fontWeight: "900",
  },
  imageStatusApproved: {
    color: colors.success,
    backgroundColor: colors.successBg,
  },
  editorBox: {
    backgroundColor: "rgba(7, 26, 18, 0.9)",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(237, 169, 52, 0.34)",
    padding: spacing.md,
    gap: spacing.md,
  },
  formGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  field: {
    flexGrow: 1,
    flexBasis: 240,
    gap: 6,
  },
  selectorBlock: {
    gap: 8,
  },
  label: {
    color: colors.paper,
    fontSize: 13,
    fontWeight: "900",
  },
  input: {
    color: colors.paper,
    backgroundColor: "rgba(3, 15, 10, 0.78)",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(237, 169, 52, 0.34)",
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: {
    minHeight: 138,
  },
  textAreaSmall: {
    minHeight: 92,
  },
  hint: {
    color: colors.textDim,
    fontSize: 12,
    lineHeight: 17,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(237, 169, 52, 0.34)",
    backgroundColor: "rgba(3, 15, 10, 0.72)",
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipText: {
    color: colors.paper,
    fontSize: 12,
    fontWeight: "900",
  },
  chipTextActive: {
    color: colors.textOnAccent,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  primaryButton: {
    flexGrow: 1,
    minHeight: 46,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  primaryButtonText: {
    color: colors.textOnAccent,
    fontSize: 14,
    fontWeight: "900",
    textAlign: "center",
  },
  secondaryButton: {
    minHeight: 46,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(237, 169, 52, 0.44)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(3, 15, 10, 0.72)",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: colors.paper,
    fontSize: 13,
    fontWeight: "900",
  },
  disabledButton: {
    backgroundColor: colors.borderMuted,
    borderColor: colors.borderMuted,
  },
  disabledButtonText: {
    color: colors.textDim,
  },
  publishToggle: {
    flexGrow: 1,
    minHeight: 46,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(237, 169, 52, 0.44)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  publishToggleActive: {
    borderColor: "rgba(135, 217, 167, 0.55)",
    backgroundColor: colors.successBg,
  },
  publishToggleText: {
    color: colors.warning,
    fontSize: 13,
    fontWeight: "900",
  },
  publishToggleTextActive: {
    color: colors.success,
  },
  noticeBox: {
    backgroundColor: colors.warningBg,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(237, 169, 52, 0.36)",
    padding: spacing.md,
    gap: 6,
  },
  noticeTitle: {
    color: colors.warning,
    fontSize: 15,
    fontWeight: "900",
  },
  noticeText: {
    color: colors.paper,
    fontSize: 13,
    lineHeight: 19,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 18,
  },
  messageText: {
    color: colors.success,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
  },
});
