import { ReactNode } from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

type SectionPanelProps = {
  title: string;
  hint?: string;
  children: ReactNode;
  style?: ViewStyle;
};

export function SectionPanel({ title, hint, children, style }: SectionPanelProps) {
  return (
    <View style={[styles.panel, style]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {hint ? <Text style={styles.sectionHint}>{hint}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: "#1b1f27",
    borderRadius: 8,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "#252d38",
  },
  sectionTitle: {
    color: "#f8fafc",
    fontSize: 21,
    fontWeight: "900",
    lineHeight: 26,
  },
  sectionHint: {
    color: "#97a3b6",
    fontSize: 14,
    lineHeight: 20,
  },
});
