import { describe, expect, it } from "vitest";

import { formatRecipeAmount, formatRecipeStep } from "./recipeFormatting";

describe("formatRecipeAmount", () => {
  it("converts cocktail ounces to milliliters", () => {
    expect(formatRecipeAmount("2 oz")).toBe("60 мл");
    expect(formatRecipeAmount("3/4 oz")).toBe("22,5 мл");
    expect(formatRecipeAmount("1 1/2 oz")).toBe("45 мл");
    expect(formatRecipeAmount("2-3 oz")).toBe("60-90 мл");
  });

  it("localizes spoon, slice, and garnish-style amounts", () => {
    expect(formatRecipeAmount("1/2 tsp")).toBe("1/2 ч. л.");
    expect(formatRecipeAmount("1-2 tblsp")).toBe("1-2 ст. л.");
    expect(formatRecipeAmount("Juice of 1/2")).toBe("сок 1/2 шт.");
    expect(formatRecipeAmount("1/2 slice")).toBe("1/2 дольки");
    expect(formatRecipeAmount("Twist of")).toBe("цедра");
  });

  it("converts centiliters and keeps useful modifiers", () => {
    expect(formatRecipeAmount("4.5 cL")).toBe("45 мл");
    expect(formatRecipeAmount("4cl")).toBe("40 мл");
    expect(formatRecipeAmount("1 oz red")).toBe("30 мл, красный");
    expect(formatRecipeAmount("4 oz Chilled")).toBe("120 мл, охлажденное");
    expect(formatRecipeAmount("70ml/2fl oz")).toBe("70 мл");
  });
});

describe("formatRecipeStep", () => {
  it("removes duplicate garnish names", () => {
    expect(formatRecipeStep("Укрась: Лимон, Вишня, Лимон.")).toBe("Укрась: Лимон, Вишня.");
  });
});
