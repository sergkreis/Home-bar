import { Component, PropsWithChildren, ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import RefreshCcw from "lucide-react-native/dist/cjs/icons/refresh-ccw";

import { colors, fonts, pressed, radii, spacing } from "../theme";
import { reportAppError } from "../utils/errorReporting";

type AppErrorBoundaryState = {
  hasError: boolean;
};

export class AppErrorBoundary extends Component<PropsWithChildren, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: { componentStack?: string | null }) {
    reportAppError(error, errorInfo);
  }

  private reload = () => {
    if (typeof window !== "undefined" && window.location) {
      window.location.reload();
      return;
    }

    this.setState({ hasError: false });
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <View style={styles.screen}>
        <View style={styles.panel}>
          <Text style={styles.eyebrow}>Домашний бар</Text>
          <Text accessibilityRole="header" style={styles.title}>Что-то пошло не так</Text>
          <Text style={styles.text}>
            Приложение поймало ошибку и не потеряло управление. Перезагрузи экран, чтобы продолжить.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={this.reload}
            style={({ pressed: isPressed }) => [
              styles.button,
              isPressed && { opacity: pressed.opacity },
            ]}
          >
            <RefreshCcw color={colors.textOnAccent} size={18} strokeWidth={2.2} />
            <Text style={styles.buttonText}>Перезагрузить приложение</Text>
          </Pressable>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  panel: {
    width: "100%",
    maxWidth: 560,
    backgroundColor: colors.surfaceTranslucentStrong,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.accentBorderSoft,
    padding: spacing.xl,
    gap: spacing.md,
  },
  eyebrow: {
    color: colors.teal,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 39,
  },
  text: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  button: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: spacing.sm,
  },
  buttonText: {
    color: colors.textOnAccent,
    fontSize: 14,
    fontWeight: "800",
  },
});
