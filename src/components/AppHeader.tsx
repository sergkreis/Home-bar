import { StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing } from "../theme";

type AppHeaderProps = {
  title: string;
  subtitle: string;
  stats: Array<{ value: number; label: string }>;
  rightPill?: string;
};

export function AppHeader({ title, subtitle, stats, rightPill }: AppHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.headerTextBlock}>
          <Text style={styles.eyebrow}>Домашний бар</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
        {rightPill ? (
          <View style={styles.savedPill}>
            <Text style={styles.savedPillText}>{rightPill}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {stats.length > 0 ? (
        <View style={styles.summaryStrip}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{stat.value}</Text>
              <Text style={styles.summaryLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 4,
    gap: spacing.md,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    alignItems: "flex-start",
  },
  headerTextBlock: {
    flex: 1,
    gap: 3,
  },
  eyebrow: {
    color: colors.teal,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 38,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 720,
  },
  savedPill: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  savedPillText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
  },
  summaryStrip: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  summaryItem: {
    flex: 1,
    minHeight: 72,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  summaryValue: {
    color: colors.text,
    fontSize: 25,
    fontWeight: "900",
    lineHeight: 29,
  },
  summaryLabel: {
    color: colors.textSubtle,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
});
