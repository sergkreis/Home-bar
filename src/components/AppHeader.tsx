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
          {stats.map((stat, index) => (
            <View
              key={stat.label}
              style={[styles.summaryItem, index === stats.length - 1 && styles.summaryItemLast]}
            >
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
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    alignItems: "flex-start",
  },
  headerTextBlock: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 32,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  savedPill: {
    backgroundColor: "#142922",
    borderColor: "#285840",
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  savedPillText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: "800",
  },
  summaryStrip: {
    flexDirection: "row",
    backgroundColor: "#121821",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "#2b3441",
    overflow: "hidden",
  },
  summaryItem: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: "#2b3441",
  },
  summaryItemLast: {
    borderRightWidth: 0,
  },
  summaryValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
  },
  summaryLabel: {
    color: "#91a0b4",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
});
