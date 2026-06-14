import { Image, ImageSourcePropType, StyleSheet, View, ViewStyle } from "react-native";

type DrinkArtKey =
  | "americano"
  | "aviation"
  | "bellini"
  | "bramble"
  | "caipirinha"
  | "cosmopolitan"
  | "cubaLibre"
  | "daiquiri"
  | "darkAndStormy"
  | "dryMartini"
  | "espressoMartini"
  | "french75"
  | "gimlet"
  | "ginTonic"
  | "longIslandIcedTea"
  | "maiTai"
  | "manhattan"
  | "margarita"
  | "mintJulep"
  | "moscowMule"
  | "mojito"
  | "negroni"
  | "oldFashioned"
  | "paloma"
  | "pinaColada"
  | "sazerac"
  | "spritz"
  | "tomCollins"
  | "whiskeySour"
  | "whiteRussian"
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
  americano: require("../../assets/drinks/americano-art.png"),
  aviation: require("../../assets/drinks/aviation-art.png"),
  bellini: require("../../assets/drinks/bellini-art.png"),
  bramble: require("../../assets/drinks/bramble-art.png"),
  caipirinha: require("../../assets/drinks/caipirinha-art.png"),
  cosmopolitan: require("../../assets/drinks/cosmopolitan-art.png"),
  cubaLibre: require("../../assets/drinks/cuba-libre-art.png"),
  daiquiri: require("../../assets/drinks/daiquiri-art.png"),
  darkAndStormy: require("../../assets/drinks/dark-and-stormy-art.png"),
  dryMartini: require("../../assets/drinks/dry-martini-art.png"),
  espressoMartini: require("../../assets/drinks/espresso-martini-art.png"),
  french75: require("../../assets/drinks/french-75-art.png"),
  gimlet: require("../../assets/drinks/gimlet-art.png"),
  ginTonic: require("../../assets/drinks/gin-tonic-art.png"),
  longIslandIcedTea: require("../../assets/drinks/long-island-iced-tea-art.png"),
  maiTai: require("../../assets/drinks/mai-tai-art.png"),
  manhattan: require("../../assets/drinks/manhattan-art.png"),
  margarita: require("../../assets/drinks/margarita-art.png"),
  mintJulep: require("../../assets/drinks/mint-julep-art.png"),
  moscowMule: require("../../assets/drinks/moscow-mule-art.png"),
  mojito: require("../../assets/drinks/mojito-art.png"),
  negroni: require("../../assets/drinks/negroni-art.png"),
  oldFashioned: require("../../assets/drinks/old-fashioned-art.png"),
  paloma: require("../../assets/drinks/paloma-art.png"),
  pinaColada: require("../../assets/drinks/pina-colada-art.png"),
  sazerac: require("../../assets/drinks/sazerac-art.png"),
  spritz: require("../../assets/drinks/spritz-art.png"),
  tomCollins: require("../../assets/drinks/tom-collins-art.png"),
  whiskeySour: require("../../assets/drinks/whiskey-sour-art.png"),
  whiteRussian: require("../../assets/drinks/white-russian-art.png"),
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
    americano: "americano",
    aviation: "aviation",
    bellini: "bellini",
    bramble: "bramble",
    caipirinha: "caipirinha",
    cosmopolitan: "cosmopolitan",
    "cuba-libre": "cubaLibre",
    daiquiri: "daiquiri",
    "dark-and-stormy": "darkAndStormy",
    "dry-martini": "dryMartini",
    "espresso-martini": "espressoMartini",
    "french-75": "french75",
    gimlet: "gimlet",
    "gin-tonic": "ginTonic",
    "long-island-iced-tea": "longIslandIcedTea",
    "mai-tai": "maiTai",
    manhattan: "manhattan",
    margarita: "margarita",
    "mint-julep": "mintJulep",
    "moscow-mule": "moscowMule",
    mojito: "mojito",
    negroni: "negroni",
    "old-fashioned": "oldFashioned",
    paloma: "paloma",
    "pina-colada": "pinaColada",
    sazerac: "sazerac",
    spritz: "spritz",
    "tom-collins": "tomCollins",
    "whiskey-sour": "whiskeySour",
    "white-russian": "whiteRussian",
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
