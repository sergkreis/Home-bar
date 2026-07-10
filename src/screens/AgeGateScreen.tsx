import { Pressable, StyleSheet, Text, View } from "react-native";
import ShieldCheck from "lucide-react-native/dist/cjs/icons/shield-check";

import { colors, fonts, pressed, radii, spacing } from "../theme";

type AgeGateScreenProps = {
  onConfirm: () => void;
};

export function AgeGateScreen({ onConfirm }: AgeGateScreenProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.panel}>
        <View style={styles.iconWrap}>
          <ShieldCheck color={colors.accent} size={34} strokeWidth={1.8} />
        </View>
        <Text style={styles.eyebrow}>Домашний бар</Text>
        <Text accessibilityRole="header" style={styles.title}>Только для 18+</Text>
        <Text style={styles.text}>
          Здесь собраны рецепты алкогольных коктейлей. Подтверди возраст, чтобы продолжить.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={onConfirm}
          style={({ pressed: isPressed }) => [
            styles.button,
            isPressed && { opacity: pressed.opacity },
          ]}
        >
          <Text style={styles.buttonText}>Мне есть 18</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  panel: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: colors.surfaceTranslucentStrong,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.accentBorderSoft,
    padding: spacing.xl,
    gap: spacing.md,
  },
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accentOverlay,
    borderWidth: 1,
    borderColor: colors.accentBorder,
  },
  eyebrow: {
    color: colors.teal,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 42,
    fontWeight: "800",
    lineHeight: 48,
  },
  text: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 23,
  },
  button: {
    minHeight: 52,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: spacing.sm,
  },
  buttonText: {
    color: colors.textOnAccent,
    fontSize: 15,
    fontWeight: "800",
  },
});
