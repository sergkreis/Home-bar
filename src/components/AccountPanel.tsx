import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { AuthMode } from "../hooks/useAuth";
import { colors, pressed, radii, spacing } from "../theme";

type SyncStatus = "local" | "remote" | "syncing" | "error";

type AccountPanelProps = {
  authError: string | null;
  authMessage: string | null;
  authMode: AuthMode;
  authUserEmail?: string;
  barSyncError: string | null;
  barSyncStatus: SyncStatus;
  favoritesSyncError: string | null;
  favoritesSyncStatus: SyncStatus;
  isAuthLoading: boolean;
  isSupabaseConfigured: boolean;
  onResetPassword: (email: string) => Promise<void>;
  onSetAuthMode: (mode: AuthMode) => void;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignOut: () => Promise<void>;
  onSignUp: (email: string, password: string) => Promise<void>;
  onUpdatePassword: (password: string) => Promise<void>;
};

function getSyncLabel(syncStatus: SyncStatus) {
  if (syncStatus === "remote") {
    return "В аккаунте";
  }

  if (syncStatus === "syncing") {
    return "Синхронизация";
  }

  if (syncStatus === "error") {
    return "Нужна проверка";
  }

  return "На устройстве";
}

function getModeTitle(authMode: AuthMode) {
  if (authMode === "sign-up") {
    return "Создать аккаунт";
  }

  if (authMode === "reset-password") {
    return "Восстановить пароль";
  }

  if (authMode === "update-password") {
    return "Новый пароль";
  }

  return "Войти";
}

