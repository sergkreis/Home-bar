import { Pressable, StyleSheet } from "react-native";
import Star from "lucide-react-native/dist/cjs/icons/star";

import { colors, pressed, radii } from "../theme";

type FavoriteButtonProps = {
  isFavorite: boolean;
  onToggle: () => void;
  label: string;
  size?: "small" | "large";
};

export function FavoriteButton({ isFavorite, onToggle, label, size = "small" }: FavoriteButtonProps) {
  const isLarge = size === "large";
  const iconSize = isLarge ? 24 : 19;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        isFavorite ? `Убрать ${label} из избранного` : `Добавить ${label} в избранное`
      }
      onPress={(event) => {
        if ("stopPropagation" in event && typeof event.stopPropagation === "function") {
          event.stopPropagation();
        }
        onToggle();
      }}
      hitSlop={8}
      style={({ pressed: isPressed }) => [
        isLarge ? styles.large : styles.small,
        isFavorite && styles.active,
        isPressed && { opacity: pressed.opacity },
      ]}
    >
      <Star
        color={isFavorite ? colors.accent : colors.textSubtle}
        fill={isFavorite ? colors.accent : "transparent"}
        size={iconSize}
        strokeWidth={isFavorite ? 2.7 : 2.35}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  small: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(237, 169, 52, 0.45)",
    backgroundColor: "rgba(7, 26, 18, 0.82)",
  },
  large: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(237, 169, 52, 0.55)",
    backgroundColor: "rgba(7, 26, 18, 0.82)",
  },
  active: {
    backgroundColor: "rgba(237, 169, 52, 0.16)",
    borderColor: colors.accent,
  },
});
