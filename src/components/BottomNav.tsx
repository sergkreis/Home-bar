import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, pressed, radii, spacing } from "../theme";

export type AppTab = "today" | "bar" | "buy" | "favorites" | "recipes" | "account";

type TabConfig = {
  id: AppTab;
  label: string;
  icon: string;
};

const tabs: TabConfig[] = [
  { id: "today", label: "Сегодня", icon: "●" },
  { id: "bar", label: "Бар", icon: "◐" },
  { id: "buy", label: "Купить", icon: "+" },
  { id: "favorites", label: "Любимые", icon: "★" },
  { id: "recipes", label: "Рецепты", icon: "≡" },
  { id: "account", label: "Аккаунт", icon: "@" },
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

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Перейти на вкладку ${tab.label}`}
              accessibilityState={{ selected: isActive }}
              key={tab.id}
              onPress={() => onChangeTab(tab.id)}
              style={({ pressed: isPressed }) => [
                styles.navItem,
                isActive && styles.navItemActive,
                isPressed && { opacity: pressed.opacity },
              ]}
            >
              <View style={styles.navIconRow}>
                <Text style={[styles.navIcon, isActive && styles.navIconActive]}>{tab.icon}</Text>
                {showBadge ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{favoritesCount}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{tab.label}</Text>
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
    backgroundColor: "rgba(244, 245, 242, 0.96)",
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
    gap: 4,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 5,
  },
  navItem: {
    flex: 1,
    minHeight: 52,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
    gap: 2,
  },
  navItemActive: {
    backgroundColor: colors.surfaceDark,
  },
  navIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  navIcon: {
    color: colors.textDim,
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 16,
  },
  navIconActive: {
    color: colors.textInverse,
  },
  navLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "900",
  },
  navLabelActive: {
    color: colors.textInverse,
  },
  badge: {
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