export function AccountPanel({
  authError,
  authMessage,
  authMode,
  authUserEmail,
  barSyncError,
  barSyncStatus,
  favoritesSyncError,
  favoritesSyncStatus,
  isAuthLoading,
  isSupabaseConfigured,
  onResetPassword,
  onSetAuthMode,
  onSignIn,
  onSignOut,
  onSignUp,
  onUpdatePassword,
}: AccountPanelProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const isSignUp = authMode === "sign-up";
  const isReset = authMode === "reset-password";
  const isUpdatePassword = authMode === "update-password";
  const passwordsMatch = password.length >= 6 && (!isSignUp || password === passwordRepeat);
  const canSubmit =
    !isAuthLoading &&
    (isReset
      ? email.trim().length > 0
      : isUpdatePassword
        ? password.length >= 6
        : email.trim().length > 0 && passwordsMatch);

  const submit = () => {
    if (!canSubmit) {
      return;
    }

    if (isReset) {
      onResetPassword(email.trim());
      return;
    }

    if (isUpdatePassword) {
      onUpdatePassword(password);
      return;
    }

    if (isSignUp) {
      onSignUp(email.trim(), password);
      return;
    }

    onSignIn(email.trim(), password);
  };

  if (!isSupabaseConfigured) {
    return (
      <View style={styles.accountBox}>
        <View style={styles.statusRow}>
          <View style={styles.statusCopy}>
            <Text style={styles.statusTitle}>Аккаунты не включены</Text>
            <Text style={styles.accountText}>
              Бар и избранное сохраняются на устройстве. Для production нужно задать Supabase env и выполнить SQL-схему.
            </Text>
          </View>
          <Text style={styles.localBadge}>Локально</Text>
        </View>
      </View>
    );
  }

  if (authUserEmail) {
    return (
      <View style={styles.accountBox}>
        <View style={styles.statusRow}>
          <View style={styles.statusCopy}>
            <Text style={styles.statusTitle}>{authUserEmail}</Text>
            <Text style={styles.accountText}>Бар и избранное доступны на других устройствах после входа.</Text>
          </View>
          <Text style={styles.syncBadge}>Аккаунт</Text>
        </View>

        <View style={styles.syncGrid}>
          <View style={styles.syncItem}>
            <Text style={styles.syncTitle}>Бар</Text>
            <Text style={[styles.syncState, barSyncStatus === "error" && styles.errorState]}>
              {getSyncLabel(barSyncStatus)}
            </Text>
          </View>
          <View style={styles.syncItem}>
            <Text style={styles.syncTitle}>Избранное</Text>
            <Text style={[styles.syncState, favoritesSyncStatus === "error" && styles.errorState]}>
              {getSyncLabel(favoritesSyncStatus)}
            </Text>
          </View>
        </View>

        {barSyncError ? <Text style={styles.errorText}>{barSyncError}</Text> : null}
        {favoritesSyncError ? <Text style={styles.errorText}>{favoritesSyncError}</Text> : null}
        {authMessage ? <Text style={styles.messageText}>{authMessage}</Text> : null}

        <Pressable
          accessibilityRole="button"
          onPress={onSignOut}
          style={({ pressed: isPressed }) => [
            styles.secondaryButton,
            isPressed && { opacity: pressed.opacity },
          ]}
        >
          <Text style={styles.secondaryButtonText}>{isAuthLoading ? "Выходим" : "Выйти"}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.accountBox}>
      <View style={styles.statusCopy}>
        <Text style={styles.statusTitle}>{getModeTitle(authMode)}</Text>
        <Text style={styles.accountText}>
          {isReset
            ? "Пришлем ссылку для восстановления на почту."
            : isUpdatePassword
              ? "После перехода из письма задай новый пароль."
              : "Сохрани бар и любимые рецепты в аккаунте, чтобы не терять их между устройствами."}
        </Text>
      </View>

      {!isUpdatePassword ? (
        <View style={styles.modeRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => onSetAuthMode("sign-in")}
            style={({ pressed: isPressed }) => [
              styles.modeButton,
              authMode === "sign-in" && styles.modeButtonActive,
              isPressed && { opacity: pressed.opacity },
            ]}
          >
            <Text style={[styles.modeButtonText, authMode === "sign-in" && styles.modeButtonTextActive]}>Войти</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => onSetAuthMode("sign-up")}
            style={({ pressed: isPressed }) => [
              styles.modeButton,
              authMode === "sign-up" && styles.modeButtonActive,
              isPressed && { opacity: pressed.opacity },
            ]}
          >
            <Text style={[styles.modeButtonText, authMode === "sign-up" && styles.modeButtonTextActive]}>Создать</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => onSetAuthMode("reset-password")}
            style={({ pressed: isPressed }) => [
              styles.modeButton,
              authMode === "reset-password" && styles.modeButtonActive,
              isPressed && { opacity: pressed.opacity },
            ]}
          >
            <Text style={[styles.modeButtonText, authMode === "reset-password" && styles.modeButtonTextActive]}>
              Сброс
            </Text>
          </Pressable>
        </View>
      ) : null}

      {!isUpdatePassword ? (
        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          inputMode="email"
          onChangeText={setEmail}
          placeholder="email"
          placeholderTextColor={colors.textDim}
          style={styles.input}
          value={email}
        />
      ) : null}

      {!isReset ? (
        <TextInput
          autoCapitalize="none"
          autoComplete={isSignUp ? "new-password" : "password"}
          onChangeText={setPassword}
          placeholder="пароль от 6 символов"
          placeholderTextColor={colors.textDim}
          secureTextEntry
          style={styles.input}
          value={password}
        />
      ) : null}

      {isSignUp ? (
        <TextInput
          autoCapitalize="none"
          autoComplete="new-password"
          onChangeText={setPasswordRepeat}
          placeholder="повтори пароль"
          placeholderTextColor={colors.textDim}
          secureTextEntry
          style={styles.input}
          value={passwordRepeat}
        />
      ) : null}

      {isSignUp && passwordRepeat.length > 0 && password !== passwordRepeat ? (
        <Text style={styles.errorText}>Пароли не совпадают.</Text>
      ) : null}
      {authError ? <Text style={styles.errorText}>{authError}</Text> : null}
      {authMessage ? <Text style={styles.messageText}>{authMessage}</Text> : null}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSubmit }}
        disabled={!canSubmit}
        onPress={submit}
        style={({ pressed: isPressed }) => [
          styles.primaryButton,
          !canSubmit && styles.primaryButtonDisabled,
          isPressed && canSubmit && { opacity: pressed.opacity },
        ]}
      >
        <Text style={[styles.primaryButtonText, !canSubmit && styles.primaryButtonTextDisabled]}>
          {isAuthLoading
            ? "Проверяем"
            : isReset
              ? "Отправить письмо"
              : isUpdatePassword
                ? "Сохранить пароль"
                : isSignUp
                  ? "Создать аккаунт"
                  : "Войти"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  accountBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  statusCopy: {
    flex: 1,
    gap: 4,
  },
  statusTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 23,
  },
  accountText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  localBadge: {
    color: colors.text,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.pill,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 11,
    fontWeight: "900",
  },
  syncBadge: {
    color: colors.success,
    backgroundColor: colors.successBg,
    borderRadius: radii.pill,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 11,
    fontWeight: "900",
  },
  syncGrid: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  syncItem: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    padding: spacing.md,
    gap: 4,
  },
  syncTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  syncState: {
    color: colors.textSubtle,
    fontSize: 12,
    fontWeight: "900",
  },
  errorState: {
    color: colors.danger,
  },
  modeRow: {
    flexDirection: "row",
    gap: 8,
  },
  modeButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceLight,
  },
  modeButtonActive: {
    backgroundColor: colors.surfaceDark,
    borderColor: colors.surfaceDark,
  },
  modeButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  modeButtonTextActive: {
    color: colors.textInverse,
  },
  input: {
    color: colors.text,
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceDark,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  primaryButtonDisabled: {
    backgroundColor: colors.borderStrong,
  },
  primaryButtonText: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: "900",
    textAlign: "center",
  },
  primaryButtonTextDisabled: {
    color: colors.textDim,
  },
  secondaryButton: {
    minHeight: 44,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 18,
  },
  messageText: {
    color: colors.success,
    fontSize: 13,
    lineHeight: 18,
  },
});
