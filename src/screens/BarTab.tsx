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
      title="Инвентарь"
      hint="Отметь, что реально есть под рукой. После входа бар синхронизируется между устройствами."
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
