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
        fill={isFavorite ? colors.accentSoft : "transparent"}
        size={iconSize}
        strokeWidth={isFavorite ? 2.7 : 2.35}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  small: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  large: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  active: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
});
