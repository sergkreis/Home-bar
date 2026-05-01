import { TasteTag } from "../data/cocktails";

export function getStrengthLabel(strength: "light" | "medium" | "strong") {
  if (strength === "light") {
    return "легкий";
  }

  if (strength === "medium") {
    return "средний";
  }

  return "крепкий";
}

export function getTasteLabel(taste: TasteTag) {
  if (taste === "refreshing") {
    return "освежающий";
  }

  if (taste === "sweet") {
    return "сладкий";
  }

  if (taste === "sour") {
    return "кислый";
  }

  if (taste === "strong") {
    return "крепкий";
  }

  return "горький";
}
