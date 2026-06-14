import { Image, ImageSourcePropType, StyleSheet, View, ViewStyle } from "react-native";

type DrinkArtKey =
  | "alexander"
  | "americano"
  | "aviation"
  | "b52"
  | "bellini"
  | "bramble"
  | "brooklyn"
  | "casino"
  | "caipirinha"
  | "cloverClub"
  | "corpseReviver"
  | "cosmopolitan"
  | "cubaLibre"
  | "daiquiri"
  | "darkAndStormy"
  | "dirtyMartini"
  | "dryMartini"
  | "espressoMartini"
  | "french75"
  | "frenchConnection"
  | "frenchMartini"
  | "gimlet"
  | "ginFizz"
  | "ginRickey"
  | "ginTonic"
  | "godfather"
  | "grasshopper"
  | "greyhound"
  | "harveyWallbanger"
  | "hemingwaySpecial"
  | "horseSNeck"
  | "irishCoffee"
  | "jackRoseCocktail"
  | "johnCollins"
  | "kamikaze"
  | "kir"
  | "kirRoyale"
  | "lastWord"
  | "lemonDrop"
  | "longIslandIcedTea"
  | "maiTai"
  | "manhattan"
  | "margarita"
  | "martinez2"
  | "maryPickford"
  | "mimosa"
  | "mintJulep"
  | "monkeyGland"
  | "moscowMule"
  | "mojito"
  | "negroni"
  | "newYorkSour"
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
  alexander: require("../../assets/drinks/alexander-art.png"),
  americano: require("../../assets/drinks/americano-art.png"),
  aviation: require("../../assets/drinks/aviation-art.png"),
  b52: require("../../assets/drinks/b-52-art.png"),
  bellini: require("../../assets/drinks/bellini-art.png"),
  bramble: require("../../assets/drinks/bramble-art.png"),
  brooklyn: require("../../assets/drinks/brooklyn-art.png"),
  casino: require("../../assets/drinks/casino-art.png"),
  caipirinha: require("../../assets/drinks/caipirinha-art.png"),
  cloverClub: require("../../assets/drinks/clover-club-art.png"),
  corpseReviver: require("../../assets/drinks/corpse-reviver-art.png"),
  cosmopolitan: require("../../assets/drinks/cosmopolitan-art.png"),
  cubaLibre: require("../../assets/drinks/cuba-libre-art.png"),
  daiquiri: require("../../assets/drinks/daiquiri-art.png"),
  darkAndStormy: require("../../assets/drinks/dark-and-stormy-art.png"),
  dirtyMartini: require("../../assets/drinks/dirty-martini-art.png"),
  dryMartini: require("../../assets/drinks/dry-martini-art.png"),
  espressoMartini: require("../../assets/drinks/espresso-martini-art.png"),
  french75: require("../../assets/drinks/french-75-art.png"),
  frenchConnection: require("../../assets/drinks/french-connection-art.png"),
  frenchMartini: require("../../assets/drinks/french-martini-art.png"),
  gimlet: require("../../assets/drinks/gimlet-art.png"),
  ginFizz: require("../../assets/drinks/gin-fizz-art.png"),
  ginRickey: require("../../assets/drinks/gin-rickey-art.png"),
  ginTonic: require("../../assets/drinks/gin-tonic-art.png"),
  godfather: require("../../assets/drinks/godfather-art.png"),
  grasshopper: require("../../assets/drinks/grasshopper-art.png"),
  greyhound: require("../../assets/drinks/greyhound-art.png"),
  harveyWallbanger: require("../../assets/drinks/harvey-wallbanger-art.png"),
  hemingwaySpecial: require("../../assets/drinks/hemingway-special-art.png"),
  horseSNeck: require("../../assets/drinks/horse-s-neck-art.png"),
  irishCoffee: require("../../assets/drinks/irish-coffee-art.png"),
  jackRoseCocktail: require("../../assets/drinks/jack-rose-cocktail-art.png"),
  johnCollins: require("../../assets/drinks/john-collins-art.png"),
  kamikaze: require("../../assets/drinks/kamikaze-art.png"),
  kir: require("../../assets/drinks/kir-art.png"),
  kirRoyale: require("../../assets/drinks/kir-royale-art.png"),
  lastWord: require("../../assets/drinks/the-last-word-art.png"),
  lemonDrop: require("../../assets/drinks/lemon-drop-art.png"),
  longIslandIcedTea: require("../../assets/drinks/long-island-iced-tea-art.png"),
  maiTai: require("../../assets/drinks/mai-tai-art.png"),
  manhattan: require("../../assets/drinks/manhattan-art.png"),
  margarita: require("../../assets/drinks/margarita-art.png"),
  martinez2: require("../../assets/drinks/martinez-2-art.png"),
  maryPickford: require("../../assets/drinks/mary-pickford-art.png"),
  mimosa: require("../../assets/drinks/mimosa-art.png"),
  mintJulep: require("../../assets/drinks/mint-julep-art.png"),
  monkeyGland: require("../../assets/drinks/monkey-gland-art.png"),
  moscowMule: require("../../assets/drinks/moscow-mule-art.png"),
  mojito: require("../../assets/drinks/mojito-art.png"),
  negroni: require("../../assets/drinks/negroni-art.png"),
  newYorkSour: require("../../assets/drinks/new-york-sour-art.png"),
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
    alexander: "alexander",
    americano: "americano",
    aviation: "aviation",
    "b-52": "b52",
    bellini: "bellini",
    bramble: "bramble",
    brooklyn: "brooklyn",
    casino: "casino",
    caipirinha: "caipirinha",
    "clover-club": "cloverClub",
    "corpse-reviver": "corpseReviver",
    cosmopolitan: "cosmopolitan",
    "cuba-libre": "cubaLibre",
    daiquiri: "daiquiri",
    "dark-and-stormy": "darkAndStormy",
    "dirty-martini": "dirtyMartini",
    "dry-martini": "dryMartini",
    "espresso-martini": "espressoMartini",
    "french-75": "french75",
    "french-connection": "frenchConnection",
    "french-martini": "frenchMartini",
    gimlet: "gimlet",
    "gin-fizz": "ginFizz",
    "gin-rickey": "ginRickey",
    "gin-tonic": "ginTonic",
    godfather: "godfather",
    grasshopper: "grasshopper",
    greyhound: "greyhound",
    "harvey-wallbanger": "harveyWallbanger",
    "hemingway-special": "hemingwaySpecial",
    "horse-s-neck": "horseSNeck",
    "irish-coffee": "irishCoffee",
    "jack-rose-cocktail": "jackRoseCocktail",
    "john-collins": "johnCollins",
    kamikaze: "kamikaze",
    kir: "kir",
    "kir-royale": "kirRoyale",
    "the-last-word": "lastWord",
    "lemon-drop": "lemonDrop",
    "long-island-iced-tea": "longIslandIcedTea",
    "mai-tai": "maiTai",
    manhattan: "manhattan",
    margarita: "margarita",
    "martinez-2": "martinez2",
    "mary-pickford": "maryPickford",
    mimosa: "mimosa",
    "mint-julep": "mintJulep",
    "monkey-gland": "monkeyGland",
    "moscow-mule": "moscowMule",
    mojito: "mojito",
    negroni: "negroni",
    "new-york-sour": "newYorkSour",
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
