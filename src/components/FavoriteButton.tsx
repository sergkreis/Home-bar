import { Pressable, StyleSheet, Text } from "react-native";

import { colors, pressed, radii } from "../theme";

type FavoriteButtonProps = {
  isFavorite: boolean;
  onToggle: () => void;
  label: string;
  size?: "small" | "large";
};

export function FavoriteButton({ isFavorite, onToggle, label, size = "small" }: FavoriteButtonProps) {
  const isLarge = size === "large";

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
      <Text style={[isLarge ? styles.largeLabel : styles.smallLabel, isFavorite && styles.activeLabel]}>
        {isFavorite ? "★" : "☆"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  small: {
    minWidth: 36,
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
  },
  large: {
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
  },
  active: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  smallLabel: {
    color: colors.textSubtle,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 22,
  },
  largeLabel: {
    color: colors.textSubtle,
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 28,
  },
  activeLabel: {
    color: colors.accent,
  },
});
