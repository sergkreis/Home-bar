import type { ComponentType } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import BottleWine from "lucide-react-native/dist/cjs/icons/bottle-wine";
import ChevronDown from "lucide-react-native/dist/cjs/icons/chevron-down";
import Citrus from "lucide-react-native/dist/cjs/icons/citrus";
import Martini from "lucide-react-native/dist/cjs/icons/martini";

import { colors, fonts, pressed, radii, spacing } from "../theme";
import { DrinkMark } from "./DrinkMark";

type AppHeaderProps = {
  title: string;
  subtitle: string;
  stats: Array<{ value: number; label: string }>;
  rightPill?: string;
  onPressRightPill?: () => void;
};

type IconProps = {
  color?: string;
  size?: number | string;
  strokeWidth?: number | string;
};

const statIcons: ComponentType<IconProps>[] = [BottleWine, Martini, Citrus];

function getInitials(value: string) {
  const cleanValue = value.split("@")[0]?.replace(/[^a-zA-Zа-яА-Я0-9]+/g, " ").trim() || value;
  const parts = cleanValue.split(" ").filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return cleanValue.slice(0, 2).toUpperCase();
}

export function AppHeader({
  title,
  subtitle,
  stats,
  rightPill,
  onPressRightPill,
}: AppHeaderProps) {
  const { width } = useWindowDimensions();
  const isCompact = width < 360;
  const pillContent = rightPill ? (
    <>
        <View style={[styles.savedPillAvatar, isCompact && styles.savedPillAvatarCompact]}>
        <Text style={styles.savedPillAvatarText}>
          {rightPill === "Локально" ? "•" : getInitials(rightPill)}
        </Text>
      </View>
      <Text style={[styles.savedPillText, isCompact && styles.savedPillTextCompact]} numberOfLines={1}>{rightPill}</Text>
      <ChevronDown color={colors.paperMuted} size={17} strokeWidth={2.3} />
    </>
  ) : null;

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={[styles.brandRow, isCompact && styles.brandRowCompact]}>
          <View style={[styles.brandMark, isCompact && styles.brandMarkCompact]}>
            <DrinkMark size="small" tone="amber" variant="shaker" />
          </View>
          <View style={styles.headerTextBlock}>
            <Text
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              numberOfLines={1}
              style={[styles.brandSmall, isCompact && styles.brandSmallCompact]}
            >
              Домашний
            </Text>
            <Text style={[styles.brandLarge, isCompact && styles.brandLargeCompact]}>Бар</Text>
          </View>
        </View>
        {rightPill && onPressRightPill ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={rightPill === "Войти" ? "Открыть вход в аккаунт" : "Открыть настройки аккаунта"}
            onPress={onPressRightPill}
            style={({ pressed: isPressed }) => [
              styles.savedPill,
              isCompact && styles.savedPillCompact,
              styles.savedPillButton,
              isPressed && { opacity: pressed.opacity },
            ]}
          >
            {pillContent}
          </Pressable>
        ) : rightPill ? (
          <View style={[styles.savedPill, isCompact && styles.savedPillCompact]}>
            {pillContent}
          </View>
        ) : null}
      </View>

      <View style={styles.titleBlock}>
        <Text accessibilityRole="header" style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {stats.length > 0 ? (
        <View style={[styles.summaryStrip, isCompact && styles.summaryStripCompact]}>
          {stats.map((stat, index) => {
            const Icon = statIcons[index] ?? BottleWine;
            const tint = index === 0 ? colors.success : index === 1 ? colors.accent : colors.teal;

            return (
              <View key={stat.label} style={[styles.summarySlot, isCompact && styles.summarySlotCompact]}>
                {index > 0 ? <View style={styles.summaryDivider} /> : null}
                <View style={[styles.summaryItem, isCompact && styles.summaryItemCompact]}>
                  <Icon color={tint} size={isCompact ? 24 : 30} strokeWidth={2.1} />
                  <View style={styles.summaryCopy}>
                    <Text style={[styles.summaryValue, isCompact && styles.summaryValueCompact]}>{stat.value}</Text>
                    <Text style={[styles.summaryLabel, isCompact && styles.summaryLabelCompact]}>{stat.label}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.lg,
    paddingBottom: 2,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.borderOverlay,
    paddingBottom: spacing.md,
  },
  brandRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  brandRowCompact: {
    gap: spacing.xs,
  },
  brandMark: {
    width: 38,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  brandMarkCompact: {
    width: 30,
  },
  headerTextBlock: {
    flex: 1,
    gap: 0,
  },
  brandSmall: {
    color: colors.paperMuted,
    fontFamily: fonts.display,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  brandSmallCompact: {
    fontSize: 12,
  },
  brandLarge: {
    color: colors.paper,
    fontFamily: fonts.display,
    fontSize: 31,
    fontWeight: "800",
    lineHeight: 32,
    textTransform: "uppercase",
  },
  brandLargeCompact: {
    fontSize: 27,
    lineHeight: 28,
  },
  titleBlock: {
    gap: 7,
  },
  title: {
    color: colors.paper,
    fontFamily: fonts.display,
    fontSize: 44,
    fontWeight: "900",
    lineHeight: 49,
  },
  subtitle: {
    color: colors.textSubtle,
    fontFamily: fonts.display,
    fontSize: 19,
    lineHeight: 25,
    maxWidth: 720,
  },
  savedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surfaceTranslucent,
    borderColor: colors.accentBorderStrong,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 9,
    maxWidth: 178,
  },
  savedPillCompact: {
    gap: 6,
    maxWidth: 132,
    paddingHorizontal: 8,
  },
  savedPillButton: {
    minHeight: 48,
    justifyContent: "center",
  },
  savedPillAvatar: {
    width: 31,
    height: 31,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  savedPillAvatarCompact: {
    width: 28,
    height: 28,
  },
  savedPillAvatarText: {
    color: colors.paper,
    fontFamily: fonts.display,
    fontSize: 13,
    fontWeight: "700",
  },
  savedPillText: {
    color: colors.paper,
    flexShrink: 1,
    fontFamily: fonts.display,
    fontSize: 15,
    fontWeight: "700",
  },
  savedPillTextCompact: {
    fontSize: 14,
  },
  summaryStrip: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  summaryStripCompact: {
    flexWrap: "nowrap",
    gap: 0,
  },
  summarySlot: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  summarySlotCompact: {
    flex: 1,
    gap: 4,
  },
  summaryDivider: {
    width: 1,
    height: 38,
    backgroundColor: colors.accentBorderMedium,
  },
  summaryItem: {
    minWidth: 92,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  summaryItemCompact: {
    minWidth: 0,
    gap: 4,
  },
  summaryCopy: {
    gap: 0,
  },
  summaryValue: {
    color: colors.paper,
    fontFamily: fonts.display,
    fontSize: 29,
    fontWeight: "900",
    lineHeight: 31,
  },
  summaryValueCompact: {
    fontSize: 25,
    lineHeight: 27,
  },
  summaryLabel: {
    color: colors.paperMuted,
    fontFamily: fonts.display,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  summaryLabelCompact: {
    fontSize: 11,
  },
});
