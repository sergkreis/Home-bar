import { IngredientPicker } from "../components/IngredientPicker";
import { SectionPanel } from "../components/SectionPanel";
import { Ingredient, IngredientCategory } from "../data/cocktails";

type BarTabProps = {
  ingredients: Ingredient[];
  ingredientGroups: readonly { key: IngredientCategory; label: string }[];
  selectedIngredients: string[];
  onToggleIngredient: (ingredientId: string) => void;
  onClear: () => void;
  onResetToStarter: () => void;
};

export function BarTab({
  ingredients,
  ingredientGroups,
  selectedIngredients,
  onToggleIngredient,
  onClear,
  onResetToStarter,
}: BarTabProps) {
  return (
    <SectionPanel
      title="Мой бар"
      hint="Список сохраняется на этом устройстве. Начни с того, что реально есть под рукой."
    >
      <IngredientPicker
        ingredients={ingredients}
        ingredientGroups={ingredientGroups}
        selectedIngredients={selectedIngredients}
        onToggleIngredient={onToggleIngredient}
        onClear={onClear}
        onReset={onResetToStarter}
      />
    </SectionPanel>
  );
}
