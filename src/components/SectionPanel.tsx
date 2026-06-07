import { ReactNode } from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

import { colors, spacing } from "../theme";

type SectionPanelProps = {
  title: string;
  hint?: string;
  children: ReactNode;
  style?: ViewStyle;
};

export function SectionPanel({ title, hint, children, style }: SectionPanelProps) {
  return (
    <View style={[styles.section, style]}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {hint ? <Text style={styles.sectionHint}>{hint}</Text> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  header: {
    gap: 4,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 27,
  },
  sectionHint: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 720,
  },
});
