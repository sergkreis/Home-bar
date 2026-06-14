import { Image, ImageSourcePropType, StyleSheet, View, ViewStyle } from "react-native";

type DrinkArtKey =
  | "daiquiri"
  | "dryMartini"
  | "espressoMartini"
  | "ginTonic"
  | "manhattan"
  | "margarita"
  | "mojito"
  | "negroni"
  | "oldFashioned"
  | "whiskeySour"
  | "martini";

type DrinkArtCocktail = {
  baseSpirit: string;
  glassName: string;
  id?: string;
  name: string;
};

type DrinkArtProps = {
  cocktail: DrinkArtCocktail | null;
  size?: "thumb" | "hero" | "detail";
  style?: ViewStyle;
};

const sources: Record<DrinkArtKey, ImageSourcePropType> = {
  daiquiri: require("../../assets/drinks/daiquiri-art.png"),
  dryMartini: require("../../assets/drinks/dry-martini-art.png"),
  espressoMartini: require("../../assets/drinks/espresso-martini-art.png"),
  ginTonic: require("../../assets/drinks/gin-tonic-art.png"),
  manhattan: require("../../assets/drinks/manhattan-art.png"),
  margarita: require("../../assets/drinks/margarita-art.png"),
  mojito: require("../../assets/drinks/mojito-art.png"),
  negroni: require("../../assets/drinks/negroni-art.png"),
  oldFashioned: require("../../assets/drinks/old-fashioned-art.png"),
  whiskeySour: require("../../assets/drinks/whiskey-sour-art.png"),
  martini: require("../../assets/drinks/dry-martini-art.png"),
};

const sizeStyles = {
  thumb: {
    width: 86,
    height: 82,
  },
  hero: {
    width: 380,
    height: 292,
  },
  detail: {
    width: 210,
    height: 172,
  },
} as const;

export function getDrinkArtKey(cocktail: DrinkArtCocktail | null): DrinkArtKey {
  if (!cocktail) {
    return "oldFashioned";
  }

  const exactKeyById: Record<string, DrinkArtKey> = {
    daiquiri: "daiquiri",
    "dry-martini": "dryMartini",
    "espresso-martini": "espressoMartini",
    "gin-tonic": "ginTonic",
    manhattan: "manhattan",
    margarita: "margarita",
    mojito: "mojito",
    negroni: "negroni",
    "old-fashioned": "oldFashioned",
    "whiskey-sour": "whiskeySour",
  };
  const exactKey = cocktail.id ? exactKeyById[cocktail.id] : null;

  if (exactKey) {
    return exactKey;
  }

  const name = cocktail.name.toLocaleLowerCase("ru-RU");
  const base = cocktail.baseSpirit.toLocaleLowerCase("ru-RU");
  const glass = cocktail.glassName.toLocaleLowerCase("ru-RU");

  if (name.includes("маргарит")) {
    return "margarita";
  }

  if (name.includes("дайкири")) {
    return "daiquiri";
  }

  if (name.includes("манхэттен")) {
    return "manhattan";
  }

  if (name.includes("эспрессо")) {
    return "espressoMartini";
  }

  if (name.includes("мохито")) {
    return "mojito";
  }

  if (name.includes("мартини") || glass.includes("коктейль") || glass.includes("куп")) {
    return "martini";
  }

  if (name.includes("сауэр")) {
    return "whiskeySour";
  }

  if (name.includes("негрони") || name.includes("американо") || base.includes("кампари")) {
    return "negroni";
  }

  if (name.includes("джин-тоник") || (base.includes("джин") && glass.includes("хайбол"))) {
    return "ginTonic";
  }

  if (glass.includes("хайбол") || glass.includes("коллинз")) {
    return "mojito";
  }

  return "oldFashioned";
}

export function DrinkArt({ cocktail, size = "thumb", style }: DrinkArtProps) {
  const key = getDrinkArtKey(cocktail);

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.wrap, sizeStyles[size], style]}
    >
      <Image resizeMode="contain" source={sources[key]} style={styles.image} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
