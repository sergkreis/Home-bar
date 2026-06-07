const NUMBER_PATTERN = String.raw`(?:\d+(?:\.\d+)?(?:\s+\d+\/\d+)?|\d+\/\d+)`;
const UNIT_PATTERN = String.raw`(?:oz|cl|ml|tsp|tblsp|tbsp|drops?|dashes?|parts?|shots?|measures?|slice|wedge|cube)`;

const directAmountLabels: Record<string, string> = {
  "(claret)": "кларет",
  chilled: "охлажденное",
  cubes: "кубики",
  dash: "1 дэш",
  garnish: "для украшения",
  "juice of 1": "сок 1 шт.",
  "juice of 1 wedge": "сок 1 дольки",
  "juice of 1/2": "сок 1/2 шт.",
  splash: "плеск",
  "top up with": "долить",
  "twist of": "цедра",
  "по вкусу": "по вкусу",
};

const modifierLabels: Record<string, string> = {
  blended: "купажированный",
  chilled: "охлажденное",
  red: "красный",
  superfine: "мелкий",
  white: "белый",
};

function normalizeWhitespace(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function parseRecipeNumber(value: string): number | null {
  const normalized = normalizeWhitespace(value);
  const mixedMatch = normalized.match(/^(\d+(?:\.\d+)?)\s+(\d+)\/(\d+)$/);

  if (mixedMatch) {
    const whole = Number(mixedMatch[1]);
    const numerator = Number(mixedMatch[2]);
    const denominator = Number(mixedMatch[3]);

    return denominator === 0 ? null : whole + numerator / denominator;
  }

  const fractionMatch = normalized.match(/^(\d+)\/(\d+)$/);

  if (fractionMatch) {
    const numerator = Number(fractionMatch[1]);
    const denominator = Number(fractionMatch[2]);

    return denominator === 0 ? null : numerator / denominator;
  }

  const numericValue = Number(normalized);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function formatDecimal(value: number) {
  return Number.isInteger(value) ? String(value) : String(value).replace(".", ",");
}

function formatMilliliters(value: number) {
  return `${formatDecimal(Math.round(value * 10) / 10)} мл`;
}

function appendModifier(label: string, modifier: string) {
  const normalizedModifier = normalizeWhitespace(modifier).toLowerCase();

  if (!normalizedModifier) {
    return label;
  }

  return `${label}, ${modifierLabels[normalizedModifier] ?? normalizeWhitespace(modifier)}`;
}

function formatCountUnit(amount: string, unit: string) {
  const normalizedUnit = unit.toLowerCase();
  const amountValue = parseRecipeNumber(amount);
  const isOne = amountValue === 1;

  if (normalizedUnit.startsWith("drop")) {
    return `${amount} ${isOne ? "капля" : "капли"}`;
  }

  if (normalizedUnit.startsWith("dash")) {
    return `${amount} ${isOne ? "дэш" : "дэша"}`;
  }

  if (normalizedUnit.startsWith("part")) {
    return `${amount} ${isOne ? "часть" : "части"}`;
  }

  if (normalizedUnit.startsWith("shot")) {
    return `${amount} ${isOne ? "шот" : "шота"}`;
  }

  if (normalizedUnit.startsWith("measure")) {
    return `${amount} ${isOne ? "мера" : "меры"}`;
  }

  if (normalizedUnit === "slice" || normalizedUnit === "wedge") {
    return `${amount} ${isOne ? "долька" : "дольки"}`;
  }

  if (normalizedUnit === "cube") {
    return `${amount} ${isOne ? "кубик" : "кубика"}`;
  }

  return `${amount} ${unit}`;
}

function formatSingleAmount(amount: string, unit: string, modifier = "") {
  const amountValue = parseRecipeNumber(amount);
  const normalizedUnit = unit.toLowerCase();

  if (amountValue === null) {
    return appendModifier(`${amount} ${unit}`, modifier);
  }

  if (normalizedUnit === "oz") {
    return appendModifier(formatMilliliters(amountValue * 30), modifier);
  }

  if (normalizedUnit === "cl") {
    return appendModifier(formatMilliliters(amountValue * 10), modifier);
  }

  if (normalizedUnit === "ml") {
    return appendModifier(formatMilliliters(amountValue), modifier);
  }

  if (normalizedUnit === "tsp") {
    return appendModifier(`${amount} ч. л.`, modifier);
  }

  if (normalizedUnit === "tblsp" || normalizedUnit === "tbsp") {
    return appendModifier(`${amount} ст. л.`, modifier);
  }

  return appendModifier(formatCountUnit(amount, unit), modifier);
}

export function formatRecipeAmount(amount: string) {
  const normalizedAmount = normalizeWhitespace(amount);
  const directLabel = directAmountLabels[normalizedAmount.toLowerCase()];

  if (directLabel) {
    return directLabel;
  }

  const milliliterAliasMatch = normalizedAmount.match(/^(\d+(?:\.\d+)?)\s*ml\s*\/.*$/i);

  if (milliliterAliasMatch) {
    return formatMilliliters(Number(milliliterAliasMatch[1]));
  }

  const freshMatch = normalizedAmount.match(/^(\d+)\s+fresh$/i);

  if (freshMatch) {
    return `${freshMatch[1]} свежих`;
  }

  const orMatch = normalizedAmount.match(/^(\d+)\s+or\s+(\d+)$/i);

  if (orMatch) {
    return `${orMatch[1]}-${orMatch[2]}`;
  }

  const rangeMatch = normalizedAmount.match(
    new RegExp(`^(${NUMBER_PATTERN})\\s*-\\s*(${NUMBER_PATTERN})\\s*(${UNIT_PATTERN})\\b\\s*(.*)$`, "i"),
  );

  if (rangeMatch) {
    const [, leftAmount, rightAmount, unit, modifier] = rangeMatch;

    return appendModifier(
      `${formatSingleAmount(leftAmount, unit).replace(/\s.*$/, "")}-${formatSingleAmount(rightAmount, unit)}`,
      modifier,
    );
  }

  const amountMatch = normalizedAmount.match(
    new RegExp(`^(${NUMBER_PATTERN})\\s*(${UNIT_PATTERN})\\b\\s*(.*)$`, "i"),
  );

  if (amountMatch) {
    const [, value, unit, modifier] = amountMatch;

    return formatSingleAmount(value, unit, modifier);
  }

  return normalizedAmount;
}

export function formatRecipeStep(step: string) {
  const garnishMatch = step.match(/^Укрась:\s*(.+)\.$/);

  if (!garnishMatch) {
    return step;
  }

  const garnishItems = garnishMatch[1]
    .split(",")
    .map((item) => normalizeWhitespace(item))
    .filter(Boolean);
  const uniqueGarnishItems = Array.from(new Set(garnishItems));

  return `Укрась: ${uniqueGarnishItems.join(", ")}.`;
}
