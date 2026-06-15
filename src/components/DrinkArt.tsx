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
  | "oldCuban"
  | "oldFashioned"
  | "oldPal"
  | "paloma"
  | "paradise"
  | "peguClub"
  | "penicillin"
  | "pinkGin"
  | "pinaColada"
  | "piscoSour"
  | "plantersPunch"
  | "pornstarMartini"
  | "portoFlip"
  | "ramosGinFizz"
  | "russianSpringPunch"
  | "rustyNail"
  | "sazerac"
  | "seaBreeze"
  | "sidecar"
  | "spritz"
  | "stinger"
  | "tequilaSunrise"
  | "tipperary"
  | "tomCollins"
  | "vesper"
  | "whiskeySour"
  | "whiteLady"
  | "whiteRussian"
  | "zombie"
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
  alexander: require("../../assets/drinks/alexander-art.webp"),
  americano: require("../../assets/drinks/americano-art.webp"),
  aviation: require("../../assets/drinks/aviation-art.webp"),
  b52: require("../../assets/drinks/b-52-art.webp"),
  bellini: require("../../assets/drinks/bellini-art.webp"),
  bramble: require("../../assets/drinks/bramble-art.webp"),
  brooklyn: require("../../assets/drinks/brooklyn-art.webp"),
  casino: require("../../assets/drinks/casino-art.webp"),
  caipirinha: require("../../assets/drinks/caipirinha-art.webp"),
  cloverClub: require("../../assets/drinks/clover-club-art.webp"),
  corpseReviver: require("../../assets/drinks/corpse-reviver-art.webp"),
  cosmopolitan: require("../../assets/drinks/cosmopolitan-art.webp"),
  cubaLibre: require("../../assets/drinks/cuba-libre-art.webp"),
  daiquiri: require("../../assets/drinks/daiquiri-art.webp"),
  darkAndStormy: require("../../assets/drinks/dark-and-stormy-art.webp"),
  dirtyMartini: require("../../assets/drinks/dirty-martini-art.webp"),
  dryMartini: require("../../assets/drinks/dry-martini-art.webp"),
  espressoMartini: require("../../assets/drinks/espresso-martini-art.webp"),
  french75: require("../../assets/drinks/french-75-art.webp"),
  frenchConnection: require("../../assets/drinks/french-connection-art.webp"),
  frenchMartini: require("../../assets/drinks/french-martini-art.webp"),
  gimlet: require("../../assets/drinks/gimlet-art.webp"),
  ginFizz: require("../../assets/drinks/gin-fizz-art.webp"),
  ginRickey: require("../../assets/drinks/gin-rickey-art.webp"),
  ginTonic: require("../../assets/drinks/gin-tonic-art.webp"),
  godfather: require("../../assets/drinks/godfather-art.webp"),
  grasshopper: require("../../assets/drinks/grasshopper-art.webp"),
  greyhound: require("../../assets/drinks/greyhound-art.webp"),
  harveyWallbanger: require("../../assets/drinks/harvey-wallbanger-art.webp"),
  hemingwaySpecial: require("../../assets/drinks/hemingway-special-art.webp"),
  horseSNeck: require("../../assets/drinks/horse-s-neck-art.webp"),
  irishCoffee: require("../../assets/drinks/irish-coffee-art.webp"),
  jackRoseCocktail: require("../../assets/drinks/jack-rose-cocktail-art.webp"),
  johnCollins: require("../../assets/drinks/john-collins-art.webp"),
  kamikaze: require("../../assets/drinks/kamikaze-art.webp"),
  kir: require("../../assets/drinks/kir-art.webp"),
  kirRoyale: require("../../assets/drinks/kir-royale-art.webp"),
  lastWord: require("../../assets/drinks/the-last-word-art.webp"),
  lemonDrop: require("../../assets/drinks/lemon-drop-art.webp"),
  longIslandIcedTea: require("../../assets/drinks/long-island-iced-tea-art.webp"),
  maiTai: require("../../assets/drinks/mai-tai-art.webp"),
  manhattan: require("../../assets/drinks/manhattan-art.webp"),
  margarita: require("../../assets/drinks/margarita-art.webp"),
  martinez2: require("../../assets/drinks/martinez-2-art.webp"),
  maryPickford: require("../../assets/drinks/mary-pickford-art.webp"),
  mimosa: require("../../assets/drinks/mimosa-art.webp"),
  mintJulep: require("../../assets/drinks/mint-julep-art.webp"),
  monkeyGland: require("../../assets/drinks/monkey-gland-art.webp"),
  moscowMule: require("../../assets/drinks/moscow-mule-art.webp"),
  mojito: require("../../assets/drinks/mojito-art.webp"),
  negroni: require("../../assets/drinks/negroni-art.webp"),
  newYorkSour: require("../../assets/drinks/new-york-sour-art.webp"),
  oldCuban: require("../../assets/drinks/old-cuban-art.webp"),
  oldFashioned: require("../../assets/drinks/old-fashioned-art.webp"),
  oldPal: require("../../assets/drinks/old-pal-art.webp"),
  paloma: require("../../assets/drinks/paloma-art.webp"),
  paradise: require("../../assets/drinks/paradise-art.webp"),
  peguClub: require("../../assets/drinks/pegu-club-art.webp"),
  penicillin: require("../../assets/drinks/penicillin-art.webp"),
  pinkGin: require("../../assets/drinks/pink-gin-art.webp"),
  pinaColada: require("../../assets/drinks/pina-colada-art.webp"),
  piscoSour: require("../../assets/drinks/pisco-sour-art.webp"),
  plantersPunch: require("../../assets/drinks/planter-s-punch-art.webp"),
  pornstarMartini: require("../../assets/drinks/pornstar-martini-art.webp"),
  portoFlip: require("../../assets/drinks/porto-flip-art.webp"),
  ramosGinFizz: require("../../assets/drinks/ramos-gin-fizz-art.webp"),
  russianSpringPunch: require("../../assets/drinks/russian-spring-punch-art.webp"),
  rustyNail: require("../../assets/drinks/rusty-nail-art.webp"),
  sazerac: require("../../assets/drinks/sazerac-art.webp"),
  seaBreeze: require("../../assets/drinks/sea-breeze-art.webp"),
  sidecar: require("../../assets/drinks/sidecar-art.webp"),
  spritz: require("../../assets/drinks/spritz-art.webp"),
  stinger: require("../../assets/drinks/stinger-art.webp"),
  tequilaSunrise: require("../../assets/drinks/tequila-sunrise-art.webp"),
  tipperary: require("../../assets/drinks/tipperary-art.webp"),
  tomCollins: require("../../assets/drinks/tom-collins-art.webp"),
  vesper: require("../../assets/drinks/vesper-art.webp"),
  whiskeySour: require("../../assets/drinks/whiskey-sour-art.webp"),
  whiteLady: require("../../assets/drinks/white-lady-art.webp"),
  whiteRussian: require("../../assets/drinks/white-russian-art.webp"),
  zombie: require("../../assets/drinks/zombie-art.webp"),
  martini: require("../../assets/drinks/dry-martini-art.webp"),
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
    "old-cuban": "oldCuban",
    "old-fashioned": "oldFashioned",
    "old-pal": "oldPal",
    paloma: "paloma",
    paradise: "paradise",
    "pegu-club": "peguClub",
    penicillin: "penicillin",
    "pink-gin": "pinkGin",
    "pina-colada": "pinaColada",
    "pisco-sour": "piscoSour",
    "planter-s-punch": "plantersPunch",
    "pornstar-martini": "pornstarMartini",
    "porto-flip": "portoFlip",
    "ramos-gin-fizz": "ramosGinFizz",
    "russian-spring-punch": "russianSpringPunch",
    "rusty-nail": "rustyNail",
    sazerac: "sazerac",
    "sea-breeze": "seaBreeze",
    sidecar: "sidecar",
    spritz: "spritz",
    stinger: "stinger",
    "tequila-sunrise": "tequilaSunrise",
    tipperary: "tipperary",
    "tom-collins": "tomCollins",
    vesper: "vesper",
    "whiskey-sour": "whiskeySour",
    "white-lady": "whiteLady",
    "white-russian": "whiteRussian",
    zombie: "zombie",
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
