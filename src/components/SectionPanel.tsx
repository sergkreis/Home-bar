import { ReactNode } from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

import { colors, fonts, spacing } from "../theme";

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
    color: colors.textSubtle,
    fontFamily: fonts.display,
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 30,
  },
  sectionHint: {
    color: colors.textDim,
    fontSize: 15,
    lineHeight: 21,
    maxWidth: 720,
  },
});
