import type { ComponentType } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Heart from "lucide-react-native/dist/cjs/icons/heart";
import Martini from "lucide-react-native/dist/cjs/icons/martini";
import Scroll from "lucide-react-native/dist/cjs/icons/scroll";
import ShieldCheck from "lucide-react-native/dist/cjs/icons/shield-check";
import ShoppingBasket from "lucide-react-native/dist/cjs/icons/shopping-basket";
import UserRound from "lucide-react-native/dist/cjs/icons/user-round";
import Wine from "lucide-react-native/dist/cjs/icons/wine";

import { colors, fonts, pressed, radii, spacing } from "../theme";

export type AppTab = "today" | "bar" | "buy" | "favorites" | "recipes" | "account" | "admin";

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
  { id: "today", label: "Сегодня", Icon: Martini },
  { id: "bar", label: "Бар", Icon: Wine },
  { id: "buy", label: "Купить", Icon: ShoppingBasket },
  { id: "favorites", label: "Любим.", accessibilityLabel: "Любимые", Icon: Heart },
  { id: "recipes", label: "Рецепты", Icon: Scroll },
  { id: "account", label: "Аккаунт", Icon: UserRound },
  { id: "admin", label: "Админ", accessibilityLabel: "Админка", Icon: ShieldCheck },
];

type BottomNavProps = {
  activeTab: AppTab;
  onChangeTab: (tab: AppTab) => void;
  favoritesCount?: number;
  showAdmin?: boolean;
};

export function BottomNav({
  activeTab,
  onChangeTab,
  favoritesCount = 0,
  showAdmin = false,
}: BottomNavProps) {
  const visibleTabs = showAdmin ? tabs : tabs.filter((tab) => tab.id !== "admin");

  return (
    <View style={styles.navWrap}>
      <View style={styles.bottomNav}>
        {visibleTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const showBadge = tab.id === "favorites" && favoritesCount > 0;
          const iconColor = isActive ? colors.paper : colors.paperMuted;
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
                  fill={tab.id === "favorites" && isActive ? colors.paper : "transparent"}
                  size={24}
                  strokeWidth={isActive ? 2.45 : 2}
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
    backgroundColor: "rgba(2, 13, 9, 0.96)",
    borderTopWidth: 1,
    borderTopColor: "rgba(237, 169, 52, 0.22)",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  bottomNav: {
    width: "100%",
    maxWidth: 920,
    alignSelf: "center",
    flexDirection: "row",
    gap: 0,
    backgroundColor: "rgba(7, 26, 18, 0.94)",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(237, 169, 52, 0.38)",
    overflow: "hidden",
  },
  navItem: {
    flex: 1,
    minHeight: 74,
    borderRightWidth: 1,
    borderRightColor: "rgba(237, 169, 52, 0.14)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
    gap: 4,
  },
  navItemActive: {
    backgroundColor: "rgba(20, 76, 52, 0.76)",
    borderColor: "rgba(135, 217, 167, 0.4)",
  },
  iconPlate: {
    width: 42,
    height: 34,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  iconPlateActive: {
    backgroundColor: "rgba(135, 217, 167, 0.08)",
    borderColor: "rgba(135, 217, 167, 0.18)",
  },
  navLabel: {
    color: colors.paperMuted,
    fontFamily: fonts.display,
    fontSize: 11,
    fontWeight: "900",
  },
  navLabelActive: {
    color: colors.paper,
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
