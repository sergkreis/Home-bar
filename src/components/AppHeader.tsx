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
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        {rightPill ? (
          <View style={styles.savedPill}>
            <Text style={styles.savedPillText}>{rightPill}</Text>
          </View>
        ) : null}
      </View>

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
    paddingTop: 2,
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
    gap: 5,
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
    fontSize: 31,
    fontWeight: "800",
    lineHeight: 35,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 21,
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
    fontWeight: "800",
  },
  summaryStrip: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  summaryItem: {
    minWidth: 102,
    minHeight: 50,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 11,
    justifyContent: "center",
  },
  summaryValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 25,
  },
  summaryLabel: {
    color: colors.textSubtle,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
});
