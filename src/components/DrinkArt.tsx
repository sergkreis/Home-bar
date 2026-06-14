import { Image, ImageSourcePropType, StyleSheet, View, ViewStyle } from "react-native";

type DrinkArtKey =
  | "oldFashioned"
  | "mojito"
  | "martini"
  | "whiskeySour"
  | "ginTonic"
  | "negroni";

type DrinkArtCocktail = {
  baseSpirit: string;
  glassName: string;
  name: string;
};

type DrinkArtProps = {
  cocktail: DrinkArtCocktail | null;
  size?: "thumb" | "hero" | "detail";
  style?: ViewStyle;
};

const sources: Record<DrinkArtKey, ImageSourcePropType> = {
  oldFashioned: require("../../assets/drinks/old-fashioned.png"),
  mojito: require("../../assets/drinks/mojito.png"),
  martini: require("../../assets/drinks/martini.png"),
  whiskeySour: require("../../assets/drinks/whiskey-sour.png"),
  ginTonic: require("../../assets/drinks/gin-tonic.png"),
  negroni: require("../../assets/drinks/negroni.png"),
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

  const name = cocktail.name.toLocaleLowerCase("ru-RU");
  const base = cocktail.baseSpirit.toLocaleLowerCase("ru-RU");
  const glass = cocktail.glassName.toLocaleLowerCase("ru-RU");

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
