import type { ComponentType } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import BookOpen from "lucide-react-native/dist/cjs/icons/book-open";
import Martini from "lucide-react-native/dist/cjs/icons/martini";
import ShoppingBasket from "lucide-react-native/dist/cjs/icons/shopping-basket";
import Sparkles from "lucide-react-native/dist/cjs/icons/sparkles";
import Star from "lucide-react-native/dist/cjs/icons/star";
import UserRound from "lucide-react-native/dist/cjs/icons/user-round";

import { colors, pressed, radii, spacing } from "../theme";

export type AppTab = "today" | "bar" | "buy" | "favorites" | "recipes" | "account";

type IconProps = {
  color?: string;
  fill?: string;
  size?: number | string;
  strokeWidth?: number | string;
};

type TabConfig = {
  id: AppTab;
  label: string;
  accessibilityLabel?: string;
  Icon: ComponentType<IconProps>;
};

const tabs: TabConfig[] = [
  { id: "today", label: "Сегодня", Icon: Sparkles },
  { id: "bar", label: "Бар", Icon: Martini },
  { id: "buy", label: "Купить", Icon: ShoppingBasket },
  { id: "favorites", label: "Любим.", accessibilityLabel: "Любимые", Icon: Star },
  { id: "recipes", label: "Рецепты", Icon: BookOpen },
  { id: "account", label: "Аккаунт", Icon: UserRound },
];

type BottomNavProps = {
  activeTab: AppTab;
  onChangeTab: (tab: AppTab) => void;
  favoritesCount?: number;
};

export function BottomNav({ activeTab, onChangeTab, favoritesCount = 0 }: BottomNavProps) {
  return (
    <View style={styles.navWrap}>
      <View style={styles.bottomNav}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const showBadge = tab.id === "favorites" && favoritesCount > 0;
          const iconColor = isActive ? colors.text : colors.textSubtle;
          const Icon = tab.Icon;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Перейти на вкладку ${tab.accessibilityLabel ?? tab.label}`}
              accessibilityState={{ selected: isActive }}
              key={tab.id}
              onPress={() => onChangeTab(tab.id)}
              style={({ pressed: isPressed }) => [
                styles.navItem,
                isActive && styles.navItemActive,
                isPressed && { opacity: pressed.opacity },
              ]}
            >
              <View style={[styles.iconPlate, isActive && styles.iconPlateActive]}>
                <Icon
                  color={iconColor}
                  fill={tab.id === "favorites" && isActive ? colors.accentSoft : "transparent"}
                  size={19}
                  strokeWidth={isActive ? 2.7 : 2.35}
                />
                {showBadge ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{favoritesCount}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]} numberOfLines={1}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export { tabs as bottomNavTabs };

const styles = StyleSheet.create({
  navWrap: {
    backgroundColor: "rgba(244, 245, 242, 0.97)",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  bottomNav: {
    width: "100%",
    maxWidth: 920,
    alignSelf: "center",
    flexDirection: "row",
    gap: 5,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 6,
  },
  navItem: {
    flex: 1,
    minHeight: 58,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
    gap: 4,
  },
  navItemActive: {
    backgroundColor: colors.accentSoft,
  },
  iconPlate: {
    width: 28,
    height: 24,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  iconPlateActive: {
    backgroundColor: "rgba(255, 255, 255, 0.56)",
  },
  navLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: "800",
  },
  navLabelActive: {
    color: colors.text,
    fontWeight: "900",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.berry,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: colors.textInverse,
    fontSize: 10,
    fontWeight: "900",
  },
});
